/**
 * 간단한 Supabase 연결 테스트
 * 더 자세한 오류 정보 출력
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase 간단 연결 테스트\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

console.log('✅ 환경 변수 확인 완료');
console.log('   URL:', SUPABASE_URL);
console.log('   Key:', SUPABASE_SERVICE_ROLE_KEY.substring(0, 30) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function test() {
  console.log('\n📊 테이블 접근 테스트:\n');
  
  // 1. users 테이블
  console.log('1. users 테이블 테스트...');
  const { data: usersData, error: usersError, count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  if (usersError) {
    console.error('   ❌ 오류:', usersError.message);
    console.error('   코드:', usersError.code);
    console.error('   상세:', JSON.stringify(usersError, null, 2));
  } else {
    console.log('   ✅ 성공! (레코드 수:', usersCount || 0, ')');
  }
  
  // 2. SQL로 직접 확인
  console.log('\n2. SQL 쿼리 테스트...');
  const { data: sqlData, error: sqlError } = await supabase
    .rpc('exec_sql', { query: 'SELECT COUNT(*) FROM users' })
    .catch(() => {
      // RPC 함수가 없을 수 있으므로 무시
      return { data: null, error: null };
    });
  
  // 3. 간단한 SELECT 시도
  console.log('\n3. 간단한 SELECT 테스트...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('   ❌ 오류:', error.message);
      console.error('   코드:', error.code);
      console.error('   힌트:', error.hint);
      console.error('   상세:', JSON.stringify(error, null, 2));
    } else {
      console.log('   ✅ 성공!');
    }
  } catch (err) {
    console.error('   ❌ 예외 발생:', err.message);
  }
  
  // 4. 테이블 목록 확인
  console.log('\n4. 테이블 존재 여부 확인...');
  console.log('   💡 Supabase Dashboard > Table Editor에서 다음 테이블들이 보이는지 확인하세요:');
  console.log('      - users');
  console.log('      - articles');
  console.log('      - posts');
  console.log('      - comments');
  console.log('      - likes');
  console.log('      - resources');
  console.log('      - point_logs');
  console.log('      - downloads');
  
  console.log('\n📝 다음 단계:');
  console.log('   1. Supabase Dashboard > Table Editor에서 테이블 확인');
  console.log('   2. 테이블이 없다면 SQL Editor에서 schema.sql 실행');
  console.log('   3. 테이블이 있다면 RLS 정책 확인');
}

test().catch(err => {
  console.error('\n❌ 테스트 실패:', err);
  process.exit(1);
});
