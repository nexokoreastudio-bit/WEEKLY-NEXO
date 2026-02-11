import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ResourcesList } from '@/components/admin/resources-list'

type UserRow = Database['public']['Tables']['users']['Row']

export default async function AdminResourcesPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirect=/admin/resources')
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-nexo-navy mb-2">자료실 관리</h1>
          <p className="text-gray-600">
            사용자들이 다운로드할 수 있는 자료를 등록하고 관리하세요
          </p>
        </div>
        <Link
          href="/admin/resources/write"
          className="flex items-center gap-2 px-6 py-3 bg-nexo-navy text-white rounded-lg hover:bg-nexo-cyan transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          자료 등록
        </Link>
      </div>

      <ResourcesList />
    </div>
  )
}
