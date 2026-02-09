-- 오늘 날짜(2026-02-09)로 첫 발행호 생성 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요

INSERT INTO articles (
  title,
  subtitle,
  edition_id,
  category,
  content,
  published_at,
  is_published,
  views
) VALUES (
  'NEXO Daily 창간호',
  '학부모님 상담에 도움이 되는 교육 정보',
  '2026-02-09',
  'news',
  '<div class="space-y-6 text-gray-800">
    <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 class="text-2xl font-bold text-nexo-navy mb-4">NEXO Daily에 오신 것을 환영합니다</h2>
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
  </div>',
  '2026-02-09T09:00:00Z',
  true,
  0
)
ON CONFLICT DO NOTHING;

-- 생성 확인
SELECT id, edition_id, title, is_published, published_at 
FROM articles 
WHERE edition_id = '2026-02-09';


