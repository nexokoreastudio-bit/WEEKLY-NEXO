'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 좋아요 토글 (추가/제거)
 */
export async function toggleLike(
  postId: number,
  userId: string
): Promise<{ success: boolean; isLiked: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return { success: false, isLiked: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 기존 좋아요 확인
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // 좋아요 제거
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (error) {
        console.error('좋아요 제거 실패:', error)
        return { success: false, isLiked: true, error: error.message }
      }

      // posts 테이블의 likes_count 업데이트
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single()

      if (postData) {
        await supabase
          .from('posts')
          .update({ likes_count: Math.max((postData.likes_count || 0) - 1, 0) })
          .eq('id', postId)
      }

      revalidatePath(`/community/${postId}`)
      revalidatePath('/community')

      return { success: true, isLiked: false }
    } else {
      // 좋아요 추가
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
        })

      if (error) {
        console.error('좋아요 추가 실패:', error)
        return { success: false, isLiked: false, error: error.message }
      }

      // posts 테이블의 likes_count 업데이트
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single()

      if (postData) {
        await supabase
          .from('posts')
          .update({ likes_count: (postData.likes_count || 0) + 1 })
          .eq('id', postId)
      }

      revalidatePath(`/community/${postId}`)
      revalidatePath('/community')

      return { success: true, isLiked: true }
    }
  } catch (error: any) {
    console.error('좋아요 토글 오류:', error)
    return { success: false, isLiked: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 사용자가 특정 게시글에 좋아요를 눌렀는지 확인
 */
export async function checkUserLiked(
  postId: number,
  userId: string | null
): Promise<boolean> {
  if (!userId) return false

  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    return !!data
  } catch {
    return false
  }
}
