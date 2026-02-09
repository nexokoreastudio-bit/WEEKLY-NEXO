/**
 * 포인트 시스템 서버 액션
 * 
 * 향후 커뮤니티 활동 보상을 위한 포인트 적립 시스템
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserUpdate = Database['public']['Tables']['users']['Update']
type PointLogInsert = Database['public']['Tables']['point_logs']['Insert']

/**
 * article 읽기 포인트 적립
 * 
 * @param userId 사용자 ID
 * @param articleId article ID (선택사항, 로그용)
 * @returns 성공 여부
 */
export async function rewardReadingPoint(
  userId: string,
  articleId?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. 사용자 정보 확인
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('point')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' }
    }

    // 2. 포인트 적립 (+10점)
    const userData = user as User
    const currentPoint = userData.point || 0
    const newPoint = currentPoint + 10

    const updateData: UserUpdate = { point: newPoint }
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData as any as never)
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: '포인트 업데이트 실패' }
    }

    // 3. 포인트 로그 기록
    const logData1: PointLogInsert = {
      user_id: userId,
      amount: 10,
      reason: 'article_read',
      related_id: articleId || null,
      related_type: 'article',
    }
    
    const { error: logError } = await supabase
      .from('point_logs')
      .insert(logData1 as any)

    if (logError) {
      console.error('포인트 로그 기록 실패:', logError)
      // 로그 실패는 치명적이지 않으므로 계속 진행
    }

    // 4. 레벨 자동 업데이트 (트리거가 처리하지만 명시적으로 확인)
    // bronze: 0-99, silver: 100-499, gold: 500+
    let newLevel: 'bronze' | 'silver' | 'gold' = 'bronze'
    if (newPoint >= 500) {
      newLevel = 'gold'
    } else if (newPoint >= 100) {
      newLevel = 'silver'
    }

    const levelUpdateData: UserUpdate = { level: newLevel }
    await supabase
      .from('users')
      .update(levelUpdateData as any as never)
      .eq('id', userId)

    // 5. 캐시 무효화
    revalidatePath('/')
    revalidatePath('/mypage')

    return { success: true }
  } catch (error: any) {
    console.error('포인트 적립 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 포인트 차감 (자료 다운로드 등)
 * 
 * @param userId 사용자 ID
 * @param amount 차감할 포인트
 * @param reason 차감 사유
 * @param relatedType 관련 타입
 * @param relatedId 관련 ID
 * @returns 성공 여부 및 현재 포인트
 */
export async function deductPoint(
  userId: string,
  amount: number,
  reason: string,
  relatedType?: string,
  relatedId?: number
): Promise<{ success: boolean; currentPoint?: number; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. 사용자 정보 확인
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('point')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' }
    }

    const userData = user as User
    const currentPoint = userData.point || 0

    // 2. 포인트 부족 확인
    if (currentPoint < amount) {
      return { 
        success: false, 
        error: `포인트가 부족합니다. (현재: ${currentPoint}, 필요: ${amount})` 
      }
    }

    // 3. 포인트 차감
    const newPoint = currentPoint - amount

    const updateData: UserUpdate = { point: newPoint }
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData as any as never)
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: '포인트 업데이트 실패' }
    }

    // 4. 포인트 로그 기록
    const logData2: PointLogInsert = {
      user_id: userId,
      amount: -amount,
      reason,
      related_id: relatedId || null,
      related_type: relatedType as 'article' | 'post' | 'comment' | 'resource' | 'checkin' | null || null,
    }
    
    const { error: logError } = await supabase
      .from('point_logs')
      .insert(logData2 as any as never)

    if (logError) {
      console.error('포인트 로그 기록 실패:', logError)
    }

    // 5. 캐시 무효화
    revalidatePath('/')
    revalidatePath('/mypage')

    return { success: true, currentPoint: newPoint }
  } catch (error: any) {
    console.error('포인트 차감 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 사용자 포인트 조회
 * 
 * @param userId 사용자 ID
 * @returns 현재 포인트 및 레벨
 */
export async function getUserPoint(
  userId: string
): Promise<{ point: number; level: string } | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('point, level')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return null
    }

    const userData = data as User
    return {
      point: userData.point || 0,
      level: (userData.level || 'bronze') as 'bronze' | 'silver' | 'gold',
    }
  } catch (error) {
    console.error('포인트 조회 오류:', error)
    return null
  }
}
