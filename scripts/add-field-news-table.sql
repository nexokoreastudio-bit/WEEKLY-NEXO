-- 현장 소식 테이블 추가
-- Supabase Dashboard > SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS public.field_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  location TEXT, -- 설치 장소 (예: "서울 강남구 XX학원")
  installation_date DATE, -- 설치 일자
  images TEXT[], -- Supabase Storage URL 배열
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_field_news_published ON public.field_news(published_at DESC) 
WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_field_news_location ON public.field_news(location);

-- RLS 정책 (모든 사용자가 읽기 가능, 관리자만 작성/수정/삭제 가능)
ALTER TABLE public.field_news ENABLE ROW LEVEL SECURITY;

-- 발행된 현장 소식은 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view published field news"
  ON public.field_news FOR SELECT
  USING (is_published = TRUE);

-- 관리자만 현장 소식 작성 가능
CREATE POLICY "Admins can insert field news"
  ON public.field_news FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 관리자만 현장 소식 수정 가능
CREATE POLICY "Admins can update field news"
  ON public.field_news FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 관리자만 현장 소식 삭제 가능
CREATE POLICY "Admins can delete field news"
  ON public.field_news FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );


