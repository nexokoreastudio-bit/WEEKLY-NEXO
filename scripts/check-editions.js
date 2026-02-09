/**
 * 발행호 데이터 확인 스크립트
 */

require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');

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

async function checkEditions() {
  console.log('🔍 발행호 데이터 확인\n');

  // 모든 발행호 가져오기
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, edition_id, title, content, published_at, is_published')
    .not('edition_id', 'is', null)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ 발행호 조회 실패:', error.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('⚠️  발행호가 없습니다.');
    return;
  }

  console.log(`📰 총 ${articles.length}개의 발행호를 찾았습니다.\n`);

  // edition_id별로 그룹화
  const editionsMap = new Map();
  articles.forEach(article => {
    const editionId = article.edition_id;
    if (!editionsMap.has(editionId)) {
      editionsMap.set(editionId, []);
    }
    editionsMap.get(editionId).push(article);
  });

  // 각 발행호별로 출력
  for (const [editionId, editionArticles] of editionsMap.entries()) {
    console.log(`\n📅 ${editionId} (${editionArticles.length}개 article)`);
    
    editionArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ID: ${article.id}`);
      console.log(`      제목: ${article.title}`);
      console.log(`      발행: ${article.is_published ? '✅' : '❌'}`);
      const contentPreview = article.content ? article.content.substring(0, 50).replace(/\s+/g, ' ') : '(없음)';
      console.log(`      내용 미리보기: ${contentPreview}...`);
      console.log('');
    });

    // 중복 확인
    const titles = editionArticles.map(a => a.title);
    const uniqueTitles = new Set(titles);
    if (uniqueTitles.size < titles.length) {
      console.log(`   ⚠️  경고: 같은 제목이 ${titles.length - uniqueTitles.size + 1}개 있습니다!`);
    }
  }

  // 중복된 제목이 있는 발행호 찾기
  console.log('\n🔍 중복 확인:');
  const titleCounts = new Map();
  articles.forEach(article => {
    const count = titleCounts.get(article.title) || 0;
    titleCounts.set(article.title, count + 1);
  });

  let hasDuplicates = false;
  for (const [title, count] of titleCounts.entries()) {
    if (count > 1) {
      console.log(`   ⚠️  "${title}" - ${count}개 발행호에서 사용됨`);
      hasDuplicates = true;
    }
  }

  if (!hasDuplicates) {
    console.log('   ✅ 중복된 제목이 없습니다.');
  }
}

checkEditions().catch(console.error);
