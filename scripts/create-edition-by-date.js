/**
 * 특정 날짜의 발행호를 생성하는 스크립트
 * 사용법: node scripts/create-edition-by-date.js 2026-02-07
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

// 날짜 유효성 검사
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString + 'T00:00:00Z');
  return date instanceof Date && !isNaN(date);
}

async function createEditionByDate(targetDate) {
  if (!targetDate) {
    console.error('❌ 날짜를 입력해주세요.');
    console.log('사용법: node scripts/create-edition-by-date.js YYYY-MM-DD');
    console.log('예시: node scripts/create-edition-by-date.js 2026-02-07');
    process.exit(1);
  }

  if (!isValidDate(targetDate)) {
    console.error(`❌ 잘못된 날짜 형식입니다: ${targetDate}`);
    console.log('올바른 형식: YYYY-MM-DD (예: 2026-02-07)');
    process.exit(1);
  }

  const editionId = targetDate;
  const koreanDate = formatKoreanDate(editionId);
  const title = `NEXO Daily ${koreanDate}`;
  
  console.log(`\n📅 발행호 생성: ${editionId}`);
  console.log(`   제목: ${title}\n`);

  // 날짜별 고유한 내용 생성
  const content = `
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

  const publishedAt = new Date(editionId + 'T00:00:00Z').toISOString();
  const now = new Date();
  const publishDateTime = new Date(publishedAt);
  const isPublished = publishDateTime <= now;

  const editionData = {
    edition_id: editionId,
    title: title,
    subtitle: `${koreanDate} 교육 뉴스`,
    content: content,
    thumbnail_url: '/assets/images/nexo_logo_black.png',
    category: 'news',
    published_at: publishedAt,
    is_published: isPublished,
    views: 0,
  };

  // 기존 발행호 확인
  const { data: existing } = await supabase
    .from('articles')
    .select('id, edition_id, title, content')
    .eq('edition_id', editionId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log(`⚠️  ${editionId} 발행호가 이미 존재합니다.`);
    console.log(`   기존 ID: ${existing.id}`);
    console.log(`   기존 제목: ${existing.title}`);
    console.log(`\n🔄 기존 발행호를 업데이트합니다...`);
    
    // 내용 비교
    const existingContentPreview = existing.content?.substring(0, 100) || '';
    const newContentPreview = content.substring(0, 100);
    
    if (existingContentPreview === newContentPreview) {
      console.log(`   ℹ️  내용이 동일합니다.`);
    } else {
      console.log(`   📝 내용을 업데이트합니다.`);
    }
    
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
        updated_at: new Date().toISOString(),
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
    console.log(`   내용 길이: ${updated.content?.length || 0}자`);
    console.log(`\n🌐 확인: http://localhost:3000/news/${editionId}`);
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
  console.log(`   내용 길이: ${data.content?.length || 0}자`);
  console.log(`\n🌐 확인: http://localhost:3000/news/${editionId}`);
}

const targetDate = process.argv[2];
createEditionByDate(targetDate).catch(console.error);
