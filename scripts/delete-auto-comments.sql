-- 커뮤니티 게시판에 자동으로 생성된 댓글 삭제 스크립트
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행

-- 1. 자동 댓글을 작성한 사용자 닉네임 목록 (create-natural-community-posts.ts에서 사용된 닉네임들)
-- 이 닉네임들을 가진 사용자들이 작성한 모든 댓글을 삭제합니다.

-- 삭제 전 확인: 삭제될 댓글 수 확인
SELECT 
  u.nickname,
  COUNT(c.id) as comment_count
FROM public.users u
INNER JOIN public.comments c ON c.author_id = u.id
WHERE u.nickname IN (
  '경험많은원장', '디지털원장', '바쁜학원장', '수학전문가', '활용고수',
  '초보사용자', '만족사용자', '신규사용자', '정책관심', '상담고민',
  '정보수집', '자료활용', '매일체크', '상담전문', '정보공유',
  '해결사', '기술지원', '전문가', '경험많음', '상담전문가',
  '디지털파워', '유연한상담', '비교전문', '친환경원장', '트렌드파악',
  '상황대응', '시각전문', '포인트마스터', '매일방문', '활동많음',
  '출석왕', '댓글러', '절약왕', '수학선생', '기하전문',
  '함수마스터', '실전활용', '시각학습', '수학애호가', '도형전문',
  '수업만족', '그래프전문', '정리왕', '시간절약', '신뢰구축',
  '효율추구', '질문많음', '노하우수집', '고민해결'
)
GROUP BY u.id, u.nickname
ORDER BY comment_count DESC;

-- 2. 자동 댓글 삭제 실행
-- 주의: 이 쿼리는 위의 닉네임 목록에 해당하는 사용자들이 작성한 모든 댓글을 삭제합니다.
DELETE FROM public.comments
WHERE author_id IN (
  SELECT id FROM public.users
  WHERE nickname IN (
    '경험많은원장', '디지털원장', '바쁜학원장', '수학전문가', '활용고수',
    '초보사용자', '만족사용자', '신규사용자', '정책관심', '상담고민',
    '정보수집', '자료활용', '매일체크', '상담전문', '정보공유',
    '해결사', '기술지원', '전문가', '경험많음', '상담전문가',
    '디지털파워', '유연한상담', '비교전문', '친환경원장', '트렌드파악',
    '상황대응', '시각전문', '포인트마스터', '매일방문', '활동많음',
    '출석왕', '댓글러', '절약왕', '수학선생', '기하전문',
    '함수마스터', '실전활용', '시각학습', '수학애호가', '도형전문',
    '수업만족', '그래프전문', '정리왕', '시간절약', '신뢰구축',
    '효율추구', '질문많음', '노하우수집', '고민해결'
  )
);

-- 3. 게시글의 comments_count를 실제 댓글 수로 동기화
-- (트리거가 자동으로 처리하지만, 확인용으로 실행)
UPDATE public.posts
SET comments_count = (
  SELECT COUNT(*)
  FROM public.comments
  WHERE comments.post_id = posts.id
);

-- 4. 삭제 결과 확인
SELECT 
  '삭제 완료' as status,
  COUNT(*) as remaining_comments
FROM public.comments;
