'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type CommentRow = Database['public']['Tables']['comments']['Row']
type CommentInsert = Database['public']['Tables']['comments']['Insert']

export interface CommentWithAuthor extends CommentRow {
  author: {
    id: string
    nickname: string | null
    avatar_url: string | null
  } | null
}

/**
 * 댓글 목록 가져오기
 */
export async function getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:users!comments_author_id_fkey (
        id,
        nickname,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('댓글 조회 실패:', error)
    return []
  }

  return (data || []) as CommentWithAuthor[]
}

/**
 * 댓글 작성
 */
export async function createComment(
  postId: number,
  content: string,
  authorId: string
): Promise<{ success: boolean; commentId?: number; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== authorId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 댓글 작성
    const commentData: CommentInsert = {
      post_id: postId,
      author_id: authorId,
      content: content.trim(),
    }

    const { data: commentResult, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select()
      .single()

    if (error || !commentResult) {
      console.error('댓글 작성 실패:', error)
      return { success: false, error: error?.message || '댓글 작성 실패' }
    }

    // posts 테이블의 comments_count 업데이트
    const { error: updateError } = await supabase.rpc('increment_comments_count', {
      post_id_param: postId
    })

    if (updateError) {
      // RPC 함수가 없으면 직접 업데이트
      const { data: postData } = await supabase
        .from('posts')
        .select('comments_count')
        .eq('id', postId)
        .single()

      if (postData) {
        await supabase
          .from('posts')
          .update({ comments_count: (postData.comments_count || 0) + 1 })
          .eq('id', postId)
      }
    }

    revalidatePath(`/community/${postId}`)
    revalidatePath('/community')

    return { success: true, commentId: commentResult.id }
  } catch (error: any) {
    console.error('댓글 작성 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 댓글 삭제
 */
export async function deleteComment(
  commentId: number,
  postId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 댓글 정보 조회
    const { data: commentData } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single()

    if (!commentData) {
      return { success: false, error: '댓글을 찾을 수 없습니다.' }
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profileData = profile as { role: string | null } | null
    const isAdmin = profileData?.role === 'admin'
    const isAuthor = commentData.author_id === user.id

    // 작성자 본인 또는 관리자만 삭제 가능
    if (!isAuthor && !isAdmin) {
      return { success: false, error: '권한이 없습니다.' }
    }

    // 댓글 삭제
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('댓글 삭제 실패:', error)
      return { success: false, error: error.message }
    }

    // posts 테이블의 comments_count 업데이트
    const { data: postData } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', postId)
      .single()

    if (postData) {
      await supabase
        .from('posts')
        .update({ comments_count: Math.max((postData.comments_count || 0) - 1, 0) })
        .eq('id', postId)
    }

    revalidatePath(`/community/${postId}`)
    revalidatePath('/community')

    return { success: true }
  } catch (error: any) {
    console.error('댓글 삭제 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}
