-- 2월 9일 인사이트에 이미지 적용
-- published_at이 2026-02-09이거나 edition_id가 2026-02-09인 인사이트의 thumbnail_url 업데이트

UPDATE public.insights
SET 
  thumbnail_url = '/assets/images/아이와 엄마가 함께 공부하는 사진.png',
  updated_at = NOW()
WHERE 
  (
    -- published_at이 2026-02-09인 경우
    (published_at >= '2026-02-09T00:00:00Z' 
     AND published_at < '2026-02-10T00:00:00Z')
    OR
    -- edition_id가 2026-02-09인 경우
    edition_id = '2026-02-09'
  )
  AND is_published = true;

-- 업데이트된 행 수 확인
SELECT 
  id,
  title,
  thumbnail_url,
  published_at,
  edition_id,
  is_published
FROM public.insights
WHERE 
  (
    (published_at >= '2026-02-09T00:00:00Z' 
     AND published_at < '2026-02-10T00:00:00Z')
    OR
    edition_id = '2026-02-09'
  )
  AND is_published = true
ORDER BY published_at DESC, created_at DESC;
