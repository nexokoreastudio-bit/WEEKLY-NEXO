'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateFieldNewsData {
  title: string
  content: string
  location?: string | null
  installation_date?: string | null
  images?: string[] | null
  author_id: string
}

/**
 * 현장 소식 작성 서버 액션
 */
export async function createFieldNews(
  data: CreateFieldNewsData
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== data.author_id) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 현장 소식 작성
    const { data: fieldNews, error } = await supabase
      .from('field_news')
      .insert({
        title: data.title,
        content: data.content,
        location: data.location,
        installation_date: data.installation_date || null,
        images: data.images,
        author_id: data.author_id,
        is_published: false, // 기본값은 임시저장
        views: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('현장 소식 작성 실패:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/field')
    revalidatePath('/admin/field-news')

    return { success: true, id: fieldNews.id }
  } catch (error: any) {
    console.error('현장 소식 작성 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 현장 소식 수정 서버 액션
 */
export async function updateFieldNews(
  id: number,
  data: Partial<CreateFieldNewsData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 현장 소식 수정
    const { error } = await supabase
      .from('field_news')
      .update({
        title: data.title,
        content: data.content,
        location: data.location,
        installation_date: data.installation_date,
        images: data.images,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('현장 소식 수정 실패:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/field')
    revalidatePath('/admin/field-news')

    return { success: true }
  } catch (error: any) {
    console.error('현장 소식 수정 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

