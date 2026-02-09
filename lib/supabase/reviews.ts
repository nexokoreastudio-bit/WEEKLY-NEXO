/**
 * Reviews 관련 Supabase 쿼리 함수
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type PostRow = Database['public']['Tables']['posts']['Row']

export interface ReviewWithAuthor extends PostRow {
  author: {
    id: string
    nickname: string | null
    avatar_url: string | null
    subscriber_verified: boolean
  } | null
}

/**
 * 베스트 후기 목록 가져오기
 */
export async function getBestReviews(limit: number = 5): Promise<ReviewWithAuthor[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        nickname,
        avatar_url,
        subscriber_verified
      )
    `)
    .eq('board_type', 'review')
    .eq('is_best', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('베스트 후기 조회 실패:', error)
    return []
  }

  return (data || []) as ReviewWithAuthor[]
}

/**
 * 후기 목록 가져오기 (평점순, 최신순, 인기순)
 */
export async function getReviews(
  sortBy: 'rating' | 'latest' | 'popular' = 'latest',
  limit: number = 20,
  offset: number = 0
): Promise<ReviewWithAuthor[]> {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        nickname,
        avatar_url,
        subscriber_verified
      )
    `)
    .eq('board_type', 'review')
    .range(offset, offset + limit - 1)

  // 정렬 방식에 따라 order 변경
  if (sortBy === 'rating') {
    query = query.order('rating', { ascending: false }).order('created_at', { ascending: false })
  } else if (sortBy === 'popular') {
    query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('후기 조회 실패:', error)
    return []
  }

  return (data || []) as ReviewWithAuthor[]
}

/**
 * 구매 인증 후기만 가져오기
 */
export async function getVerifiedReviews(limit: number = 10): Promise<ReviewWithAuthor[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        nickname,
        avatar_url,
        subscriber_verified
      )
    `)
    .eq('board_type', 'review')
    .eq('is_verified_review', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('구매 인증 후기 조회 실패:', error)
    return []
  }

  return (data || []) as ReviewWithAuthor[]
}

/**
 * 평균 평점 계산
 */
export async function getAverageRating(): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('rating')
    .eq('board_type', 'review')
    .not('rating', 'is', null)

  if (error || !data || data.length === 0) {
    return 0
  }

  const ratings = data.map((post) => (post as { rating: number }).rating)
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10 // 소수점 첫째자리까지
}

/**
 * 평점별 후기 개수 통계
 */
export async function getRatingStats(): Promise<Record<number, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('rating')
    .eq('board_type', 'review')
    .not('rating', 'is', null)

  if (error || !data) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  }

  const stats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  data.forEach((post) => {
    const rating = (post as { rating: number }).rating
    if (rating >= 1 && rating <= 5) {
      stats[rating] = (stats[rating] || 0) + 1
    }
  })

  return stats
}


