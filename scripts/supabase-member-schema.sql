-- 넥소 위클리 진짜 회원 DB (Supabase)
-- Supabase 대시보드 → SQL Editor에서 순서대로 실행하세요.

-- 1) member_profiles 테이블 (auth.users와 1:1, 구독자 프로필)
CREATE TABLE IF NOT EXISTS public.member_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  academy_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  referrer_code TEXT DEFAULT '',
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_profiles_email ON public.member_profiles(email);

-- 2) 가입 시 auth.users 메타데이터 → member_profiles 자동 삽입
CREATE OR REPLACE FUNCTION public.handle_new_user_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.member_profiles (id, email, name, academy_name, phone, referrer_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'academy_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'referrer_code', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_member ON auth.users;
CREATE TRIGGER on_auth_user_created_member
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_member();

-- 3) RLS: 본인만 자신의 프로필 조회/수정
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 프로필 조회" ON public.member_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "본인 프로필 수정" ON public.member_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 새로 가입한 사용자 본인 행 삽입은 트리거에서만 하므로 INSERT 정책은 없어도 됨 (트리거는 SECURITY DEFINER)
