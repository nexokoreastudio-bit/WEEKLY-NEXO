/**
 * NEXO Weekly 창간호(Vol. 1) 데이터 삽입 스크립트
 * 발행일: 2026-02-05
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const VOL1_CONTENT = `<div class="space-y-10 text-gray-800">
  <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
    <div class="flex items-center gap-2 mb-4">
      <span class="bg-nexo-navy text-white text-xs px-2 py-1 rounded font-bold">NEXO Insight</span>
      <h3 class="text-xl font-bold text-nexo-navy m-0">창간호: 변화의 파도, 넥소와 함께 넘으십시오.</h3>
    </div>
    <p class="text-gray-700 leading-relaxed mb-4">
      반갑습니다. <strong>NEXO Weekly 창간호</strong>입니다.<br>
      2026년 2월, 교육 현장은 그 어느 때보다 뜨겁습니다. <strong>'사탐런(사회탐구 쏠림)'</strong> 현상은 가속화되고 있고, <strong>의대 증원</strong> 규모 결정이 임박하며 입시 판도가 요동치고 있습니다.<br><br>
      불확실한 입시 환경에서 학부모님들이 가장 의지하는 것은 <strong>'데이터에 기반한 정확한 상담'</strong>입니다. 
      넥소 전자칠판은 단순한 판서 도구를 넘어, 복잡한 입시 데이터를 시각적으로 보여주고 상담의 퀄리티를 높이는 파트너가 되겠습니다.
    </p>
  </section>

  <hr class="border-gray-200">

  <section>
    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
      🔥 2월 1주 핵심 교육 뉴스 큐레이션
    </h2>
    
    <div class="mb-8">
      <h3 class="text-lg font-bold text-nexo-cyan mb-3 border-l-4 border-nexo-cyan pl-3">📈 입시 전략: '사탐런'과 과목 선택의 딜레마</h3>
      <p class="text-sm text-gray-500 mb-3">자연계열 상위권 학생들의 사회탐구 응시 비율이 60%에 육박하고 있습니다. 과목 선택 전략이 필수입니다.</p>
      <ul class="space-y-2 list-disc list-inside text-gray-700 hover:text-nexo-navy">
        <li><a href="https://www.newspim.com/news/view/20260204000072" target="_blank" class="hover:underline">사탐 응시 비율 60% 육박...'사탐런' 가속화에 "맞는 과목 선택이 최우선 전략"</a></li>
        <li><a href="https://www.enewstoday.co.kr/news/articleView.html?idxno=2390467" target="_blank" class="hover:underline">국어·영어의 역습과 사탐런 가속화, '롤러코스터' 수능을 돌파하는 전략</a></li>
        <li><a href="https://www.newspim.com/news/view/20260204000046" target="_blank" class="hover:underline">수험생 67% "수능 성적 기대 못 미쳤다"… 그러나 상향지원 '승부수'</a></li>
        <li><a href="https://www.hankyung.com/article/202602043518i" target="_blank" class="hover:underline">2028 대입 개편의 트리거, 영어 교육의 '판'이 바뀐다</a></li>
      </ul>
    </div>

    <div class="mb-8">
      <h3 class="text-lg font-bold text-nexo-cyan mb-3 border-l-4 border-nexo-cyan pl-3">👨‍⚕️ 의대 증원 & 지역인재 전형</h3>
      <p class="text-sm text-gray-500 mb-3">내년 의대 증원 규모 결정이 2월 중 이루어질 예정입니다. 지방 유학 열풍과 지역인재 전형의 명암을 확인하세요.</p>
      <ul class="space-y-2 list-disc list-inside text-gray-700">
        <li><a href="https://www.news1.kr/bio/welfare-medical/6057294" target="_blank" class="hover:underline">내년 의대증원 2월 결정, 580~800명 거론…입시 판도에도 영향</a></li>
        <li><a href="https://www.cctoday.co.kr/news/articleView.html?idxno=2225175" target="_blank" class="hover:underline">지역인재전형보다 매력적…입시 셈법 따지기 분주</a></li>
        <li><a href="https://www.nocutnews.co.kr/news/6467049" target="_blank" class="hover:underline">"의대 가려면 이사부터" 지역의사제, 의사 되는 지름길?</a></li>
        <li><a href="https://www.tjb.co.kr/news05/bodo/view/id/94244" target="_blank" class="hover:underline">"의대 가려고 충청권 간다?"..의대 입시 꼼수 우려도</a></li>
      </ul>
    </div>

    <div class="mb-8">
      <h3 class="text-lg font-bold text-nexo-cyan mb-3 border-l-4 border-nexo-cyan pl-3">🏫 교육 정책 변화 & 고교학점제</h3>
      <p class="text-sm text-gray-500 mb-3">AI 시대에 맞춘 입시 변화와 학교폭력 기록 관리의 중요성이 대두되고 있습니다.</p>
      <ul class="space-y-2 list-disc list-inside text-gray-700">
        <li><a href="https://www.newsis.com/view/NISX20260205_0003504001" target="_blank" class="hover:underline">임태희 "AI 0.1초 시대에 지식 암기? 입시 달라져야"</a></li>
        <li><a href="https://edu.chosun.com/site/data/html_dir/2026/02/03/2026020380059.html" target="_blank" class="hover:underline">고교학점제 이수 기준 완화… 현장 적용 포인트는?</a></li>
        <li><a href="https://www.lawissue.co.kr/view.php?ud=2026020416051218466cf2d78c68_12" target="_blank" class="hover:underline">학교폭력, 이제 형사 재판보다 무섭다… '기록 관리' 실패가 입시·취업까지 좌우</a></li>
        <li><a href="https://www.globalepic.co.kr/view.php?ud=2026020509554289886cf2d78c68_29" target="_blank" class="hover:underline">학폭 가해자, 2호 경미한 처분받아도 대학가기 어렵다</a></li>
      </ul>
    </div>

    <div class="mb-8">
      <h3 class="text-lg font-bold text-nexo-cyan mb-3 border-l-4 border-nexo-cyan pl-3">💡 학부모님 상담용 인사이트</h3>
      <p class="text-sm text-gray-500 mb-3">상담 시 학부모님께 넌지시 건넬 수 있는 최신 트렌드와 팁입니다.</p>
      <ul class="space-y-2 list-disc list-inside text-gray-700">
        <li><a href="https://www.kmib.co.kr/article/view.asp?arcid=0029339099" target="_blank" class="hover:underline">'서울대' 이부진 장남, 대치동서 입시팁 전수…"스마트폰 단절"</a></li>
        <li><a href="https://www.inews24.com/view/1934180" target="_blank" class="hover:underline">서울대 입시 뜻밖의 결과⋯외고·과고 정시합격 '반토막'</a></li>
        <li><a href="https://www.busan.com/view/busan/view.php?code=2026020217504070755" target="_blank" class="hover:underline">예비 고3 전력질주보다 완주 목표로… 속도보다 리듬이 성적 만든다</a></li>
        <li><a href="https://www.donga.com/news/Society/article/all/20260204/133278967/1" target="_blank" class="hover:underline">초등 20만원·중고교 30만원…"서울 신입생 입학준비금 신청하세요"</a></li>
      </ul>
    </div>
  </section>

  <section class="mt-12 bg-gray-900 text-white p-8 rounded-xl text-center">
    <h4 class="text-2xl font-bold mb-4">입시 설명회, 아직도 화이트보드로 하세요?</h4>
    <p class="mb-6 text-gray-300">
      복잡한 입시 전형, 말로만 설명하면 학부모님 귀에 들어오지 않습니다.<br>
      <strong>NEXO 전자칠판</strong>으로 데이터를 띄우고, 그 위에 바로 판서하며 신뢰를 얻으세요.
    </p>
    <a href="/products" class="inline-block bg-nexo-cyan text-nexo-navy font-bold py-3 px-8 rounded-full hover:bg-white transition-colors">
      NEXO 2026년형 특가 확인하기
    </a>
  </section>
</div>`

async function seedVol1() {
  console.log('🚀 NEXO Weekly 창간호(Vol. 1) 데이터 삽입 시작\n')

  // 기존 데이터 확인
  const { data: existingData, error: checkError } = await supabase
    .from('articles')
    .select('id, title, edition_id')
    .eq('edition_id', '2026-02-05')

  if (checkError) {
    console.error('❌ 기존 데이터 확인 실패:', checkError.message)
    return
  }

  if (existingData && existingData.length > 0) {
    console.log('⚠️  이미 2026-02-05 발행호가 존재합니다:')
    existingData.forEach(article => {
      console.log(`   - ID: ${article.id}, 제목: ${article.title}`)
    })
    
    console.log('\n기존 데이터를 삭제하고 새로 추가하시겠습니까?')
    console.log('삭제하려면: DELETE FROM articles WHERE edition_id = \'2026-02-05\';')
    console.log('또는 기존 데이터를 유지하고 새로 추가하려면 스크립트를 수정하세요.\n')
    return
  }

  // 창간호 데이터 삽입
  const { data, error } = await supabase
    .from('articles')
    .insert({
      title: "🚨 [창간호] '사탐런'부터 '의대 증원'까지, 2월 입시 판도 완벽 분석",
      subtitle: '학원장님이 꼭 알아야 할 2월 1주차 교육 뉴스 큐레이션 & 상담 가이드',
      content: VOL1_CONTENT,
      category: 'news',
      edition_id: '2026-02-05',
      published_at: '2026-02-05T09:00:00Z',
      is_published: true,
      views: 0,
      thumbnail_url: null, // 이미지가 있으면 경로 추가
    })
    .select()
    .single()

  if (error) {
    console.error('❌ 데이터 삽입 실패:', error.message)
    return
  }

  console.log('✅ 창간호(Vol. 1) 데이터 삽입 완료!\n')
  console.log('📊 삽입된 데이터:')
  console.log(`   ID: ${data.id}`)
  console.log(`   Edition ID: ${data.edition_id}`)
  console.log(`   제목: ${data.title}`)
  console.log(`   부제목: ${data.subtitle}`)
  console.log(`   카테고리: ${data.category}`)
  console.log(`   발행일: ${data.published_at}`)
  console.log(`\n🌐 확인: http://localhost:3001/news/2026-02-05`)
  console.log(`   또는: http://localhost:3001 (메인 페이지에서 자동 리다이렉트)`)
}

seedVol1().catch(console.error)


