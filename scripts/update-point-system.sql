-- 포인트 시스템 업데이트 SQL
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. 게시글 작성 포인트를 +10에서 +20으로 변경
-- ============================================
CREATE OR REPLACE FUNCTION public.add_points_for_post()
RETURNS TRIGGER AS $$
BEGIN
  -- 게시글 작성 시 +20 포인트 (기존 +10에서 변경)
  INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
  VALUES (NEW.author_id, 20, 'write_post', NEW.id, 'post');
  
  UPDATE public.users
  SET point = point + 20
  WHERE id = NEW.author_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거는 이미 존재하므로 재생성 불필요

-- ============================================
-- 2. 댓글 작성 포인트는 +5로 유지 (이미 구현됨)
-- ============================================
-- 댓글 작성 포인트는 이미 +5로 설정되어 있으므로 변경 불필요

-- ============================================
-- 3. 일일 출석 체크 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);

-- RLS 활성화
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 출석 기록만 조회 가능
DROP POLICY IF EXISTS "Users can view own checkins" ON public.daily_checkins;
CREATE POLICY "Users can view own checkins" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 출석 기록만 생성 가능
DROP POLICY IF EXISTS "Users can create own checkins" ON public.daily_checkins;
CREATE POLICY "Users can create own checkins" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. 일일 출석 포인트 지급 함수
-- ============================================
CREATE OR REPLACE FUNCTION public.add_points_for_daily_checkin()
RETURNS TRIGGER AS $$
BEGIN
  -- 일일 출석 시 +5 포인트
  INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
  VALUES (NEW.user_id, 5, 'daily_checkin', NEW.id, 'checkin');
  
  UPDATE public.users
  SET point = point + 5
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 일일 출석 시 포인트 지급
DROP TRIGGER IF EXISTS on_daily_checkin_created ON public.daily_checkins;
CREATE TRIGGER on_daily_checkin_created
  AFTER INSERT ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.add_points_for_daily_checkin();

