-- insights 테이블에 published_at 컬럼 추가 (발행 예약 날짜)
-- Supabase Dashboard > SQL Editor에서 실행하세요

ALTER TABLE public.insights 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- 인덱스 추가 (발행 날짜 기준 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_insights_published_at ON public.insights(published_at) WHERE published_at IS NOT NULL;

-- 기존 발행된 인사이트의 published_at을 created_at으로 설정
UPDATE public.insights
SET published_at = created_at
WHERE is_published = true AND published_at IS NULL;

-- 기존 미발행 인사이트는 published_at을 NULL로 유지 (수동 발행 대기)
