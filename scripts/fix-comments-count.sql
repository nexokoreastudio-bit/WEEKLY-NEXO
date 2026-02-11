-- 댓글 수 동기화 스크립트
-- 모든 게시글의 comments_count를 실제 댓글 수로 업데이트
-- Supabase SQL Editor에서 실행하세요

-- 실제 댓글 수로 업데이트
UPDATE public.posts
SET comments_count = (
  SELECT COUNT(*)
  FROM public.comments
  WHERE comments.post_id = posts.id
);

-- 결과 확인
SELECT 
  id,
  title,
  comments_count,
  (SELECT COUNT(*) FROM public.comments WHERE comments.post_id = posts.id) as actual_count
FROM public.posts
WHERE comments_count != (SELECT COUNT(*) FROM public.comments WHERE comments.post_id = posts.id)
ORDER BY id;
