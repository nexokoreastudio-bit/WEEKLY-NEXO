'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type DailyCheckinInsert = Database['public']['Tables']['daily_checkins']['Insert']

/**
 * 일일 출석 체크인
 * 하루에 한 번만 가능하며, 출석 시 +5 포인트 지급
 */
export async function dailyCheckin(): Promise<{ success: boolean; error?: string; pointsEarned?: number }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 오늘 날짜 확인
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식

    // 오늘 이미 출석했는지 확인
    const { data: existingCheckin } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .single()

    if (existingCheckin) {
      return { success: false, error: '오늘은 이미 출석하셨습니다. 내일 다시 시도해주세요!' }
    }

    // 출석 기록 생성 (트리거가 자동으로 포인트 지급)
    const checkinData: DailyCheckinInsert = {
      user_id: user.id,
      checkin_date: today,
    }

    const { error: insertError } = await supabase
      .from('daily_checkins')
      .insert(checkinData)

    if (insertError) {
      console.error('출석 기록 실패:', insertError)
      return { success: false, error: '출석 처리 중 오류가 발생했습니다.' }
    }

    // 캐시 무효화
    revalidatePath('/mypage')
    revalidatePath('/')

    return { success: true, pointsEarned: 5 }
  } catch (error: any) {
    console.error('일일 출석 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 오늘 출석 여부 확인
 */
export async function getTodayCheckinStatus(): Promise<{ checkedIn: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { checkedIn: false, error: '로그인이 필요합니다.' }
    }

    // 오늘 날짜 확인
    const today = new Date().toISOString().split('T')[0]

    // 오늘 출석 기록 확인
    const { data: checkin } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .single()

    return { checkedIn: !!checkin }
  } catch (error: any) {
    console.error('출석 상태 확인 오류:', error)
    return { checkedIn: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 연속 출석 일수 조회
 */
export async function getCheckinStreak(): Promise<{ streak: number; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { streak: 0, error: '로그인이 필요합니다.' }
    }

    // 최근 출석 기록 가져오기 (최신순)
    const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('checkin_date')
      .eq('user_id', user.id)
      .order('checkin_date', { ascending: false })
      .limit(30) // 최근 30일만 확인

    if (!checkins || checkins.length === 0) {
      return { streak: 0 }
    }

    // 연속 출석 일수 계산
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = new Date(checkins[i].checkin_date)
      checkinDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (checkinDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    return { streak }
  } catch (error: any) {
    console.error('연속 출석 일수 조회 오류:', error)
    return { streak: 0, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}


