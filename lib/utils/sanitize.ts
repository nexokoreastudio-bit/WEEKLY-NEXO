/**
 * 클라이언트/서버 양쪽에서 사용 가능한 HTML sanitization 유틸리티
 * 서버 전용 의존성 없이 순수 함수로 구현
 */

/**
 * HTML sanitization (기본적인 XSS 방지)
 * 프로덕션에서는 DOMPurify 같은 라이브러리 사용 권장
 * 이미지 태그는 보존하되 위험한 속성만 제거
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  // 기본적인 스크립트 태그 제거
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // 이벤트 핸들러 제거
    .replace(/javascript:/gi, '') // javascript: 프로토콜 제거
  
  // img 태그의 src 속성에서 위험한 프로토콜 제거 (data:와 http/https는 허용)
  sanitized = sanitized.replace(
    /<img([^>]*)\s+src\s*=\s*["'](?!data:|https?:)([^"']+)["']([^>]*)>/gi,
    '<img$1$3>'
  )
  
  return sanitized
}
