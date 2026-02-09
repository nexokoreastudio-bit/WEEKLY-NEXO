-- field_news 테이블에 관리자 기능을 위한 컬럼 추가

ALTER TABLE public.field_news
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.field_news
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

ALTER TABLE public.field_news
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

ALTER TABLE public.field_news
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_field_news_author ON public.field_news(author_id);
CREATE INDEX IF NOT EXISTS idx_field_news_published ON public.field_news(is_published, published_at DESC);


