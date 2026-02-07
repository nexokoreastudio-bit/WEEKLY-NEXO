/**
 * Supabase 연결 상세 테스트
 * Service Role Key 형식 및 접근 권한 확인
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase 상세 연결 테스트\n');
console.log('='.repeat(60));

// 환경 변수 확인
console.log('\n1️⃣ 환경 변수:');
console.log('   URL:', SUPABASE_URL);
console.log('   Key 길이:', SUPABASE_SERVICE_ROLE_KEY?.length || 0);
console.log('   Key 시작:', SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || '없음');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// 키 형식 확인
console.log('\n2️⃣ 키 형식 확인:');
if (SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_')) {
  console.log('   ⚠️  sb_secret_ 형식 감지');
  console.log('   💡 이 형식은 Supabase의 새로운 키 형식일 수 있습니다.');
  console.log('   💡 Settings > API에서 "service_role" 키를 다시 확인하세요.');
  console.log('   💡 JWT 형식(eyJhbGci...)의 키를 사용해야 할 수 있습니다.');
} else if (SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJhbGci')) {
  console.log('   ✅ JWT 형식 감지 (올바른 형식)');
} else {
  console.log('   ⚠️  알 수 없는 형식');
}

// Supabase 클라이언트 생성
console.log('\n3️⃣ 클라이언트 생성:');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('   ✅ 클라이언트 생성 완료');

// 연결 테스트
async function test() {
  console.log('\n4️⃣ 데이터베이스 접근 테스트:');
  
  // users 테이블 접근 시도
  console.log('\n   📊 users 테이블 접근 시도...');
  const { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('   ❌ 오류 발생!');
    console.error('   메시지:', error.message);
    console.error('   코드:', error.code);
    console.error('   힌트:', error.hint || '없음');
    console.error('   상세:', JSON.stringify(error, null, 2));
    
    console.log('\n   🔍 가능한 해결 방법:');
    console.log('   1. Supabase Dashboard > Settings > API 이동');
    console.log('   2. "Secret keys" 섹션에서 "service_role" 찾기');
    console.log('   3. "Reveal" 버튼 클릭하여 전체 키 표시');
    console.log('   4. JWT 형식(eyJhbGci...로 시작)의 키인지 확인');
    console.log('   5. 전체 키를 복사하여 .env.local에 다시 붙여넣기');
    
    return false;
  } else {
    console.log('   ✅ 성공!');
    console.log('   레코드 수:', count || 0);
    return true;
  }
}

test().then((success) => {
  if (success) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ 모든 테스트 통과!');
    console.log('='.repeat(60));
    console.log('\n🎉 Supabase 연결이 정상적으로 작동합니다!');
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('❌ 테스트 실패');
    console.log('='.repeat(60));
    console.log('\n💡 위의 해결 방법을 참고하세요.');
  }
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('\n❌ 예외 발생:', err.message);
  console.error(err.stack);
  process.exit(1);
});
