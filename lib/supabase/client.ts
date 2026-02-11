import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * 브라우저 환경에서 사용하는 Supabase 클라이언트
 * 클라이언트 컴포넌트나 브라우저에서만 사용 가능
 * 기존 연결된 Supabase 서버 활용
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

