'use server'

import { createClient } from '@/lib/supabase/server'
import { downloadResource as downloadResourceQuery } from '@/lib/supabase/resources'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']

/**
 * 자료 다운로드 서버 액션
 */
export async function downloadResource(
  resourceId: number
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 사용자 레벨 가져오기
    const { data: profileData } = await supabase
      .from('users')
      .select('level, point')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'level' | 'point'> | null

    if (!profile) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    const userLevel = (profile.level || 'bronze') as 'bronze' | 'silver' | 'gold'

    // 다운로드 처리
    const result = await downloadResourceQuery(resourceId, user.id, userLevel)

    if (result.success) {
      revalidatePath('/resources')
      revalidatePath('/mypage')
    }

    return result
  } catch (error: any) {
    console.error('자료 다운로드 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

