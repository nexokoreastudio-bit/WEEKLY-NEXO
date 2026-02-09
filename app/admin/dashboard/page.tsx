import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsOverview } from '@/components/admin/stats-overview'
import { UserGrowthChart } from '@/components/admin/user-growth-chart'
import { PostActivityChart } from '@/components/admin/post-activity-chart'
import { ReviewRatingChart } from '@/components/admin/review-rating-chart'
import { LeadStatsChart } from '@/components/admin/lead-stats-chart'

type UserRow = Database['public']['Tables']['users']['Row']

export const metadata = {
  title: '관리자 대시보드 | NEXO Daily',
  description: 'NEXO Daily 플랫폼 통계 및 분석 대시보드',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 관리자 권한 확인
  const { data: profileData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<UserRow, 'role'> | null

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 관리자 대시보드
          </h1>
          <p className="text-gray-600">
            NEXO Daily 플랫폼의 통계 및 분석 데이터를 확인하세요
          </p>
        </div>

        {/* 통계 개요 */}
        <StatsOverview />

        {/* 차트 그리드 */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* 사용자 증가 추이 */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 증가 추이</CardTitle>
              <CardDescription>최근 30일간 가입자 수</CardDescription>
            </CardHeader>
            <CardContent>
              <UserGrowthChart />
            </CardContent>
          </Card>

          {/* 게시글 활동 */}
          <Card>
            <CardHeader>
              <CardTitle>게시글 활동</CardTitle>
              <CardDescription>최근 30일간 게시글 작성 수</CardDescription>
            </CardHeader>
            <CardContent>
              <PostActivityChart />
            </CardContent>
          </Card>

          {/* 후기 평점 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>후기 평점 분포</CardTitle>
              <CardDescription>고객 후기 평점 통계</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewRatingChart />
            </CardContent>
          </Card>

          {/* 리드 통계 */}
          <Card>
            <CardHeader>
              <CardTitle>리드 통계</CardTitle>
              <CardDescription>상담/견적 신청 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadStatsChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


