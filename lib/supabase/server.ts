import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

/**
 * 서버 컴포넌트에서 사용하는 Supabase 클라이언트
 * Server Components, Server Actions, Route Handlers에서 사용
 * 기존 연결된 Supabase 서버 활용
 */
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음')
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // 서버 액션에서 호출될 때는 에러 무시
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // 서버 액션에서 호출될 때는 에러 무시
          }
        },
      },
    }
  )
}

/**
 * 관리자 권한이 필요한 작업을 위한 서비스 롤 클라이언트
 * 환경 변수에 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있어야 함
 * 기존 .env.local의 설정 활용
 */
export async function createAdminClient() {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Supabase 관리자 환경 변수가 설정되지 않았습니다.')
    throw new Error('Supabase 관리자 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
  }
  
  return createSupabaseClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

