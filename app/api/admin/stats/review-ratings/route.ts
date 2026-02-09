import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']

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

    // 후기 평점 데이터
    const { data: reviews } = await supabase
      .from('posts')
      .select('rating')
      .eq('board_type', 'review')
      .not('rating', 'is', null)

    // 평점별 집계
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    if (reviews) {
      reviews.forEach((review) => {
        const rating = (review as { rating: number }).rating
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1
        }
      })
    }

    return NextResponse.json({ data: ratingCounts })
  } catch (error: any) {
    console.error('후기 평점 데이터 조회 오류:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}


