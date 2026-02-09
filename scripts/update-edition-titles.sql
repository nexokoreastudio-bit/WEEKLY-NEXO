-- 기존 발행호들의 제목과 내용을 날짜별로 고유하게 업데이트
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 날짜별 고유한 제목과 내용으로 업데이트
UPDATE articles
SET 
  title = CASE 
    WHEN edition_id = '2026-02-09' THEN 'NEXO Daily 2026년 2월 9일 월요일'
    WHEN edition_id = '2026-02-08' THEN 'NEXO Daily 2026년 2월 8일 일요일'
    WHEN edition_id = '2026-02-07' THEN 'NEXO Daily 2026년 2월 7일 토요일'
    WHEN edition_id = '2026-02-06' THEN 'NEXO Daily 2026년 2월 6일 금요일'
    WHEN edition_id = '2026-02-05' THEN 'NEXO Daily 2026년 2월 5일 목요일'
    WHEN edition_id = '2026-02-04' THEN 'NEXO Daily 2026년 2월 4일 수요일'
    WHEN edition_id = '2026-02-03' THEN 'NEXO Daily 2026년 2월 3일 화요일'
    ELSE 'NEXO Daily ' || TO_CHAR(TO_DATE(edition_id, 'YYYY-MM-DD'), 'YYYY년 FMM월 FMDD일 ') || 
         CASE EXTRACT(DOW FROM TO_DATE(edition_id, 'YYYY-MM-DD'))
           WHEN 0 THEN '일요일'
           WHEN 1 THEN '월요일'
           WHEN 2 THEN '화요일'
           WHEN 3 THEN '수요일'
           WHEN 4 THEN '목요일'
           WHEN 5 THEN '금요일'
           WHEN 6 THEN '토요일'
         END
  END,
  content = CASE 
    WHEN edition_id = '2026-02-09' THEN 
      '<div class="space-y-6 text-gray-800">
        <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 class="text-2xl font-bold text-nexo-navy mb-4">2026년 2월 9일 월요일 NEXO Daily</h2>
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
      </div>'
    WHEN edition_id = '2026-02-08' THEN 
      '<div class="space-y-6 text-gray-800">
        <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 class="text-2xl font-bold text-nexo-navy mb-4">2026년 2월 8일 일요일 NEXO Daily</h2>
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
      </div>'
    ELSE 
      '<div class="space-y-6 text-gray-800">
        <section class="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 class="text-2xl font-bold text-nexo-navy mb-4">' || 
          TO_CHAR(TO_DATE(edition_id, 'YYYY-MM-DD'), 'YYYY년 FMM월 FMDD일 ') ||
          CASE EXTRACT(DOW FROM TO_DATE(edition_id, 'YYYY-MM-DD'))
            WHEN 0 THEN '일요일'
            WHEN 1 THEN '월요일'
            WHEN 2 THEN '화요일'
            WHEN 3 THEN '수요일'
            WHEN 4 THEN '목요일'
            WHEN 5 THEN '금요일'
            WHEN 6 THEN '토요일'
          END || ' NEXO Daily</h2>
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
      </div>'
  END
WHERE edition_id IS NOT NULL 
  AND is_published = true
  AND (title = 'NEXO Daily 창간호' OR title LIKE 'NEXO Daily%');

-- 기본 이미지 설정 (thumbnail_url이 없는 경우)
-- Unsplash의 교육 관련 이미지 사용 (또는 로고 이미지)
UPDATE articles
SET thumbnail_url = '/assets/images/nexo_logo_black.png'
WHERE edition_id IS NOT NULL 
  AND is_published = true
  AND thumbnail_url IS NULL;

-- 업데이트 결과 확인
SELECT 
  id,
  edition_id,
  title,
  LEFT(content, 100) as content_preview,
  thumbnail_url,
  is_published
FROM articles
WHERE edition_id IS NOT NULL
ORDER BY published_at DESC;
