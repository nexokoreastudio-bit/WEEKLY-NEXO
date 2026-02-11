import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { ResourceWriteForm } from '@/components/admin/resource-write-form'

type UserRow = Database['public']['Tables']['users']['Row']
type Resource = Database['public']['Tables']['resources']['Row']

export default async function AdminResourceEditPage({
  params,
}: {
  params: { id: string }
}) {
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

  // 자료 정보 가져오기
  const resourceId = parseInt(params.id)
  const { data: resourceData, error: resourceError } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .single()

  if (resourceError || !resourceData) {
    redirect('/admin/resources')
  }

  const resource = resourceData as Resource

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/admin/resources"
          className="text-nexo-navy hover:text-nexo-cyan mb-4 inline-block"
        >
          ← 자료실 관리로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-nexo-navy mb-2">자료 수정</h1>
        <p className="text-gray-600">
          자료 정보를 수정하세요
        </p>
      </div>

      <ResourceWriteForm
        userId={user.id}
        initialData={{
          id: resource.id,
          title: resource.title,
          description: resource.description,
          file_url: resource.file_url,
          file_type: resource.file_type,
          access_level: resource.access_level,
          download_cost: resource.download_cost,
          thumbnail_url: (resource as any).thumbnail_url || null,
        }}
      />
    </div>
  )
}
