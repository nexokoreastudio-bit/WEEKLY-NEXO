-- nexo.korea.studio@gmail.com 사용자에게 관리자 권한 부여

-- 1단계: 사용자 확인
SELECT id, email, nickname, role, created_at
FROM public.users
WHERE email = 'nexo.korea.studio@gmail.com';

-- 2단계: 관리자 권한 부여
UPDATE public.users
SET role = 'admin'
WHERE email = 'nexo.korea.studio@gmail.com';

-- 3단계: 권한 부여 확인
SELECT id, email, nickname, role
FROM public.users
WHERE email = 'nexo.korea.studio@gmail.com';


