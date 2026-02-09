/**
 * 발행호 내용 비교 스크립트
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

async function compareEditions() {
  console.log('🔍 발행호 내용 비교\n');

  const dates = ['2026-02-09', '2026-02-08', '2026-02-07'];
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, edition_id, title, content')
    .in('edition_id', dates)
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

  // 각 발행호의 내용 출력
  for (const article of articles) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📅 ${article.edition_id}`);
    console.log(`제목: ${article.title}`);
    console.log(`ID: ${article.id}`);
    console.log(`\n내용 (처음 500자):`);
    console.log(`${article.content?.substring(0, 500) || '(없음)'}...`);
    console.log(`\n내용 해시: ${hashContent(article.content || '')}`);
  }

  // 내용 비교
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔍 내용 중복 확인:\n');
  
  const contentHashes = new Map();
  articles.forEach(article => {
    const hash = hashContent(article.content || '');
    if (!contentHashes.has(hash)) {
      contentHashes.set(hash, []);
    }
    contentHashes.get(hash).push(article.edition_id);
  });

  let hasDuplicates = false;
  for (const [hash, editionIds] of contentHashes.entries()) {
    if (editionIds.length > 1) {
      console.log(`⚠️  중복 발견: ${editionIds.join(', ')}`);
      console.log(`   해시: ${hash.substring(0, 20)}...`);
      hasDuplicates = true;
    }
  }

  if (!hasDuplicates) {
    console.log('✅ 중복된 내용이 없습니다.');
  }
}

function hashContent(content) {
  // 간단한 해시 함수
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

compareEditions().catch(console.error);
