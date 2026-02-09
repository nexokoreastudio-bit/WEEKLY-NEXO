-- point_logs 테이블에 related_type 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- point_logs 테이블에 related_type 컬럼 추가
-- ============================================

-- related_type 컬럼 추가 (포인트 로그의 관련 타입: article, post, comment, resource, checkin)
ALTER TABLE public.point_logs
ADD COLUMN IF NOT EXISTS related_type TEXT CHECK (related_type IN ('article', 'post', 'comment', 'resource', 'checkin'));

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_point_logs_related_type 
ON public.point_logs(related_type) 
WHERE related_type IS NOT NULL;

-- 기존 데이터 업데이트 (reason 기반으로 related_type 추론)
UPDATE public.point_logs
SET related_type = CASE
  WHEN reason LIKE '%article%' OR reason LIKE '%read%' THEN 'article'
  WHEN reason LIKE '%post%' OR reason LIKE '%review%' THEN 'post'
  WHEN reason LIKE '%comment%' THEN 'comment'
  WHEN reason LIKE '%resource%' OR reason LIKE '%download%' THEN 'resource'
  WHEN reason LIKE '%checkin%' OR reason LIKE '%출석%' THEN 'checkin'
  ELSE NULL
END
WHERE related_type IS NULL;


