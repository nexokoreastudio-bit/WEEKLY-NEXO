/**
 * 모든 인사이트를 비발행 처리하는 스크립트
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

async function unpublishAllInsights() {
  console.log('🔄 모든 인사이트 비발행 처리 시작\n');

  // 모든 발행된 인사이트 조회
  const { data: publishedInsights, error: fetchError } = await supabase
    .from('insights')
    .select('id, title, is_published')
    .eq('is_published', true);

  if (fetchError) {
    console.error('❌ 인사이트 조회 실패:', fetchError.message);
    process.exit(1);
  }

  if (!publishedInsights || publishedInsights.length === 0) {
    console.log('✅ 발행된 인사이트가 없습니다.');
    return;
  }

  console.log(`📊 발행된 인사이트 ${publishedInsights.length}개를 찾았습니다.\n`);

  // 각 인사이트 정보 출력
  publishedInsights.forEach(insight => {
    console.log(`   - ID: ${insight.id}, 제목: ${insight.title}`);
  });

  console.log('\n🔄 비발행 처리 중...\n');

  // 모든 인사이트를 비발행 처리
  const { data: updated, error: updateError } = await supabase
    .from('insights')
    .update({ 
      is_published: false,
      updated_at: new Date().toISOString()
    })
    .eq('is_published', true)
    .select('id, title');

  if (updateError) {
    console.error('❌ 비발행 처리 실패:', updateError.message);
    process.exit(1);
  }

  console.log(`✅ ${updated?.length || 0}개의 인사이트를 비발행 처리했습니다.\n`);

  if (updated && updated.length > 0) {
    console.log('처리된 인사이트:');
    updated.forEach(insight => {
      console.log(`   - ID: ${insight.id}, 제목: ${insight.title}`);
    });
  }

  console.log('\n🌐 다음 단계:');
  console.log('   1. 개발 서버를 재시작하세요 (npm run dev)');
  console.log('   2. 브라우저 캐시를 삭제하거나 하드 리프레시하세요 (Cmd+Shift+R)');
  console.log('   3. 홈페이지와 발행호 목록에서 인사이트가 사라졌는지 확인하세요');
}

unpublishAllInsights().catch(console.error);
