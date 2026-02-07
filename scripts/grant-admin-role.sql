-- 특정 사용자에게 관리자 권한 부여
-- 사용자의 이메일을 확인한 후 해당 사용자의 ID를 찾아 role을 'admin'으로 설정

-- ============================================
-- 1단계: 모든 사용자 확인 (이메일, ID, 현재 role 확인)
-- ============================================
SELECT id, email, nickname, role, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- ============================================
-- 2단계: 이메일로 관리자 권한 부여 (권장 방법)
-- ============================================
-- 아래 이메일을 실제 관리자 이메일로 변경하세요
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';

-- ============================================
-- 3단계: 사용자 ID(UUID)로 관리자 권한 부여
-- ============================================
-- 1단계에서 확인한 UUID를 사용하세요
-- UUID 형식: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
-- 예시:
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- ============================================
-- 4단계: 닉네임으로 관리자 권한 부여 (참고용)
-- ============================================
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE nickname = 'your-nickname';

-- ============================================
-- 5단계: 권한 부여 확인
-- ============================================
-- SELECT id, email, nickname, role 
-- FROM public.users 
-- WHERE role = 'admin';

