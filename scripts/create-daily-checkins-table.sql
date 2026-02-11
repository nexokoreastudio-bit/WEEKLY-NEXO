-- 일일 출석 체크인 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. daily_checkins 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON public.daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON public.daily_checkins(checkin_date DESC);

-- ============================================
-- 2. RLS 활성화
-- ============================================
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 출석 기록만 조회 가능
DROP POLICY IF EXISTS "Users can view own checkins" ON public.daily_checkins;
CREATE POLICY "Users can view own checkins" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 출석 기록만 생성 가능
DROP POLICY IF EXISTS "Users can create own checkins" ON public.daily_checkins;
CREATE POLICY "Users can create own checkins" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 관리자는 모든 출석 기록 조회 가능
DROP POLICY IF EXISTS "Admins can view all checkins" ON public.daily_checkins;
CREATE POLICY "Admins can view all checkins" ON public.daily_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 3. 일일 출석 포인트 지급 함수 및 트리거
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

-- ============================================
-- 4. 확인 쿼리
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'daily_checkins'
ORDER BY ordinal_position;
