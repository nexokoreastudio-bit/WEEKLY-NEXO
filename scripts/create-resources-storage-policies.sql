-- Supabase Storage 'resources' 버킷 정책 생성
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- 
-- 참고: 이 SQL은 storage.objects 테이블에 대한 정책을 생성합니다.
-- Storage Dashboard의 Policies 탭에서도 동일하게 설정할 수 있습니다.

-- ============================================
-- 정책 1: 모든 사용자 읽기 권한 (SELECT)
-- ============================================
-- resources 버킷의 모든 파일을 모든 사용자가 읽을 수 있도록 설정
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON storage.objects;

CREATE POLICY "Resources are viewable by everyone"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resources');

-- ============================================
-- 정책 2: 관리자 업로드 권한 (INSERT)
-- ============================================
-- 관리자만 resources 버킷에 파일을 업로드할 수 있도록 설정
DROP POLICY IF EXISTS "Admins can upload resources" ON storage.objects;

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

-- ============================================
-- 정책 3: 관리자 삭제 권한 (DELETE) - 선택사항
-- ============================================
-- 관리자만 resources 버킷의 파일을 삭제할 수 있도록 설정
DROP POLICY IF EXISTS "Admins can delete resources" ON storage.objects;

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

-- ============================================
-- 확인 쿼리
-- ============================================
-- 생성된 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%resources%'
ORDER BY policyname;
