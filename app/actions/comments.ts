'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type CommentRow = Database['public']['Tables']['comments']['Row']
type CommentInsert = Database['public']['Tables']['comments']['Insert']
type PostUpdate = Database['public']['Tables']['posts']['Update']

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
      .insert(commentData as any)
      .select()
      .single()

    if (error || !commentResult) {
      console.error('댓글 작성 실패:', error)
      return { success: false, error: error?.message || '댓글 작성 실패' }
    }

    // 실제 댓글 수를 카운트하여 정확하게 업데이트
    const { count: actualCommentCount, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (countError) {
      console.error('댓글 수 카운트 실패:', countError)
    }

    // posts 테이블의 comments_count를 실제 댓글 수로 업데이트
    const updateData: PostUpdate = { comments_count: actualCommentCount || 0 }
    const { error: updateError } = await supabase
      .from('posts')
      .update(updateData as any as never)
      .eq('id', postId)

    if (updateError) {
      console.error('댓글 수 업데이트 실패:', updateError)
    } else {
      console.log('댓글 수 업데이트 성공:', { postId, commentsCount: actualCommentCount })
    }

    revalidatePath(`/community/${postId}`)
    revalidatePath('/community')

    return { success: true, commentId: (commentResult as any).id }
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

    const comment = commentData as any

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profileData = profile as { role: string | null } | null
    const isAdmin = profileData?.role === 'admin'
    const isAuthor = comment.author_id === user.id

    // 작성자 본인 또는 관리자만 삭제 가능
    if (!isAuthor && !isAdmin) {
      console.error('댓글 삭제 권한 없음:', { 
        userId: user.id, 
        authorId: comment.author_id, 
        isAuthor, 
        isAdmin,
        role: profileData?.role 
      })
      return { success: false, error: '권한이 없습니다.' }
    }

    // 관리자인 경우 Service Role Key를 사용하여 RLS 우회
    const { createAdminClient } = await import('@/lib/supabase/server')
    const deleteClient = isAdmin 
      ? await createAdminClient() 
      : supabase
    if (isAdmin) {
      console.log('관리자 댓글 삭제 모드: Service Role Key 사용')
    }

    // 권한 확인 로그
    console.log('댓글 삭제 권한 확인:', { 
      userId: user.id, 
      authorId: comment.author_id, 
      isAuthor, 
      isAdmin,
      role: profileData?.role,
      usingServiceRole: isAdmin
    })

    // 댓글 삭제
    const { error } = await deleteClient
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('댓글 삭제 실패:', error)
      return { success: false, error: error.message }
    }

    // 실제 댓글 수를 카운트하여 정확하게 업데이트
    const { count: actualCommentCount, error: countError } = await deleteClient
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (countError) {
      console.error('댓글 수 카운트 실패:', countError)
      // 카운트 실패해도 삭제는 성공했으므로 계속 진행
    }

    // posts 테이블의 comments_count를 실제 댓글 수로 업데이트
    const updateClient = isAdmin ? deleteClient : supabase
    const updateData: PostUpdate = { comments_count: actualCommentCount || 0 }
    const { error: updateError } = await updateClient
      .from('posts')
      .update(updateData as any as never)
      .eq('id', postId)

    if (updateError) {
      console.error('댓글 수 업데이트 실패:', updateError)
      // 업데이트 실패해도 삭제는 성공했으므로 계속 진행
    } else {
      console.log('댓글 수 업데이트 성공:', { postId, commentsCount: actualCommentCount })
    }

    revalidatePath(`/community/${postId}`)
    revalidatePath('/community')

    return { success: true }
  } catch (error: any) {
    console.error('댓글 삭제 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}
