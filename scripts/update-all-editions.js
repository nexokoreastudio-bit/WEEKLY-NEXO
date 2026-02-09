/**
 * 모든 발행호의 제목과 내용을 날짜별로 고유하게 업데이트하는 스크립트
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

// 날짜를 한국어 형식으로 변환
function formatKoreanDate(dateString) {
  const date = new Date(dateString + 'T00:00:00Z');
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const weekday = date.getUTCDay();
  
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  return `${year}년 ${months[month - 1]} ${day}일 ${weekdays[weekday]}`;
}

async function updateAllEditions() {
  console.log('🔄 모든 발행호 업데이트 시작\n');

  // 모든 발행호 가져오기
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, edition_id, title, content')
    .not('edition_id', 'is', null)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (fetchError) {
    console.error('❌ 발행호 조회 실패:', fetchError.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('⚠️  업데이트할 발행호가 없습니다.');
    return;
  }

  console.log(`📰 총 ${articles.length}개의 발행호를 찾았습니다.\n`);

  let successCount = 0;
  let errorCount = 0;

  // 각 발행호 업데이트
  for (const article of articles) {
    const editionId = article.edition_id;
    const koreanDate = formatKoreanDate(editionId);
    const newTitle = `NEXO Daily ${koreanDate}`;
    
    // 날짜별 고유한 내용 생성
    const newContent = `
      <div class="space-y-6 text-gray-800">
        <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 class="text-2xl font-bold text-nexo-navy mb-4">${koreanDate} NEXO Daily</h2>
          <p class="text-gray-700 leading-relaxed">
            NEXO Daily는 학원 운영자와 입시 컨설턴트를 위한 전문 교육 정보 플랫폼입니다.
            최신 입시 정책, 교육 트렌드, 학부모 상담 팁을 제공하여 여러분의 학원 운영에 도움이 되도록 노력하겠습니다.
          </p>
        </section>
        
        <section>
          <h3 class="text-xl font-bold mb-4">주요 기능</h3>
          <ul class="space-y-2 list-disc list-inside text-gray-700">
            <li>매일 업데이트되는 교육 뉴스와 인사이트</li>
            <li>학원 운영자를 위한 실전 상담 가이드</li>
            <li>입시 데이터 분석 및 트렌드 정보</li>
            <li>커뮤니티를 통한 정보 공유</li>
          </ul>
        </section>
      </div>
    `.trim();

    // 제목이 이미 올바른지 확인
    if (article.title === newTitle) {
      console.log(`⏭️  [${editionId}] 제목은 이미 올바릅니다: ${article.title}`);
    } else {
      console.log(`🔄 [${editionId}] 제목 변경: "${article.title}" → "${newTitle}"`);
    }

    // 항상 업데이트 실행 (내용도 날짜별로 고유하게 보장)
    // 업데이트 실행
    const { data: updated, error: updateError } = await supabase
      .from('articles')
      .update({
        title: newTitle,
        content: newContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id)
      .select()
      .single();

    if (updateError) {
      console.error(`❌ [${editionId}] 업데이트 실패:`, updateError.message);
      errorCount++;
    } else {
      console.log(`✅ [${editionId}] 업데이트 완료: ${newTitle}`);
      successCount++;
    }
  }

  console.log(`\n📊 업데이트 완료:`);
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${errorCount}개`);
  console.log(`\n🌐 확인: http://localhost:3000`);
}

updateAllEditions().catch(console.error);
