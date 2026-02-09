import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { InsightForm } from '@/components/admin/insight-form'
import { InsightList } from '@/components/admin/insight-list'
import { getAllEditionsWithInfo } from '@/lib/supabase/articles'

type UserRow = Database['public']['Tables']['users']['Row']

export default async function AdminInsightsPage() {
  const supabase = await createClient()

  // 인증 확인
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

  // 발행 가능한 에디션 목록 가져오기
  const editions = await getAllEditionsWithInfo()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          학부모님 상담용 인사이트 관리
        </h1>
        <p className="text-gray-600">
          링크를 입력하면 자동으로 상담용 인사이트 글이 생성됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 링크 입력 폼 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">새 인사이트 추가</h2>
            <InsightForm editions={editions} />
          </div>
        </div>

        {/* 인사이트 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">인사이트 목록</h2>
            <InsightList editions={editions} />
          </div>
        </div>
      </div>
    </div>
  )
}

