/**
 * 모든 발행물 초기화 스크립트
 * 
 * 사용법:
 * node scripts/reset-all-publications.js
 * 
 * 주의: 모든 발행호(articles)와 인사이트(insights) 데이터가 영구적으로 삭제됩니다!
 */

require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('   NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
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

async function resetAllPublications() {
  console.log('\n🗑️  모든 발행물 초기화\n');
  console.log('⚠️  경고: 이 작업은 다음 데이터를 영구적으로 삭제합니다:');
  console.log('   - 모든 발행호 (articles)');
  console.log('   - 모든 인사이트 (insights)\n');

  // 현재 데이터 확인
  console.log('📊 현재 데이터 확인 중...\n');

  // Articles 확인
  const { data: articlesData, error: articlesError } = await supabase
    .from('articles')
    .select('id, edition_id, title, is_published');

  if (articlesError) {
    console.error('❌ Articles 조회 실패:', articlesError.message);
    rl.close();
    return;
  }

  const articles = articlesData || [];
  const publishedArticles = articles.filter(a => a.is_published);
  const editionCounts = {};
  
  publishedArticles.forEach(article => {
    if (article.edition_id) {
      editionCounts[article.edition_id] = (editionCounts[article.edition_id] || 0) + 1;
    }
  });

  // Insights 확인
  const { data: insightsData, error: insightsError } = await supabase
    .from('insights')
    .select('id, title, edition_id, is_published');

  if (insightsError) {
    console.error('⚠️  Insights 조회 실패 (테이블이 없을 수 있음):', insightsError.message);
  }

  const insights = insightsData || [];
  const publishedInsights = insights.filter(i => i.is_published);

  // 데이터 요약 출력
  console.log('📊 현재 데이터 요약:');
  console.log(`   Articles: 총 ${articles.length}개 (발행됨: ${publishedArticles.length}개)`);
  console.log(`   Insights: 총 ${insights.length}개 (발행됨: ${publishedInsights.length}개)`);
  
  if (Object.keys(editionCounts).length > 0) {
    console.log(`\n   발행호 목록:`);
    Object.entries(editionCounts).forEach(([editionId, count]) => {
      console.log(`     - ${editionId}: ${count}개 articles`);
    });
  }

  if (publishedInsights.length > 0) {
    console.log(`\n   발행된 인사이트:`);
    publishedInsights.slice(0, 5).forEach(insight => {
      console.log(`     - ${insight.title.substring(0, 50)}${insight.title.length > 50 ? '...' : ''}`);
    });
    if (publishedInsights.length > 5) {
      console.log(`     ... 외 ${publishedInsights.length - 5}개`);
    }
  }

  if (articles.length === 0 && insights.length === 0) {
    console.log('\n   ✅ 데이터가 없습니다. 초기화할 내용이 없습니다.');
    rl.close();
    return;
  }

  console.log('\n');

  // 확인 1
  const confirm1 = await question('정말로 모든 발행물을 삭제하시겠습니까? (yes 입력): ');
  if (confirm1 !== 'yes') {
    console.log('❌ 취소되었습니다.');
    rl.close();
    return;
  }

  // 확인 2
  const confirm2 = await question('마지막 확인: 삭제하시겠습니까? (yes 입력): ');
  if (confirm2 !== 'yes') {
    console.log('❌ 취소되었습니다.');
    rl.close();
    return;
  }

  // 삭제 실행
  console.log('\n🗑️  삭제 중...\n');

  // 1. Articles 삭제
  console.log('   Articles 삭제 중...');
  const { error: deleteArticlesError } = await supabase
    .from('articles')
    .delete()
    .neq('id', 0); // 모든 행 삭제

  if (deleteArticlesError) {
    console.error('❌ Articles 삭제 실패:', deleteArticlesError.message);
  } else {
    console.log('   ✅ Articles 삭제 완료');
  }

  // 2. Insights 삭제
  console.log('   Insights 삭제 중...');
  const { error: deleteInsightsError } = await supabase
    .from('insights')
    .delete()
    .neq('id', 0); // 모든 행 삭제

  if (deleteInsightsError) {
    // insights 테이블이 없을 수도 있음
    if (deleteInsightsError.code === 'PGRST204' || deleteInsightsError.message.includes('does not exist')) {
      console.log('   ⚠️  Insights 테이블이 없습니다 (건너뜀)');
    } else {
      console.error('❌ Insights 삭제 실패:', deleteInsightsError.message);
    }
  } else {
    console.log('   ✅ Insights 삭제 완료');
  }

  // 삭제 확인
  console.log('\n📊 삭제 확인 중...\n');

  const { count: articlesCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  let insightsCount = 0;
  try {
    const { count } = await supabase
      .from('insights')
      .select('*', { count: 'exact', head: true });
    insightsCount = count || 0;
  } catch (error) {
    // insights 테이블이 없을 수도 있음
    insightsCount = 0;
  }

  console.log('✅ 초기화 완료!');
  console.log(`   남은 Articles: ${articlesCount || 0}개`);
  console.log(`   남은 Insights: ${insightsCount || 0}개`);
  
  console.log('\n📝 다음 단계:');
  console.log('   1. 새로운 발행호 추가:');
  console.log('      - Supabase Dashboard에서 직접 추가');
  console.log('      - 또는 node scripts/add-new-edition.js 실행');
  console.log('   2. 인사이트는 /admin/insights 페이지에서 추가할 수 있습니다');
  console.log('   3. 브라우저에서 확인: http://localhost:3000\n');

  rl.close();
}

resetAllPublications().catch((error) => {
  console.error('❌ 오류 발생:', error);
  rl.close();
  process.exit(1);
});

