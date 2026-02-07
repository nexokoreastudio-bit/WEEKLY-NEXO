-- 구독자 인증 및 할인 관련 컬럼 추가
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. 구독자 인증 상태 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscriber_verified BOOLEAN DEFAULT FALSE;

-- 2. 구매 시리얼 번호 컬럼 추가 (인증용)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS purchase_serial_number TEXT;

-- 3. 인증 일시 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- 4. 인덱스 생성 (시리얼 번호 검색용)
CREATE INDEX IF NOT EXISTS idx_users_serial_number ON public.users(purchase_serial_number) 
WHERE purchase_serial_number IS NOT NULL;

-- 5. 인증된 구독자 인덱스
CREATE INDEX IF NOT EXISTS idx_users_subscriber_verified ON public.users(subscriber_verified) 
WHERE subscriber_verified = TRUE;

-- 확인 쿼리
SELECT 
  id,
  email,
  nickname,
  subscriber_verified,
  purchase_serial_number,
  verified_at
FROM public.users
LIMIT 5;

