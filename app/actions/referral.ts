'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateReferralCode, isValidReferralCode, normalizeReferralCode } from '@/lib/utils/referral'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type UserUpdate = Database['public']['Tables']['users']['Update']
type PointLogInsert = Database['public']['Tables']['point_logs']['Insert']

/**
 * 사용자에게 고유한 추천인 코드 생성 및 할당
 */
export async function generateUserReferralCode(userId: string): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const supabase = await createAdminClient()

    // 기존 코드 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('referrer_code')
      .eq('id', userId)
      .single()

    if (existingUser?.referrer_code) {
      return { success: true, code: existingUser.referrer_code }
    }

    // 고유한 코드 생성 (중복 체크)
    let attempts = 0
    let newCode: string
    let isUnique = false

    while (!isUnique && attempts < 10) {
      newCode = generateReferralCode()
      
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('referrer_code', newCode)
        .single()

      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return { success: false, error: '추천인 코드 생성에 실패했습니다. 다시 시도해주세요.' }
    }

    // 사용자 프로필에 코드 저장
    const updateData: UserUpdate = {
      referrer_code: newCode,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('추천인 코드 저장 실패:', error)
      return { success: false, error: '추천인 코드 저장에 실패했습니다.' }
    }

    revalidatePath('/mypage')
    return { success: true, code: newCode }
  } catch (error: any) {
    console.error('추천인 코드 생성 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 추천인 코드로 가입 처리 및 포인트 지급
 * 회원가입 후 프로필 생성 시 호출됨
 */
export async function processReferralSignup(
  newUserId: string,
  referrerCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createAdminClient()

    // 추천인 코드 정규화 및 검증
    const normalizedCode = normalizeReferralCode(referrerCode)
    if (!isValidReferralCode(normalizedCode)) {
      return { success: false, error: '유효하지 않은 추천인 코드입니다.' }
    }

    // 추천인 찾기
    const { data: referrer } = await supabase
      .from('users')
      .select('id, point')
      .eq('referrer_code', normalizedCode)
      .single()

    if (!referrer) {
      return { success: false, error: '추천인을 찾을 수 없습니다.' }
    }

    // 자기 자신을 추천인으로 등록하는 것 방지
    if (referrer.id === newUserId) {
      return { success: false, error: '자기 자신을 추천인으로 등록할 수 없습니다.' }
    }

    // 신규 사용자에게 웰컴 포인트 지급 (100포인트)
    const welcomePoints = 100
    const { data: newUser } = await supabase
      .from('users')
      .select('point')
      .eq('id', newUserId)
      .single()

    if (newUser) {
      const newUserUpdateData: UserUpdate = {
        point: (newUser.point || 0) + welcomePoints,
        updated_at: new Date().toISOString(),
      }

      await supabase
        .from('users')
        .update(newUserUpdateData)
        .eq('id', newUserId)

      // 포인트 로그 기록
      const newUserLogData: ExtendedPointLogInsert = {
        user_id: newUserId,
        amount: welcomePoints,
        reason: 'referral_signup_welcome',
        related_id: null,
        related_type: null,
      }
      await supabase.from('point_logs').insert(newUserLogData as PointLogInsert)
    }

    // 추천인에게 추천 포인트 지급 (50포인트)
    const referralPoints = 50
    const referrerUpdateData: UserUpdate = {
      point: (referrer.point || 0) + referralPoints,
      updated_at: new Date().toISOString(),
    }

    const { error: referrerUpdateError } = await supabase
      .from('users')
      .update(referrerUpdateData)
      .eq('id', referrer.id)

    if (referrerUpdateError) {
      console.error('추천인 포인트 지급 실패:', referrerUpdateError)
      // 신규 사용자 포인트는 이미 지급되었으므로 계속 진행
    } else {
      // 추천인 포인트 로그 기록
      const referrerLogData: ExtendedPointLogInsert = {
        user_id: referrer.id,
        amount: referralPoints,
        reason: 'referral_reward',
        related_id: null,
        related_type: null,
      }
      await supabase.from('point_logs').insert(referrerLogData as PointLogInsert)
    }

    revalidatePath('/mypage')
    return { success: true }
  } catch (error: any) {
    console.error('추천인 가입 처리 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 사용자의 추천인 코드 가져오기
 */
export async function getUserReferralCode(userId: string): Promise<{ code: string | null; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('referrer_code')
      .eq('id', userId)
      .single()

    if (error) {
      return { code: null, error: '추천인 코드를 가져올 수 없습니다.' }
    }

    // 코드가 없으면 생성
    if (!data?.referrer_code) {
      const result = await generateUserReferralCode(userId)
      return { code: result.code || null, error: result.error }
    }

    return { code: data.referrer_code }
  } catch (error: any) {
    return { code: null, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

