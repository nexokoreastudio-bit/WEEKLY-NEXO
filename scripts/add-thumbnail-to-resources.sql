-- 자료실(resources) 테이블에 썸네일 이미지 필드 추가
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- thumbnail_url 컬럼 추가 (NULL 허용)
ALTER TABLE public.resources
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.resources.thumbnail_url IS '자료 썸네일 이미지 URL (Supabase Storage)';

-- 확인 쿼리
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'resources'
  AND column_name = 'thumbnail_url';
