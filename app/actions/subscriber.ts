'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type UserUpdate = Database['public']['Tables']['users']['Update']

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
    const { data: existingUserData } = await supabase
      .from('users')
      .select('subscriber_verified, purchase_serial_number')
      .eq('id', userId)
      .single()

    const existingUser = existingUserData as Pick<UserRow, 'subscriber_verified' | 'purchase_serial_number'> | null

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
    const updateData: UserUpdate = {
      subscriber_verified: true,
      purchase_serial_number: serialNumber,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData as any as never)
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

    const { data: userData, error } = await supabase
      .from('users')
      .select('subscriber_verified, purchase_serial_number, verified_at')
      .eq('id', userId)
      .single()

    if (error) {
      return { verified: false, error: error.message }
    }

    const data = userData as Pick<UserRow, 'subscriber_verified' | 'purchase_serial_number' | 'verified_at'> | null

    return {
      verified: data?.subscriber_verified || false,
      serialNumber: data?.purchase_serial_number || null,
      verifiedAt: data?.verified_at || null,
    }
  } catch (error: any) {
    return { verified: false, error: error.message }
  }
}

/**
 * 관리자용: 사용자 구독자 상태 설정
 */
export async function setSubscriberStatus(
  targetUserId: string,
  verified: boolean,
  serialNumber?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const typedProfileData = profileData as { role: string | null } | null
    if (typedProfileData?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 구독자 상태 업데이트
    const updateData: UserUpdate = {
      subscriber_verified: verified,
      verified_at: verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (serialNumber) {
      updateData.purchase_serial_number = serialNumber
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData as any as never)
      .eq('id', targetUserId)

    if (updateError) {
      console.error('구독자 상태 업데이트 실패:', updateError)
      return { success: false, error: '구독자 상태 업데이트 중 오류가 발생했습니다.' }
    }

    // 캐시 무효화
    revalidatePath('/admin/users')
    revalidatePath('/mypage')

    return { success: true }
  } catch (error: any) {
    console.error('구독자 상태 설정 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 관리자용: 사용자 목록 조회
 */
export async function getUsersList(searchQuery?: string) {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.', data: [] }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const typedProfileData = profileData as { role: string | null } | null
    if (typedProfileData?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.', data: [] }
    }

    // 사용자 목록 조회
    // 관리자는 Service Role Key를 사용하여 RLS 우회
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()
    
    let query = adminSupabase
      .from('users')
      .select('id, email, nickname, subscriber_verified, purchase_serial_number, verified_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    // 검색 쿼리가 있으면 필터링
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = `%${searchQuery.trim()}%`
      // Supabase의 or() 메서드에서 ilike 사용
      // 와일드카드는 별표(*)로 표시하거나, 각 조건을 별도로 처리
      // 더 안정적인 방법: 각 필드에 대해 별도로 필터링 후 결과 합치기
      const emailQuery = adminSupabase
        .from('users')
        .select('id, email, nickname, subscriber_verified, purchase_serial_number, verified_at, created_at')
        .ilike('email', searchTerm)
        .order('created_at', { ascending: false })
        .limit(100)
      
      const nicknameQuery = adminSupabase
        .from('users')
        .select('id, email, nickname, subscriber_verified, purchase_serial_number, verified_at, created_at')
        .ilike('nickname', searchTerm)
        .order('created_at', { ascending: false })
        .limit(100)
      
      const [emailResult, nicknameResult] = await Promise.all([
        emailQuery,
        nicknameQuery
      ])
      
      // 결과 합치기 (중복 제거)
      const emailUsers = (emailResult.data || []) as any[]
      const nicknameUsers = (nicknameResult.data || []) as any[]
      const allUsers = [...emailUsers, ...nicknameUsers]
      
      // 중복 제거 (id 기준)
      const uniqueUsers = Array.from(
        new Map(allUsers.map(user => [user.id, user])).values()
      )
      
      // 정렬 (최신순)
      uniqueUsers.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })
      
      // 타입 변환
      const users = uniqueUsers.slice(0, 100).map((user: any) => ({
        id: String(user.id || ''),
        email: user.email ? String(user.email) : null,
        nickname: user.nickname ? String(user.nickname) : null,
        subscriber_verified: Boolean(user.subscriber_verified),
        purchase_serial_number: user.purchase_serial_number ? String(user.purchase_serial_number) : null,
        verified_at: user.verified_at ? String(user.verified_at) : null,
        created_at: String(user.created_at || ''),
      }))

      return { success: true, data: users }
    }

    const { data: usersData, error } = await query

    if (error) {
      console.error('사용자 목록 조회 실패:', error)
      return { success: false, error: error.message, data: [] }
    }

    // 타입 변환
    const users = (usersData || []).map((user: any) => ({
      id: String(user.id || ''),
      email: user.email ? String(user.email) : null,
      nickname: user.nickname ? String(user.nickname) : null,
      subscriber_verified: Boolean(user.subscriber_verified),
      purchase_serial_number: user.purchase_serial_number ? String(user.purchase_serial_number) : null,
      verified_at: user.verified_at ? String(user.verified_at) : null,
      created_at: String(user.created_at || ''),
    }))

    return { success: true, data: users }
  } catch (error: any) {
    console.error('사용자 목록 조회 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.', data: [] }
  }
}

