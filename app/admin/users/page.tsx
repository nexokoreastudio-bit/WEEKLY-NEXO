import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { getUsersList } from '@/app/actions/subscriber'
import { UsersList } from '@/components/admin/users-list'

type UserRow = Database['public']['Tables']['users']['Row']

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { search?: string }
}) {
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

  const typedProfileData = profileData as { role: string | null } | null
  if (typedProfileData?.role !== 'admin') {
    redirect('/')
  }

  // 사용자 목록 가져오기
  const searchQuery = searchParams?.search || ''
  const usersResult = await getUsersList(searchQuery)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 사용자 관리
          </h1>
          <p className="text-gray-600">
            회원 목록을 확인하고 구독자 인증 상태를 관리할 수 있습니다.
          </p>
        </div>

        {/* 사용자 목록 */}
        <UsersList 
          initialUsers={usersResult.data || []} 
          searchQuery={searchQuery}
        />
      </div>
    </div>
  )
}
