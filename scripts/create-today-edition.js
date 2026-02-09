/**
 * 오늘 날짜로 첫 발행호 생성 스크립트
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

async function createTodayEdition() {
  const today = new Date();
  const editionId = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  
  console.log('📰 오늘 날짜로 발행호 생성\n');
  console.log(`발행일: ${editionId}\n`);

  // 날짜별 고유한 제목 생성
  const koreanDate = formatKoreanDate(editionId);
  const title = `NEXO Daily ${koreanDate}`;
  const subtitle = '학부모님 상담에 도움이 되는 교육 정보';

  // 기본 발행호 데이터
  const editionData = {
    title: title,
    subtitle: subtitle,
    edition_id: editionId,
    category: 'news',
    thumbnail_url: null, // 나중에 이미지 업로드 또는 자동 생성 가능
    content: `
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
    `.trim(),
    published_at: new Date(editionId + 'T09:00:00Z').toISOString(),
    is_published: true,
    views: 0,
  };

  // 기존 발행호 확인
  const { data: existing } = await supabase
    .from('articles')
    .select('id, edition_id, title')
    .eq('edition_id', editionId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log(`⚠️  ${editionId} 발행호가 이미 존재합니다.`);
    console.log(`   기존 ID: ${existing.id}`);
    console.log(`   기존 제목: ${existing.title}`);
    console.log(`\n🔄 기존 발행호를 업데이트합니다...`);
    
    // 기존 발행호 업데이트
    const { data: updated, error: updateError } = await supabase
      .from('articles')
      .update({
        title: editionData.title,
        subtitle: editionData.subtitle,
        content: editionData.content,
        thumbnail_url: editionData.thumbnail_url,
        published_at: editionData.published_at,
        is_published: editionData.is_published,
      })
      .eq('edition_id', editionId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ 발행호 업데이트 실패:', updateError.message);
      process.exit(1);
    }

    console.log('\n✅ 발행호가 성공적으로 업데이트되었습니다!');
    console.log(`   ID: ${updated.id}`);
    console.log(`   Edition ID: ${updated.edition_id}`);
    console.log(`   제목: ${updated.title}`);
    console.log(`\n🌐 확인: http://localhost:3000/news/${editionId}`);
    console.log(`   또는 메인 페이지: http://localhost:3000`);
    return;
  }

  // 새 발행호 생성
  const { data, error } = await supabase
    .from('articles')
    .insert(editionData)
    .select()
    .single();

  if (error) {
    console.error('❌ 발행호 생성 실패:', error.message);
    process.exit(1);
  }

  console.log('\n✅ 발행호가 성공적으로 생성되었습니다!');
  console.log(`   ID: ${data.id}`);
  console.log(`   Edition ID: ${data.edition_id}`);
  console.log(`   제목: ${data.title}`);
  console.log(`\n🌐 확인: http://localhost:3000/news/${editionId}`);
  console.log(`   또는 메인 페이지: http://localhost:3000`);
}

createTodayEdition().catch(console.error);


