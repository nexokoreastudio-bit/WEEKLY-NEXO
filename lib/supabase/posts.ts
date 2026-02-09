/**
 * Posts 관련 Supabase 쿼리 함수
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']
type PostRow = Database['public']['Tables']['posts']['Row']
type PostInsert = Database['public']['Tables']['posts']['Insert']
type PostUpdate = Database['public']['Tables']['posts']['Update']

export interface PostWithAuthor extends Post {
  author: {
    id: string
    nickname: string | null
    avatar_url: string | null
  } | null
}

/**
 * 게시판 타입별 게시글 목록 가져오기
 * 중고장터(market) 게시글은 제외
 */
export async function getPostsByBoardType(
  boardType: 'free' | 'qna' | 'tip' | 'market' | 'review' | null = null,
  limit: number = 20,
  offset: number = 0
): Promise<PostWithAuthor[]> {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        nickname,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // 중고장터 게시글은 항상 제외
  query = query.neq('board_type', 'market')

  if (boardType && boardType !== 'market') {
    query = query.eq('board_type', boardType)
  }

  const { data, error } = await query

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('게시글 조회 실패:', error)
    }
    return []
  }

  return (data || []) as PostWithAuthor[]
}

/**
 * 특정 게시글 가져오기
 */
export async function getPostById(postId: number): Promise<PostWithAuthor | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        nickname,
        avatar_url
      )
    `)
    .eq('id', postId)
    .single()

  if (error) {
    console.error('게시글 조회 실패:', error)
    return null
  }

  return data as PostWithAuthor
}

/**
 * 게시글 작성
 */
export async function createPost(
  boardType: 'free' | 'qna' | 'tip' | 'market' | 'review',
  title: string,
  content: string,
  authorId: string,
  images?: string[],
  rating?: number
): Promise<{ success: boolean; postId?: number; error?: string }> {
  try {
    const supabase = await createClient()

    const postData: PostInsert = {
      board_type: boardType,
      title,
      content,
      author_id: authorId,
      images: images || null,
      likes_count: 0,
      comments_count: 0,
      rating: boardType === 'review' ? (rating || null) : null,
      is_best: false,
      is_verified_review: false,
    }

    const { data: postResult, error } = await supabase
      .from('posts')
      .insert(postData as any as never)
      .select()
      .single()

    if (error || !postResult) {
      console.error('게시글 작성 실패:', error)
      return { success: false, error: error?.message || '게시글 작성 실패' }
    }

    const newPost = postResult as PostRow
    return { success: true, postId: newPost.id }
  } catch (error: any) {
    console.error('게시글 작성 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 게시글 수정
 */
export async function updatePost(
  postId: number,
  title: string,
  content: string,
  authorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 작성자 확인
    const { data: postData } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    const post = postData as Pick<PostRow, 'author_id'> | null

    if (!post || post.author_id !== authorId) {
      return { success: false, error: '권한이 없습니다.' }
    }

    const updateData: PostUpdate = {
      title,
      content,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData as any as never)
      .eq('id', postId)

    if (error) {
      console.error('게시글 수정 실패:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('게시글 수정 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 게시글 삭제
 * 작성자 본인 또는 관리자만 삭제 가능
 */
export async function deletePost(
  postId: number,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 게시글 정보 조회
    const { data: postData } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    const post = postData as Pick<PostRow, 'author_id'> | null

    if (!post) {
      return { success: false, error: '게시글을 찾을 수 없습니다.' }
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isAuthor = post.author_id === userId

    // 작성자 본인 또는 관리자만 삭제 가능
    if (!isAuthor && !isAdmin) {
      return { success: false, error: '권한이 없습니다.' }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('게시글 삭제 실패:', error)
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('게시글 삭제 오류:', error)
    }
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

