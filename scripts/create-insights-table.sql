-- 학부모님 상담용 인사이트 링크 관리 테이블
CREATE TABLE IF NOT EXISTS public.insights (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT, -- AI가 생성한 요약
  content TEXT, -- AI가 생성한 상담용 인사이트 글
  category TEXT CHECK (category IN ('입시', '정책', '학습법', '상담팁', '기타')) DEFAULT '기타',
  edition_id TEXT, -- 발행호 ID (외래 키 없이 문자열로 저장, 애플리케이션 레벨에서 관리)
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_insights_edition ON public.insights(edition_id);
CREATE INDEX IF NOT EXISTS idx_insights_published ON public.insights(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_category ON public.insights(category);

-- RLS 활성화
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자는 발행된 인사이트 조회 가능
CREATE POLICY "Anyone can view published insights"
  ON public.insights
  FOR SELECT
  USING (is_published = true);

-- RLS 정책: 관리자만 생성/수정/삭제 가능
CREATE POLICY "Admins can manage insights"
  ON public.insights
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

