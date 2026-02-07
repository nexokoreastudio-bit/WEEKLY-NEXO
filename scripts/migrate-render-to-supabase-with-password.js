/**
 * Render.com PostgreSQL → Supabase 마이그레이션 스크립트 (비밀번호 포함)
 * 
 * 이 스크립트는 사용자에게 임시 비밀번호를 생성하여 마이그레이션합니다.
 * 사용자는 나중에 비밀번호를 변경할 수 있습니다.
 * 
 * 사용법:
 * 1. .env.local 파일에 Render.com과 Supabase 연결 정보 설정
 * 2. node scripts/migrate-render-to-supabase-with-password.js
 * 
 * 옵션:
 * - DRY_RUN=true: 실제 마이그레이션 없이 시뮬레이션만 실행
 * - TEMP_PASSWORD: 모든 사용자에게 동일한 임시 비밀번호 사용
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// 환경 변수 확인
const RENDER_DATABASE_URL = process.env.RENDER_DATABASE_URL || process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.env.DRY_RUN === 'true';
const TEMP_PASSWORD = process.env.TEMP_PASSWORD || null;

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
 * 임시 비밀번호 생성
 */
function generateTempPassword() {
  if (TEMP_PASSWORD) {
    return TEMP_PASSWORD;
  }
  // 12자리 랜덤 비밀번호 생성
  return crypto.randomBytes(6).toString('hex') + '!@#';
}

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
 * Supabase Auth에 사용자 생성 (임시 비밀번호 사용)
 */
async function createSupabaseUser(member, tempPassword) {
  try {
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
        temp_password: true, // 임시 비밀번호 플래그
      },
    });
    
    if (error) throw error;
    return { user: data.user, tempPassword };
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
      role = 'teacher'; // 활성 구독자는 teacher로 설정
    }
    
    const { error } = await supabase
      .from('users')
      .insert({
        id: supabaseUserId,
        email: member.email,
        nickname: member.name,
        academy_name: member.academy_name || null,
        referrer_code: member.referrer_code || null,
        role: role,
        point: 0,
        level: 'bronze',
        created_at: member.created_at,
        updated_at: member.updated_at || member.created_at,
      });
    
    if (error) throw error;
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
  
  if (DRY_RUN) {
    console.log('⚠️  DRY_RUN 모드: 실제 마이그레이션은 수행하지 않습니다.\n');
  }
  
  try {
    // 1. Render.com에서 데이터 추출
    const members = await fetchRenderMembers();
    
    if (members.length === 0) {
      console.log('⚠️  마이그레이션할 데이터가 없습니다.');
      return;
    }
    
    // 2. 임시 비밀번호 생성 (모든 사용자에게 동일한 비밀번호 사용 옵션)
    const tempPassword = generateTempPassword();
    
    if (TEMP_PASSWORD) {
      console.log(`📝 모든 사용자에게 동일한 임시 비밀번호 사용: ${TEMP_PASSWORD}`);
    } else {
      console.log(`📝 각 사용자마다 고유한 임시 비밀번호 생성`);
    }
    
    // 3. 각 사용자에 대해 마이그레이션
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const successUsers = [];
    
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const userTempPassword = TEMP_PASSWORD || generateTempPassword();
      
      console.log(`\n[${i + 1}/${members.length}] 처리 중: ${member.email}`);
      
      if (DRY_RUN) {
        console.log(`  [DRY_RUN] 임시 비밀번호: ${userTempPassword}`);
        successUsers.push({ email: member.email, tempPassword: userTempPassword });
        successCount++;
        continue;
      }
      
      try {
        // Supabase Auth에 사용자 생성
        const { user } = await createSupabaseUser(member, userTempPassword);
        
        // public.users에 프로필 삽입
        await insertUserProfile(user.id, member);
        
        successCount++;
        successUsers.push({ email: member.email, tempPassword: userTempPassword });
        console.log(`✅ 완료: ${member.email}`);
      } catch (error) {
        errorCount++;
        errors.push({ email: member.email, error: error.message });
        console.error(`❌ 실패: ${member.email} - ${error.message}`);
      }
    }
    
    // 4. 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('📊 마이그레이션 결과');
    console.log('='.repeat(50));
    console.log(`✅ 성공: ${successCount}명`);
    console.log(`❌ 실패: ${errorCount}명`);
    
    if (successUsers.length > 0) {
      console.log('\n✅ 마이그레이션된 사용자 목록:');
      successUsers.forEach(({ email, tempPassword }) => {
        console.log(`  - ${email} (임시 비밀번호: ${tempPassword})`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ 실패한 사용자:');
      errors.forEach(({ email, error }) => {
        console.log(`  - ${email}: ${error}`);
      });
    }
    
    console.log('\n⚠️  중요 사항:');
    console.log('1. 모든 사용자는 임시 비밀번호로 로그인할 수 있습니다.');
    console.log('2. 사용자에게 임시 비밀번호를 안전하게 전달해주세요.');
    console.log('3. 첫 로그인 시 비밀번호 변경을 권장합니다.');
    
    // CSV 파일로 저장 (선택사항)
    if (successUsers.length > 0 && !DRY_RUN) {
      const fs = require('fs');
      const csv = successUsers.map(({ email, tempPassword }) => 
        `${email},${tempPassword}`
      ).join('\n');
      fs.writeFileSync('migration-results.csv', `email,temp_password\n${csv}`);
      console.log('\n📄 migration-results.csv 파일에 결과가 저장되었습니다.');
    }
    
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
