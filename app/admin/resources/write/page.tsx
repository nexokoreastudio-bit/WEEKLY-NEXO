import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { ResourceWriteForm } from '@/components/admin/resource-write-form'

type UserRow = Database['public']['Tables']['users']['Row']

export default async function AdminResourceWritePage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirect=/admin/resources/write')
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/admin/resources"
          className="text-nexo-navy hover:text-nexo-cyan mb-4 inline-block"
        >
          ← 자료실 관리로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-nexo-navy mb-2">자료 등록</h1>
        <p className="text-gray-600">
          사용자들이 다운로드할 수 있는 자료를 등록하세요
        </p>
      </div>

      <ResourceWriteForm userId={String(user.id)} />
    </div>
  )
}
