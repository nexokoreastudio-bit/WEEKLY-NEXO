/**
 * 현장 소식 테이블 생성 스크립트
 * Node.js로 실행하여 Supabase에 테이블 생성
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createFieldNewsTable() {
  console.log('📋 현장 소식 테이블 생성 시작...\n')

  const sql = `
-- 현장 소식 테이블 생성
CREATE TABLE IF NOT EXISTS public.field_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  location TEXT,
  installation_date DATE,
  images TEXT[],
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

CREATE INDEX IF NOT EXISTS idx_field_news_author ON public.field_news(author_id);

-- RLS 활성화
ALTER TABLE public.field_news ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Anyone can view published field news" ON public.field_news;
DROP POLICY IF EXISTS "Admins can insert field news" ON public.field_news;
DROP POLICY IF EXISTS "Admins can update field news" ON public.field_news;
DROP POLICY IF EXISTS "Admins can delete field news" ON public.field_news;
DROP POLICY IF EXISTS "Users can insert their own field news" ON public.field_news;
DROP POLICY IF EXISTS "Users can update their own field news" ON public.field_news;
DROP POLICY IF EXISTS "Users can delete their own field news" ON public.field_news;

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
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // RPC 함수가 없을 수 있으므로 직접 쿼리 실행
      console.log('⚠️ RPC 함수를 사용할 수 없습니다. SQL Editor에서 직접 실행해야 합니다.\n')
      console.log('📝 다음 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요:\n')
      console.log('='.repeat(80))
      console.log(sql)
      console.log('='.repeat(80))
      return
    }

    console.log('✅ 현장 소식 테이블이 성공적으로 생성되었습니다!')
  } catch (err) {
    console.error('❌ 테이블 생성 실패:', err.message)
    console.log('\n📝 다음 SQL을 Supabase Dashboard > SQL Editor에서 직접 실행하세요:\n')
    console.log('='.repeat(80))
    console.log(sql)
    console.log('='.repeat(80))
  }
}

createFieldNewsTable()
