require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 4일치 일별 발행물 데이터
// 이미지 출처: Pexels (https://www.pexels.com) - 무료 사용 가능
const DAILY_EDITIONS = [
  {
    date: '2026-02-05',
    title: "📈 입시 전략: '사탐런'과 과목 선택의 딜레마",
    subtitle: "자연계열 상위권 학생들의 사회탐구 응시 비율이 60%에 육박하고 있습니다. 과목 선택 전략이 필수입니다.",
    thumbnail_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop', // 학생 공부 이미지
    content: `<div class="space-y-8 text-gray-800">
      <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center gap-2 mb-4">
          <span class="bg-nexo-navy text-white text-xs px-2 py-1 rounded font-bold">NEXO Daily</span>
          <h3 class="text-xl font-bold text-nexo-navy m-0">2026년 2월 5일 - 입시 전략 특집</h3>
        </div>
        <p class="text-gray-700 leading-relaxed mb-4">
          반갑습니다. <strong>NEXO Daily</strong>입니다.<br>
          오늘은 <strong>'사탐런(사회탐구 쏠림)'</strong> 현상과 과목 선택 전략에 대해 집중적으로 다뤄보겠습니다.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          📈 입시 전략: '사탐런'과 과목 선택의 딜레마
        </h2>
        <p class="text-sm text-gray-500 mb-4">자연계열 상위권 학생들의 사회탐구 응시 비율이 60%에 육박하고 있습니다. 과목 선택 전략이 필수입니다.</p>
        <ul class="space-y-2 list-disc list-inside text-gray-700">
          <li><a href="https://www.newspim.com/news/view/20260204000072" target="_blank" class="hover:underline text-nexo-cyan">사탐 응시 비율 60% 육박...'사탐런' 가속화에 "맞는 과목 선택이 최우선 전략"</a></li>
          <li><a href="https://www.enewstoday.co.kr/news/articleView.html?idxno=2390467" target="_blank" class="hover:underline text-nexo-cyan">국어·영어의 역습과 사탐런 가속화, '롤러코스터' 수능을 돌파하는 전략</a></li>
          <li><a href="https://www.newspim.com/news/view/20260204000046" target="_blank" class="hover:underline text-nexo-cyan">수험생 67% "수능 성적 기대 못 미쳤다"… 그러나 상향지원 '승부수'</a></li>
          <li><a href="https://www.hankyung.com/article/202602043518i" target="_blank" class="hover:underline text-nexo-cyan">2028 대입 개편의 트리거, 영어 교육의 '판'이 바뀐다</a></li>
        </ul>
      </section>
    </div>`,
  },
  {
    date: '2026-02-06',
    title: "👨‍⚕️ 의대 증원 & 지역인재 전형",
    subtitle: "내년 의대 증원 규모 결정이 2월 중 이루어질 예정입니다. 지방 유학 열풍과 지역인재 전형의 명암을 확인하세요.",
    thumbnail_url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=400&fit=crop', // 의료/의대 관련 이미지
    content: `<div class="space-y-8 text-gray-800">
      <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center gap-2 mb-4">
          <span class="bg-nexo-navy text-white text-xs px-2 py-1 rounded font-bold">NEXO Daily</span>
          <h3 class="text-xl font-bold text-nexo-navy m-0">2026년 2월 6일 - 의대 증원 특집</h3>
        </div>
        <p class="text-gray-700 leading-relaxed mb-4">
          반갑습니다. <strong>NEXO Daily</strong>입니다.<br>
          오늘은 <strong>의대 증원</strong>과 지역인재 전형에 대한 최신 동향을 전해드립니다.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          👨‍⚕️ 의대 증원 & 지역인재 전형
        </h2>
        <p class="text-sm text-gray-500 mb-4">내년 의대 증원 규모 결정이 2월 중 이루어질 예정입니다. 지방 유학 열풍과 지역인재 전형의 명암을 확인하세요.</p>
        <ul class="space-y-2 list-disc list-inside text-gray-700">
          <li><a href="https://www.news1.kr/bio/welfare-medical/6057294" target="_blank" class="hover:underline text-nexo-cyan">내년 의대증원 2월 결정, 580~800명 거론…입시 판도에도 영향</a></li>
          <li><a href="https://www.cctoday.co.kr/news/articleView.html?idxno=2225175" target="_blank" class="hover:underline text-nexo-cyan">지역인재전형보다 매력적…입시 셈법 따지기 분주</a></li>
          <li><a href="https://www.nocutnews.co.kr/news/6467049" target="_blank" class="hover:underline text-nexo-cyan">"의대 가려면 이사부터" 지역의사제, 의사 되는 지름길?</a></li>
          <li><a href="https://www.tjb.co.kr/news05/bodo/view/id/94244" target="_blank" class="hover:underline text-nexo-cyan">"의대 가려고 충청권 간다?"..의대 입시 꼼수 우려도</a></li>
        </ul>
      </section>
    </div>`,
  },
  {
    date: '2026-02-07',
    title: "🏫 교육 정책 변화 & 고교학점제",
    subtitle: "AI 시대에 맞춘 입시 변화와 학교폭력 기록 관리의 중요성이 대두되고 있습니다.",
    thumbnail_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop', // 교육/학교 관련 이미지
    content: `<div class="space-y-8 text-gray-800">
      <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center gap-2 mb-4">
          <span class="bg-nexo-navy text-white text-xs px-2 py-1 rounded font-bold">NEXO Daily</span>
          <h3 class="text-xl font-bold text-nexo-navy m-0">2026년 2월 7일 - 교육 정책 특집</h3>
        </div>
        <p class="text-gray-700 leading-relaxed mb-4">
          반갑습니다. <strong>NEXO Daily</strong>입니다.<br>
          오늘은 <strong>교육 정책 변화</strong>와 고교학점제에 대한 최신 정보를 전해드립니다.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          🏫 교육 정책 변화 & 고교학점제
        </h2>
        <p class="text-sm text-gray-500 mb-4">AI 시대에 맞춘 입시 변화와 학교폭력 기록 관리의 중요성이 대두되고 있습니다.</p>
        <ul class="space-y-2 list-disc list-inside text-gray-700">
          <li><a href="https://www.newsis.com/view/NISX20260205_0003504001" target="_blank" class="hover:underline text-nexo-cyan">임태희 "AI 0.1초 시대에 지식 암기? 입시 달라져야"</a></li>
          <li><a href="https://edu.chosun.com/site/data/html_dir/2026/02/03/2026020380059.html" target="_blank" class="hover:underline text-nexo-cyan">고교학점제 이수 기준 완화… 현장 적용 포인트는?</a></li>
          <li><a href="https://www.lawissue.co.kr/view.php?ud=2026020416051218466cf2d78c68_12" target="_blank" class="hover:underline text-nexo-cyan">학교폭력, 이제 형사 재판보다 무섭다… '기록 관리' 실패가 입시·취업까지 좌우</a></li>
          <li><a href="https://www.globalepic.co.kr/view.php?ud=2026020509554289886cf2d78c68_29" target="_blank" class="hover:underline text-nexo-cyan">학폭 가해자, 2호 경미한 처분받아도 대학가기 어렵다</a></li>
        </ul>
      </section>
    </div>`,
  },
  // 2026-02-08 발행호는 내일 추가 예정
  // {
  //   date: '2026-02-08',
  //   title: "💡 학부모님 상담용 인사이트",
  //   subtitle: "상담 시 학부모님께 넌지시 건넬 수 있는 최신 트렌드와 팁입니다.",
  //   thumbnail_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop', // 상담/커뮤니케이션 이미지
  //   content: `<div class="space-y-8 text-gray-800">
  //     <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
  //       <div class="flex items-center gap-2 mb-4">
  //         <span class="bg-nexo-navy text-white text-xs px-2 py-1 rounded font-bold">NEXO Daily</span>
  //         <h3 class="text-xl font-bold text-nexo-navy m-0">2026년 2월 8일 - 상담 인사이트 특집</h3>
  //       </div>
  //       <p class="text-gray-700 leading-relaxed mb-4">
  //         반갑습니다. <strong>NEXO Daily</strong>입니다.<br>
  //         오늘은 학부모님 상담 시 활용할 수 있는 <strong>최신 트렌드와 팁</strong>을 전해드립니다.
  //       </p>
  //     </section>

  //     <section>
  //       <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
  //         💡 학부모님 상담용 인사이트
  //       </h2>
  //       <p class="text-sm text-gray-500 mb-4">상담 시 학부모님께 넌지시 건넬 수 있는 최신 트렌드와 팁입니다.</p>
  //       <ul class="space-y-2 list-disc list-inside text-gray-700">
  //         <li><a href="https://www.kmib.co.kr/article/view.asp?arcid=0029339099" target="_blank" class="hover:underline text-nexo-cyan">'서울대' 이부진 장남, 대치동서 입시팁 전수…"스마트폰 단절"</a></li>
  //         <li><a href="https://www.inews24.com/view/1934180" target="_blank" class="hover:underline text-nexo-cyan">서울대 입시 뜻밖의 결과⋯외고·과고 정시합격 '반토막'</a></li>
  //         <li><a href="https://www.busan.com/view/busan/view.php?code=2026020217504070755" target="_blank" class="hover:underline text-nexo-cyan">예비 고3 전력질주보다 완주 목표로… 속도보다 리듬이 성적 만든다</a></li>
  //         <li><a href="https://www.donga.com/news/Society/article/all/20260204/133278967/1" target="_blank" class="hover:underline text-nexo-cyan">초등 20만원·중고교 30만원…"서울 신입생 입학준비금 신청하세요"</a></li>
  //       </ul>
  //     </section>
  //   </div>`,
  // },
];

async function seedDailyEditions() {
  console.log('🚀 NEXO Daily 일별 발행물 데이터 삽입 시작\n');

  for (const edition of DAILY_EDITIONS) {
    // 기존 데이터 확인
    const { data: existingData, error: checkError } = await supabase
      .from('articles')
      .select('id, title, edition_id')
      .eq('edition_id', edition.date);

    if (checkError) {
      console.error(`❌ ${edition.date} 기존 데이터 확인 실패:`, checkError.message);
      continue;
    }

    if (existingData && existingData.length > 0) {
      console.log(`⚠️  이미 ${edition.date} 발행호가 존재합니다:`);
      existingData.forEach(article => {
        console.log(`   - ID: ${article.id}, 제목: ${article.title}`);
      });
      
      console.log(`\n🗑️  기존 데이터 삭제 중...`);
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('edition_id', edition.date);

      if (deleteError) {
        console.error(`❌ 기존 데이터 삭제 실패:`, deleteError.message);
        continue;
      }

      console.log(`✅ 기존 데이터 ${existingData.length}개 삭제 완료\n`);
    }

    // 새 일별 발행물 데이터 삽입
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: edition.title,
        subtitle: edition.subtitle,
        content: edition.content,
        category: 'news',
        thumbnail_url: edition.thumbnail_url || '/assets/images/nexo_logo_black.png',
        edition_id: edition.date,
        published_at: `${edition.date}T09:00:00Z`,
        is_published: true,
        views: 0,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ ${edition.date} 발행물 데이터 삽입 실패:`, error.message);
    } else {
      console.log(`✅ ${edition.date} 발행물 데이터 삽입 완료!`);
      console.log(`   제목: ${data.title}`);
      console.log(`   URL: http://localhost:3001/news/${data.edition_id}\n`);
    }
  }

  console.log('🎉 모든 일별 발행물 데이터 삽입 완료!');
}

seedDailyEditions();

