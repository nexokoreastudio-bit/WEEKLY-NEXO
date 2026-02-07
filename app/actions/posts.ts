'use server'

import { createClient } from '@/lib/supabase/server'
import { createPost as createPostQuery } from '@/lib/supabase/posts'
import { rewardReadingPoint } from '@/lib/actions/point'
import { revalidatePath } from 'next/cache'

/**
 * 게시글 작성 서버 액션
 */
export async function createPost(
  boardType: 'free' | 'qna' | 'tip' | 'market',
  title: string,
  content: string,
  authorId: string,
  images?: string[]
): Promise<{ success: boolean; postId?: number; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== authorId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 게시글 작성
    const result = await createPostQuery(boardType, title, content, authorId, images)

    if (result.success && result.postId) {
      // 게시글 작성 포인트 적립 (+5점)
      await rewardReadingPoint(authorId)

      revalidatePath('/community')
      revalidatePath(`/community/${result.postId}`)
    }

    return result
  } catch (error: any) {
    console.error('게시글 작성 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

