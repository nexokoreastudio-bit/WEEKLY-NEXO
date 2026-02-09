-- insights 테이블에 thumbnail_url 컬럼 추가
ALTER TABLE public.insights 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_insights_thumbnail ON public.insights(thumbnail_url) WHERE thumbnail_url IS NOT NULL;

