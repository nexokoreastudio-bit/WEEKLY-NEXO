-- Render.com PostgreSQL 회원 테이블
-- Render 대시보드에서 PostgreSQL 생성 후, 연결된 DB에서 아래 SQL 실행 (psql 또는 Render Shell).

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  academy_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  referrer_code TEXT DEFAULT '',
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

COMMENT ON TABLE members IS '넥소 위클리 구독자 회원 (Render Postgres)';
