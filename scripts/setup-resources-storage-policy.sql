-- Supabase Storage 버킷 정책 설정
-- Supabase Dashboard > Storage > resources 버킷 > Policies에서 실행하거나
-- SQL Editor에서 실행하세요

-- ============================================
-- 중요: Supabase Storage 정책은 SQL로 직접 생성할 수 없을 수 있습니다.
-- Supabase Dashboard에서 수동으로 설정하는 것을 권장합니다.
-- ============================================

-- ============================================
-- 방법 1: Supabase Dashboard에서 설정 (권장)
-- ============================================
-- 1. Storage > resources 버킷으로 이동
-- 2. "Policies" 탭 클릭
-- 3. "New Policy" 클릭
--
-- 정책 1: 모든 사용자 읽기 권한
--   - Policy name: "Resources are viewable by everyone"
--   - Allowed operation: SELECT
--   - Policy definition:
--     USING (bucket_id = 'resources')
--
-- 정책 2: 관리자 업로드 권한
--   - Policy name: "Admins can upload resources"
--   - Allowed operation: INSERT
--   - Policy definition:
--     USING (
--       bucket_id = 'resources' AND
--       EXISTS (
--         SELECT 1 FROM public.users
--         WHERE users.id = auth.uid() AND users.role = 'admin'
--       )
--     )
--
-- 4. "Save" 클릭

-- ============================================
-- 방법 2: 공개 버킷으로 설정 (간단한 방법)
-- ============================================
-- 버킷 생성 시 "Public bucket" 옵션을 체크하면
-- 모든 사용자가 읽기 가능하며, 정책 설정이 간단해집니다.
-- 다만 업로드는 여전히 관리자만 가능하도록 정책을 설정해야 합니다.

-- ============================================
-- 방법 3: SQL Editor에서 직접 생성
-- ============================================
-- 아래 SQL을 Supabase Dashboard > SQL Editor에서 실행하면
-- Storage 정책을 자동으로 생성할 수 있습니다.
--
-- scripts/create-resources-storage-policies.sql 파일 참고
--
-- 또는 아래 SQL을 직접 실행:

-- 정책 1: 모든 사용자 읽기 권한
CREATE POLICY "Resources are viewable by everyone"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resources');

-- 정책 2: 관리자 업로드 권한
CREATE POLICY "Admins can upload resources"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 정책 3: 관리자 삭제 권한 (선택사항)
CREATE POLICY "Admins can delete resources"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
