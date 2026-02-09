/**
 * 인사이트 발행 상태 확인 스크립트
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

async function checkInsightsStatus() {
  console.log('🔍 인사이트 발행 상태 확인\n');

  // 모든 인사이트 조회
  const { data: allInsights, error: allError } = await supabase
    .from('insights')
    .select('id, title, is_published, published_at, edition_id, created_at')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ 인사이트 조회 실패:', allError.message);
    process.exit(1);
  }

  if (!allInsights || allInsights.length === 0) {
    console.log('✅ 인사이트가 없습니다.');
    return;
  }

  console.log(`📊 총 ${allInsights.length}개의 인사이트를 찾았습니다.\n`);

  // 발행 상태별로 분류
  const published = allInsights.filter(i => i.is_published === true);
  const unpublished = allInsights.filter(i => i.is_published === false);

  console.log(`✅ 발행됨: ${published.length}개`);
  console.log(`❌ 비발행: ${unpublished.length}개\n`);

  // 발행된 인사이트 상세 정보
  if (published.length > 0) {
    console.log('📰 발행된 인사이트:');
    published.forEach(insight => {
      console.log(`   - ID: ${insight.id}`);
      console.log(`     제목: ${insight.title}`);
      console.log(`     발행일: ${insight.published_at || '없음'}`);
      console.log(`     에디션: ${insight.edition_id || '일반'}`);
      console.log('');
    });
  }

  // 비발행 인사이트 상세 정보
  if (unpublished.length > 0) {
    console.log('⏸️  비발행 인사이트:');
    unpublished.forEach(insight => {
      console.log(`   - ID: ${insight.id}`);
      console.log(`     제목: ${insight.title}`);
      console.log(`     발행일: ${insight.published_at || '없음'}`);
      console.log(`     에디션: ${insight.edition_id || '일반'}`);
      console.log('');
    });
  }

  // 발행 상태별 쿼리 테스트
  console.log('\n🧪 쿼리 테스트:\n');

  // is_published = true만 조회
  const { data: publishedOnly, error: publishedError } = await supabase
    .from('insights')
    .select('id, title, is_published')
    .eq('is_published', true);

  if (publishedError) {
    console.error('❌ 발행된 인사이트 조회 실패:', publishedError.message);
  } else {
    console.log(`✅ is_published = true 조회 결과: ${publishedOnly?.length || 0}개`);
    if (publishedOnly && publishedOnly.length > 0) {
      publishedOnly.forEach(i => {
        console.log(`   - ${i.title} (ID: ${i.id})`);
      });
    }
  }
}

checkInsightsStatus().catch(console.error);
