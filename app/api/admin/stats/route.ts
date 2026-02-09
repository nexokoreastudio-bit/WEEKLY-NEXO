import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type PostRow = Database['public']['Tables']['posts']['Row']
type ReviewRatingRow = Pick<PostRow, 'rating'>

export async function GET() {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 통계 데이터 수집
    const [usersResult, postsResult, reviewsResult, leadsResult] =
      await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase
          .from('posts')
          .select('rating')
          .eq('board_type', 'review')
          .not('rating', 'is', null),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
      ])

    // 평균 평점 계산
    let averageRating = 0
    if (reviewsResult.data && reviewsResult.data.length > 0) {
      const typedReviews = reviewsResult.data as ReviewRatingRow[]
      const ratings = typedReviews
        .map((r) => r.rating)
        .filter((rating): rating is number => rating !== null)
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating, 0)
        averageRating = Math.round((sum / ratings.length) * 10) / 10
      }
    }

    return NextResponse.json({
      totalUsers: usersResult.count || 0,
      totalPosts: postsResult.count || 0,
      totalReviews: reviewsResult.data?.length || 0,
      averageRating,
      totalLeads: leadsResult.count || 0,
    })
  } catch (error: any) {
    console.error('통계 데이터 조회 오류:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}


