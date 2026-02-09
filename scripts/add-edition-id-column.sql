-- articles 테이블에 edition_id 컬럼 추가
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. edition_id 컬럼 추가
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS edition_id TEXT;

-- 2. 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_articles_edition_id ON public.articles(edition_id);

-- 3. published_at 기반으로 edition_id 업데이트 (기존 데이터용)
-- published_at이 날짜 형식인 경우
UPDATE public.articles 
SET edition_id = TO_CHAR(published_at, 'YYYY-MM-DD')
WHERE edition_id IS NULL AND published_at IS NOT NULL;

-- 4. 코멘트 추가
COMMENT ON COLUMN public.articles.edition_id IS '발행호 ID (예: 2026-02-05)';


