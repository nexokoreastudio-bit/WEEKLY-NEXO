'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 구독자 인증 서버 액션
 * 시리얼 번호를 검증하고 구독자 인증 상태를 업데이트합니다
 */
export async function verifySubscriber(
  userId: string,
  serialNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 시리얼 번호 검증 (실제로는 구매 DB와 매칭해야 함)
    // 여기서는 간단한 검증 로직 사용
    const isValidSerial = validateSerialNumber(serialNumber)
    
    if (!isValidSerial) {
      return { success: false, error: '유효하지 않은 시리얼 번호입니다.' }
    }

    // 중복 인증 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('subscriber_verified, purchase_serial_number')
      .eq('id', userId)
      .single()

    if (existingUser?.subscriber_verified) {
      return { success: false, error: '이미 인증이 완료된 계정입니다.' }
    }

    // 시리얼 번호 중복 확인 (다른 사용자가 이미 사용한 경우)
    const { data: existingSerial } = await supabase
      .from('users')
      .select('id')
      .eq('purchase_serial_number', serialNumber)
      .neq('id', userId)
      .single()

    if (existingSerial) {
      return { success: false, error: '이미 사용된 시리얼 번호입니다.' }
    }

    // 구독자 인증 업데이트
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscriber_verified: true,
        purchase_serial_number: serialNumber,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('구독자 인증 업데이트 실패:', updateError)
      return { success: false, error: '인증 처리 중 오류가 발생했습니다.' }
    }

    // 캐시 무효화
    revalidatePath('/mypage')

    return { success: true }
  } catch (error: any) {
    console.error('구독자 인증 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 시리얼 번호 검증 함수
 * 실제로는 구매 DB와 매칭해야 함
 */
function validateSerialNumber(serial: string): boolean {
  // 기본 형식 검증: NEXO-YYYY-XXXX-XXXX 또는 유사한 형식
  const serialPattern = /^NEXO-?\d{4}-?[A-Z0-9]{4}-?[A-Z0-9]{4}$/i
  return serialPattern.test(serial.trim())
}

/**
 * 구독자 인증 상태 조회
 */
export async function getSubscriberStatus(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('subscriber_verified, purchase_serial_number, verified_at')
      .eq('id', userId)
      .single()

    if (error) {
      return { verified: false, error: error.message }
    }

    return {
      verified: data?.subscriber_verified || false,
      serialNumber: data?.purchase_serial_number || null,
      verifiedAt: data?.verified_at || null,
    }
  } catch (error: any) {
    return { verified: false, error: error.message }
  }
}

