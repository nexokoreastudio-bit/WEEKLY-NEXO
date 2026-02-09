-- 리드 생성 시스템 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 리드 (leads) 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS public.leads (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('demo', 'quote', 'consultation')), -- 체험, 견적, 상담
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  academy_name TEXT,
  region TEXT, -- 지역 (예: 서울 노원구)
  size TEXT, -- 인치 종류 (65, 75, 86)
  mount_type TEXT, -- 설치 방식 (wall, stand)
  quantity INTEGER, -- 수량
  message TEXT, -- 추가 메시지
  referrer_code TEXT, -- 유입 경로 (추천인 코드)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  admin_notes TEXT, -- 관리자 메모
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_leads_type ON public.leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- RLS 활성화
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자는 리드 생성 가능
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- RLS 정책: 관리자만 리드 조회 가능
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS 정책: 관리자만 리드 수정 가능
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leads_updated_at();


