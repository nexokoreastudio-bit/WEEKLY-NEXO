-- nexo.korea.studio@gmail.com 사용자 확인 및 관리자 권한 부여

-- 1단계: 현재 사용자 상태 확인
SELECT 
  id,
  email,
  nickname,
  role,
  created_at,
  updated_at
FROM public.users
WHERE email = 'nexo.korea.studio@gmail.com';

-- 2단계: 사용자가 없으면 auth.users에서 확인
-- (users 테이블에 레코드가 없을 수 있음)
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'nexo.korea.studio@gmail.com';

-- 3단계: users 테이블에 레코드가 없으면 생성 후 권한 부여
-- (auth.users에는 있지만 public.users에는 없는 경우)
INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'nexo.korea.studio@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';

-- 4단계: 이미 users 테이블에 레코드가 있으면 권한만 업데이트
UPDATE public.users
SET role = 'admin', updated_at = NOW()
WHERE email = 'nexo.korea.studio@gmail.com';

-- 5단계: 최종 확인
SELECT 
  id,
  email,
  nickname,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅ 관리자 권한 있음'
    ELSE '❌ 관리자 권한 없음'
  END as status
FROM public.users
WHERE email = 'nexo.korea.studio@gmail.com';


