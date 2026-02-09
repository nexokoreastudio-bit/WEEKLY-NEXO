-- 기존 articles 데이터 모두 삭제
-- 주의: 이 스크립트는 모든 발행호 데이터를 삭제합니다!

-- 1. 외래 키 제약 조건 확인 (point_logs 등에서 참조하는 경우)
-- 먼저 관련 데이터 확인
SELECT COUNT(*) as total_articles FROM articles;
SELECT edition_id, COUNT(*) as count FROM articles GROUP BY edition_id;

-- 2. 모든 articles 삭제
DELETE FROM articles;

-- 3. 시퀀스 리셋 (선택사항, ID를 1부터 다시 시작하려면)
-- ALTER SEQUENCE articles_id_seq RESTART WITH 1;

-- 4. 삭제 확인
SELECT COUNT(*) as remaining_articles FROM articles;


