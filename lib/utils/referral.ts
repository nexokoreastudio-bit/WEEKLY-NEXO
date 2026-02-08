/**
 * 추천인 시스템 유틸리티 함수
 */

/**
 * 고유한 추천인 코드 생성
 * 형식: NEXO-XXXX (4자리 랜덤 영숫자)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 혼동 방지를 위해 I, O, 0, 1 제외
  let code = 'NEXO-'
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

/**
 * 추천인 코드 유효성 검증
 */
export function isValidReferralCode(code: string): boolean {
  const pattern = /^NEXO-[A-Z0-9]{4}$/
  return pattern.test(code.toUpperCase())
}

/**
 * 추천인 코드 정규화 (대문자로 변환)
 */
export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase()
}

