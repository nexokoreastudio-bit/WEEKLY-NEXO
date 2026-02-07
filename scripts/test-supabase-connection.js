/**
 * Supabase 연결 테스트 스크립트
 * 
 * 사용법:
 * node scripts/test-supabase-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase 연결 테스트\n');
console.log('='.repeat(50));

// 환경 변수 확인
console.log('\n1️⃣ 환경 변수 확인:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
const keyPreview = SUPABASE_SERVICE_ROLE_KEY 
  ? (SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_') 
      ? SUPABASE_SERVICE_ROLE_KEY.substring(0, 30) + '...' 
      : SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...')
  : '없음';
console.log('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨 (' + keyPreview + ')' : '❌ 없음');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ 환경 변수가 설정되지 않았습니다.');
  console.error('   .env.local 파일을 확인하세요.');
  process.exit(1);
}

// Supabase 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 연결 테스트
async function testConnection() {
  try {
    console.log('\n2️⃣ 데이터베이스 연결 테스트:');
    
    // users 테이블 확인
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('   ❌ users 테이블 접근 실패:', usersError.message);
      console.error('   상세 오류:', JSON.stringify(usersError, null, 2));
      console.error('\n   가능한 원인:');
      console.error('   1. Service Role Key가 올바르지 않음');
      console.error('   2. RLS 정책 문제');
      console.error('   3. 테이블이 존재하지 않음');
      console.error('\n   확인 사항:');
      console.error('   - Supabase Dashboard > Table Editor에서 users 테이블이 보이는지 확인');
      console.error('   - Settings > API에서 service_role 키를 다시 확인');
      return false;
    }
    
    console.log('   ✅ users 테이블 접근 성공');
    
    // articles 테이블 확인
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('count', { count: 'exact', head: true });
    
    if (articlesError) {
      console.error('   ❌ articles 테이블 접근 실패:', articlesError.message);
      return false;
    }
    
    console.log('   ✅ articles 테이블 접근 성공');
    
    // posts 테이블 확인
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('count', { count: 'exact', head: true });
    
    if (postsError) {
      console.error('   ❌ posts 테이블 접근 실패:', postsError.message);
      return false;
    }
    
    console.log('   ✅ posts 테이블 접근 성공');
    
    console.log('\n3️⃣ 테이블 상태:');
    console.log('   users:', users || 0, '개');
    console.log('   articles:', articles || 0, '개');
    console.log('   posts:', posts || 0, '개');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Supabase 연결 성공!');
    console.log('='.repeat(50));
    console.log('\n🎉 모든 설정이 완료되었습니다!');
    console.log('\n다음 단계:');
    console.log('1. Next.js 프로젝트 생성 및 설정');
    console.log('2. Supabase Auth로 로그인/회원가입 구현');
    console.log('3. 커뮤니티 기능 구현');
    
    return true;
  } catch (error) {
    console.error('\n❌ 연결 테스트 실패:', error.message);
    return false;
  }
}

// 실행
testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});
