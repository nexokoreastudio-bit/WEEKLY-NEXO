-- 성능 최적화를 위한 인덱스 추가
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. articles 테이블 인덱스 최적화
-- ============================================

-- edition_id 인덱스 (이미 있을 수 있음)
CREATE INDEX IF NOT EXISTS idx_articles_edition_id_published 
ON public.articles(edition_id, is_published) 
WHERE is_published = true;

-- published_at 인덱스 (최신 발행호 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_articles_published_at 
ON public.articles(published_at DESC) 
WHERE is_published = true;

-- ============================================
-- 2. posts 테이블 인덱스 최적화
-- ============================================

-- board_type 인덱스 (게시판 타입별 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_board_type_created 
ON public.posts(board_type, created_at DESC);

-- author_id 인덱스 (작성자별 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_author_id 
ON public.posts(author_id);

-- ============================================
-- 3. users 테이블 인덱스 최적화
-- ============================================

-- role 인덱스 (관리자 권한 확인 최적화)
CREATE INDEX IF NOT EXISTS idx_users_role 
ON public.users(role) 
WHERE role = 'admin';

-- email 인덱스 (이미 UNIQUE 제약조건으로 인덱스가 있을 수 있음)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON public.users(email);

-- ============================================
-- 4. leads 테이블 인덱스 최적화
-- ============================================

-- type 인덱스 (리드 타입별 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_leads_type_status 
ON public.leads(type, status, created_at DESC);

-- ============================================
-- 5. comments 테이블 인덱스 최적화
-- ============================================

-- post_id 인덱스 (게시글별 댓글 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created 
ON public.comments(post_id, created_at DESC);

-- ============================================
-- 6. point_logs 테이블 인덱스 최적화
-- ============================================

-- user_id 인덱스 (사용자별 포인트 로그 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_point_logs_user_id_created 
ON public.point_logs(user_id, created_at DESC);

-- ============================================
-- 7. 인덱스 사용 통계 확인 (선택사항)
-- ============================================

-- 인덱스 사용 현황 확인 쿼리 (실행 후 결과 확인)
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;


