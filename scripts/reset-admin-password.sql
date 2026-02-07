-- 관리자 계정 비밀번호 재설정 (Supabase Dashboard에서 직접 실행)

-- 방법 1: Supabase Dashboard에서 비밀번호 재설정
-- 1. Supabase Dashboard > Authentication > Users 메뉴로 이동
-- 2. nexo.korea.studio@gmail.com 사용자 찾기
-- 3. 사용자 행의 "..." 메뉴 클릭 > "Reset Password" 선택
-- 4. 이메일로 비밀번호 재설정 링크가 전송됨

-- 방법 2: SQL로 직접 비밀번호 변경 (비권장 - 보안상 위험)
-- 비밀번호는 해시화되어 저장되므로 직접 변경 불가
-- 반드시 Supabase Dashboard의 "Reset Password" 기능 사용

-- 방법 3: 새 계정 생성 후 관리자 권한 부여
-- 1. 회원가입 페이지에서 새 계정 생성
-- 2. 생성된 계정에 관리자 권한 부여:
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE email = 'new-admin-email@example.com';

