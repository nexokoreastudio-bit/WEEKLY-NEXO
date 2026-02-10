-- 현장소식 테이블에 구조화된 필드 추가
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- ============================================
-- 1. 새로운 컬럼 추가
-- ============================================
ALTER TABLE public.field_news
ADD COLUMN IF NOT EXISTS store_name TEXT, -- 상점명
ADD COLUMN IF NOT EXISTS model TEXT, -- 모델명 (예: NXH65)
ADD COLUMN IF NOT EXISTS additional_cables TEXT, -- 추가 케이블 (예: "HDMI 5m 1EA / 터치 5m 1EA")
ADD COLUMN IF NOT EXISTS stand TEXT, -- 스탠드 (예: "1대")
ADD COLUMN IF NOT EXISTS wall_mount TEXT, -- 벽걸이
ADD COLUMN IF NOT EXISTS payment TEXT, -- 결제 정보
ADD COLUMN IF NOT EXISTS notes TEXT; -- 특이사항

-- ============================================
-- 2. 기존 location 필드 설명 업데이트
-- ============================================
COMMENT ON COLUMN public.field_news.location IS '지역/주소 (예: 부산시 기장군 일광읍 박영준길 16)';
COMMENT ON COLUMN public.field_news.store_name IS '상점명 (예: 칠암어린이집)';
COMMENT ON COLUMN public.field_news.model IS '모델명 (예: NXH65)';
COMMENT ON COLUMN public.field_news.additional_cables IS '추가 케이블 정보';
COMMENT ON COLUMN public.field_news.stand IS '스탠드 정보';
COMMENT ON COLUMN public.field_news.wall_mount IS '벽걸이 정보';
COMMENT ON COLUMN public.field_news.payment IS '결제 정보';
COMMENT ON COLUMN public.field_news.notes IS '특이사항';

-- ============================================
-- 3. 확인 쿼리
-- ============================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'field_news' 
-- ORDER BY ordinal_position;
