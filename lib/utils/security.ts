/**
 * 서버 전용 보안 유틸리티 함수
 */

import { createClient } from '@/lib/supabase/server'

/**
 * 관리자 권한 확인 (서버 전용)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return false
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch (error) {
    console.error('관리자 권한 확인 실패:', error)
    return false
  }
}

/**
 * URL 검증 (XSS 방지)
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // 허용된 프로토콜만 허용
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

/**
 * 프로덕션 환경에서 민감한 정보 로깅 방지
 */
export function safeLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data)
  } else {
    // 프로덕션에서는 민감한 정보 제거 후 로깅
    const sanitizedData = data ? JSON.stringify(data).replace(/password|token|key|secret/gi, '[REDACTED]') : undefined
    console.log(message, sanitizedData)
  }
}
