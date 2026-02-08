-- edition_id 컬럼에 인덱스 추가 (성능 최적화)
-- Supabase SQL Editor에서 실행하세요

-- edition_id 컬럼에 인덱스 생성 (이미 존재하면 무시)
CREATE INDEX IF NOT EXISTS idx_articles_edition_id ON public.articles(edition_id) 
WHERE edition_id IS NOT NULL;

-- 복합 인덱스: edition_id + is_published + published_at (발행호 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_articles_edition_published ON public.articles(edition_id, is_published, published_at DESC)
WHERE edition_id IS NOT NULL AND is_published = true;

-- 발행호 목록 조회 최적화를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_articles_edition_published_at ON public.articles(edition_id, published_at DESC)
WHERE edition_id IS NOT NULL AND is_published = true;

