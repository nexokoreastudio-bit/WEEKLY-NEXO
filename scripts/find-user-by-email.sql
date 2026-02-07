-- 이메일로 사용자 찾기 및 관리자 권한 부여

-- 1단계: 이메일로 사용자 찾기
SELECT id, email, nickname, role, created_at
FROM public.users
WHERE email = 'your-email@example.com';  -- 여기에 실제 이메일 입력

-- 2단계: 찾은 사용자에게 관리자 권한 부여
-- 위 쿼리 결과에서 id (UUID)를 복사하여 아래 쿼리 실행
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';  -- 이메일로 직접 업데이트 (더 안전함)

-- 또는 UUID로 직접 업데이트 (1단계에서 확인한 UUID 사용)
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE id = '복사한-uuid-여기에-붙여넣기';

-- 3단계: 권한 부여 확인
SELECT id, email, nickname, role
FROM public.users
WHERE email = 'your-email@example.com';

