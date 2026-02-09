import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * 브라우저 환경에서 사용하는 Supabase 클라이언트
 * 클라이언트 컴포넌트나 브라우저에서만 사용 가능
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
