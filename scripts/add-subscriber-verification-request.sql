-- 구독자 인증 요청 기능 추가
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. 구독자 인증 요청 상태 컬럼 추가
-- ============================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscriber_verification_request BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMP WITH TIME ZONE;

-- 인덱스 생성 (요청 상태 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_users_verification_request ON public.users(subscriber_verification_request) 
WHERE subscriber_verification_request = TRUE;

-- ============================================
-- 2. 확인 쿼리
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('subscriber_verification_request', 'verification_requested_at')
ORDER BY ordinal_position;
