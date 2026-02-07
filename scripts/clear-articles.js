/**
 * 기존 articles 데이터 모두 삭제 스크립트
 * 
 * 사용법:
 * node scripts/clear-articles.js
 * 
 * 주의: 모든 발행호 데이터가 영구적으로 삭제됩니다!
 */

require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function clearArticles() {
  console.log('🗑️  기존 발행호 데이터 삭제\n');
  console.log('⚠️  경고: 이 작업은 모든 발행호 데이터를 영구적으로 삭제합니다!\n');

  // 현재 데이터 확인
  const { data: currentData, error: countError } = await supabase
    .from('articles')
    .select('edition_id')
    .not('edition_id', 'is', null);

  if (countError) {
    console.error('❌ 데이터 조회 실패:', countError.message);
    rl.close();
    return;
  }

  const editionCounts = {};
  currentData.forEach(article => {
    editionCounts[article.edition_id] = (editionCounts[article.edition_id] || 0) + 1;
  });

  const totalArticles = currentData.length;
  const totalEditions = Object.keys(editionCounts).length;

  console.log('📊 현재 데이터:');
  console.log(`   총 발행호: ${totalEditions}개`);
  console.log(`   총 articles: ${totalArticles}개`);
  
  if (totalEditions > 0) {
    console.log('\n   발행호 목록:');
    Object.entries(editionCounts).forEach(([editionId, count]) => {
      console.log(`     - ${editionId}: ${count}개 articles`);
    });
  } else {
    console.log('\n   데이터가 없습니다.');
    rl.close();
    return;
  }

  console.log('\n');

  // 확인
  const confirm1 = await question('정말로 모든 데이터를 삭제하시겠습니까? (yes 입력): ');
  if (confirm1 !== 'yes') {
    console.log('❌ 취소되었습니다.');
    rl.close();
    return;
  }

  const confirm2 = await question('마지막 확인: 삭제하시겠습니까? (yes 입력): ');
  if (confirm2 !== 'yes') {
    console.log('❌ 취소되었습니다.');
    rl.close();
    return;
  }

  // 삭제 실행
  console.log('\n🗑️  삭제 중...');
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .neq('id', 0); // 모든 행 삭제

  if (deleteError) {
    console.error('❌ 삭제 실패:', deleteError.message);
    rl.close();
    return;
  }

  // 삭제 확인
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  console.log('\n✅ 삭제 완료!');
  console.log(`   남은 articles: ${count || 0}개`);
  console.log('\n📝 다음 단계:');
  console.log('   1. 새로운 발행호 추가: node scripts/add-new-edition.js');
  console.log('   2. 또는 Supabase Dashboard에서 직접 추가');

  rl.close();
}

clearArticles().catch(console.error);

