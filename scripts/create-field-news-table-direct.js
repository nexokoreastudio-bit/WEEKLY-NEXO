/**
 * 현장 소식 테이블 생성 스크립트 (직접 실행)
 * pg 라이브러리를 사용하여 Supabase에 직접 연결
 */

require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

// Supabase 연결 정보 추출
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

// Supabase URL에서 호스트, 포트, 데이터베이스 정보 추출
// 예: https://icriajfrxwykufhmkfun.supabase.co
const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
if (!urlMatch) {
  console.error('❌ 잘못된 Supabase URL 형식입니다.')
  process.exit(1)
}

const projectRef = urlMatch[1]
const connectionString = `postgresql://postgres.${projectRef}:${supabaseServiceKey}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
})

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

async function createTable() {
  try {
    console.log('📋 현장 소식 테이블 생성 시작...\n')
    await client.connect()
    console.log('✅ 데이터베이스 연결 성공\n')

    // SQL을 세미콜론으로 분리하여 하나씩 실행
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement.length === 0) continue
      
      try {
        await client.query(statement + ';')
        console.log(`✅ ${i + 1}/${statements.length} 완료`)
      } catch (err) {
        // 이미 존재하는 경우 무시
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`⚠️  ${i + 1}/${statements.length} 이미 존재함 (무시)`)
        } else {
          console.error(`❌ ${i + 1}/${statements.length} 실패:`, err.message)
        }
      }
    }

    console.log('\n✅ 현장 소식 테이블 생성 완료!')
    
    // 테이블 확인
    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'field_news' 
      ORDER BY ordinal_position;
    `)
    
    console.log('\n📊 생성된 테이블 구조:')
    rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`)
    })
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    console.log('\n💡 Supabase Dashboard > SQL Editor에서 다음 SQL을 직접 실행하세요:')
    console.log('\n' + '='.repeat(80))
    console.log(sql)
    console.log('='.repeat(80))
  } finally {
    await client.end()
  }
}

createTable()
