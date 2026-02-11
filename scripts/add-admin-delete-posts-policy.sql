-- 관리자가 게시글과 댓글을 삭제할 수 있도록 RLS 정책 추가
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. 게시글 삭제 정책
-- ============================================
-- 기존 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'posts' AND policyname LIKE '%delete%';

-- 관리자 삭제 정책 추가 (이미 존재하면 무시)
DROP POLICY IF EXISTS "Admins can delete all posts" ON public.posts;

CREATE POLICY "Admins can delete all posts" ON public.posts
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 2. 댓글 삭제 정책
-- ============================================
-- 기존 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'comments' AND policyname LIKE '%delete%';

-- 관리자 삭제 정책 추가 (이미 존재하면 무시)
DROP POLICY IF EXISTS "Admins can delete all comments" ON public.comments;

CREATE POLICY "Admins can delete all comments" ON public.comments
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 3. 정책 확인
-- ============================================
SELECT * FROM pg_policies WHERE tablename = 'posts' ORDER BY policyname;
SELECT * FROM pg_policies WHERE tablename = 'comments' ORDER BY policyname;
