/**
 * Render.com PostgreSQL → Supabase 마이그레이션 스크립트
 * 
 * 사용법:
 * 1. .env 파일에 Render.com과 Supabase 연결 정보 설정
 * 2. node scripts/migrate-render-to-supabase.js
 * 
 * 주의사항:
 * - Supabase Auth에 사용자를 생성하므로 비밀번호가 필요합니다
 * - 기존 비밀번호 해시는 사용할 수 없으므로, 사용자에게 비밀번호 재설정을 요청해야 합니다
 * - 또는 임시 비밀번호를 생성하여 이메일로 전송하는 방식 사용
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 확인
const RENDER_DATABASE_URL = process.env.RENDER_DATABASE_URL || process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!RENDER_DATABASE_URL) {
  console.error('❌ RENDER_DATABASE_URL 또는 DATABASE_URL 환경 변수가 필요합니다.');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY 환경 변수가 필요합니다.');
  process.exit(1);
}

// Render.com PostgreSQL 연결
const renderPool = new Pool({
  connectionString: RENDER_DATABASE_URL,
  ssl: RENDER_DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false,
});

// Supabase 클라이언트 (Service Role Key 사용)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Render.com members 테이블에서 모든 사용자 데이터 추출
 */
async function fetchRenderMembers() {
  console.log('📥 Render.com에서 회원 데이터 추출 중...');
  
  const client = await renderPool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id,
        email,
        password_hash,
        name,
        academy_name,
        phone,
        referrer_code,
        subscription_status,
        created_at,
        updated_at
      FROM members
      ORDER BY created_at ASC
    `);
    
    console.log(`✅ ${result.rows.length}명의 회원 데이터를 추출했습니다.`);
    return result.rows;
  } catch (error) {
    console.error('❌ Render.com 데이터 추출 실패:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Supabase Auth에 사용자 생성 및 비밀번호 설정
 * 
 * 주의: Supabase는 bcrypt 해시를 직접 사용할 수 없으므로,
 * 임시 비밀번호를 생성하거나 사용자에게 비밀번호 재설정을 요청해야 합니다.
 */
async function createSupabaseUser(member, options = {}) {
  const { skipPasswordReset = false, tempPassword = null } = options;
  
  try {
    // 방법 1: 임시 비밀번호로 사용자 생성 (비밀번호 재설정 필요)
    if (tempPassword) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: member.email,
        password: tempPassword,
        email_confirm: true, // 이메일 인증 건너뛰기
        user_metadata: {
          name: member.name,
          academy_name: member.academy_name || '',
          phone: member.phone || '',
          migrated_from_render: true,
          render_id: member.id,
        },
      });
      
      if (error) throw error;
      return data.user;
    }
    
    // 방법 2: 비밀번호 없이 사용자 생성 (사용자가 비밀번호 재설정 링크 클릭)
    const { data, error } = await supabase.auth.admin.createUser({
      email: member.email,
      email_confirm: false, // 이메일 인증 필요
      user_metadata: {
        name: member.name,
        academy_name: member.academy_name || '',
        phone: member.phone || '',
        migrated_from_render: true,
        render_id: member.id,
      },
    });
    
    if (error) throw error;
    
    // 비밀번호 재설정 링크 생성
    if (!skipPasswordReset) {
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: member.email,
      });
      
      if (resetError) {
        console.warn(`⚠️  ${member.email}의 비밀번호 재설정 링크 생성 실패:`, resetError.message);
      }
    }
    
    return data.user;
  } catch (error) {
    console.error(`❌ Supabase 사용자 생성 실패 (${member.email}):`, error.message);
    throw error;
  }
}

/**
 * public.users 테이블에 프로필 데이터 삽입
 */
async function insertUserProfile(supabaseUserId, member) {
  try {
    // subscription_status를 role로 변환
    let role = 'user';
    if (member.subscription_status === 'active') {
      role = 'teacher'; // 활성 구독자는 teacher로 설정 (필요시 수정)
    }
    
    const { error } = await supabase
      .from('users')
      .insert({
        id: supabaseUserId,
        email: member.email,
        nickname: member.name, // name -> nickname
        academy_name: member.academy_name || null,
        referrer_code: member.referrer_code || null,
        role: role,
        point: 0, // 초기 포인트
        level: 'bronze', // 초기 레벨
        created_at: member.created_at,
        updated_at: member.updated_at || member.created_at,
      });
    
    if (error) throw error;
    
    console.log(`✅ 프로필 생성 완료: ${member.email}`);
  } catch (error) {
    console.error(`❌ 프로필 생성 실패 (${member.email}):`, error.message);
    throw error;
  }
}

/**
 * 마이그레이션 실행
 */
async function migrate() {
  console.log('🚀 Render.com → Supabase 마이그레이션 시작\n');
  
  try {
    // 1. Render.com에서 데이터 추출
    const members = await fetchRenderMembers();
    
    if (members.length === 0) {
      console.log('⚠️  마이그레이션할 데이터가 없습니다.');
      return;
    }
    
    // 2. 각 사용자에 대해 마이그레이션
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      console.log(`\n[${i + 1}/${members.length}] 처리 중: ${member.email}`);
      
      try {
        // Supabase Auth에 사용자 생성
        // 주의: 비밀번호는 마이그레이션할 수 없으므로 임시 비밀번호 또는 재설정 링크 필요
        const supabaseUser = await createSupabaseUser(member, {
          skipPasswordReset: false, // 비밀번호 재설정 링크 생성
        });
        
        // public.users에 프로필 삽입
        await insertUserProfile(supabaseUser.id, member);
        
        successCount++;
        console.log(`✅ 완료: ${member.email}`);
      } catch (error) {
        errorCount++;
        errors.push({ email: member.email, error: error.message });
        console.error(`❌ 실패: ${member.email} - ${error.message}`);
      }
    }
    
    // 3. 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('📊 마이그레이션 결과');
    console.log('='.repeat(50));
    console.log(`✅ 성공: ${successCount}명`);
    console.log(`❌ 실패: ${errorCount}명`);
    
    if (errors.length > 0) {
      console.log('\n❌ 실패한 사용자:');
      errors.forEach(({ email, error }) => {
        console.log(`  - ${email}: ${error}`);
      });
    }
    
    console.log('\n⚠️  중요 사항:');
    console.log('1. 모든 사용자는 비밀번호 재설정 링크를 이메일로 받게 됩니다.');
    console.log('2. 사용자에게 비밀번호 재설정을 안내해주세요.');
    console.log('3. 또는 Supabase Dashboard에서 일괄 비밀번호 재설정 링크를 생성할 수 있습니다.');
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await renderPool.end();
  }
}

// 실행
if (require.main === module) {
  migrate().catch((error) => {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  });
}

module.exports = { migrate, fetchRenderMembers, createSupabaseUser, insertUserProfile };
