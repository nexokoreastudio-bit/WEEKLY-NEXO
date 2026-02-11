'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

// daily_checkins 타입 정의 (Database 타입에서 추출)
type DailyCheckinRow = Database['public']['Tables']['daily_checkins'] extends { Row: infer T } 
  ? T 
  : {
      id: number
      user_id: string
      checkin_date: string
      created_at: string
    }

type DailyCheckinInsert = Database['public']['Tables']['daily_checkins'] extends { Insert: infer T } 
  ? T 
  : {
      id?: number
      user_id: string
      checkin_date: string
      created_at?: string
    }

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
    const { data: existingCheckin, error: checkError } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .maybeSingle()

    // 에러가 있고 PGRST116이 아닌 경우 (레코드 없음은 정상)
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('출석 기록 확인 오류:', checkError)
      return { success: false, error: '출석 상태 확인 중 오류가 발생했습니다.' }
    }

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
      .insert(checkinData as any)

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
    const { data: checkin, error: checkinError } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .maybeSingle()

    // 에러가 있고 PGRST116이 아닌 경우 (레코드 없음은 정상)
    if (checkinError && checkinError.code !== 'PGRST116') {
      console.error('출석 기록 조회 오류:', checkinError)
      return { checkedIn: false, error: '출석 상태 확인 중 오류가 발생했습니다.' }
    }

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
    const { data: checkinsData, error: checkinsError } = await supabase
      .from('daily_checkins')
      .select('checkin_date')
      .eq('user_id', user.id)
      .order('checkin_date', { ascending: false })
      .limit(30) // 최근 30일만 확인

    if (checkinsError) {
      console.error('출석 기록 조회 오류:', checkinsError)
      return { streak: 0, error: '출석 기록 조회 중 오류가 발생했습니다.' }
    }

    // 타입 명시적으로 지정
    const typedCheckinsData = (checkinsData || []) as { checkin_date: string }[]
    const checkins = typedCheckinsData.map(item => ({
      checkin_date: String(item.checkin_date || '')
    }))

    if (!checkins || checkins.length === 0) {
      return { streak: 0 }
    }

    // 연속 출석 일수 계산
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < checkins.length; i++) {
      const checkinDateStr = String(checkins[i].checkin_date)
      if (!checkinDateStr) continue
      
      const checkinDate = new Date(checkinDateStr)
      if (isNaN(checkinDate.getTime())) continue
      
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


