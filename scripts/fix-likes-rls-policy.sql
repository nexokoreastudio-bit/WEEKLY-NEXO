-- 좋아요(likes) 테이블 RLS 정책 수정
-- INSERT 작업에는 WITH CHECK 절이 필요합니다

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can manage likes" ON public.likes;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;

-- 모든 사용자는 좋아요를 읽을 수 있음
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

-- 인증된 사용자는 자신의 좋아요를 추가할 수 있음
CREATE POLICY "Authenticated users can insert likes" ON public.likes
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = user_id
  );

-- 사용자는 자신의 좋아요를 삭제할 수 있음
CREATE POLICY "Users can delete own likes" ON public.likes
  FOR DELETE 
  USING (auth.uid() = user_id);
