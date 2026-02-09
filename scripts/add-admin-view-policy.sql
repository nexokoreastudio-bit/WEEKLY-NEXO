-- 관리자가 모든 현장 소식을 조회할 수 있도록 RLS 정책 추가
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 관리자는 모든 현장 소식 조회 가능 (발행 여부와 관계없이)
DROP POLICY IF EXISTS "Admins can view all field news" ON public.field_news;
CREATE POLICY "Admins can view all field news"
  ON public.field_news FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
