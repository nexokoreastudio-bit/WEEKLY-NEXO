import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FieldNewsWriteForm } from '@/components/admin/field-news-write-form'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']

export default async function WriteFieldNewsPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirect=/admin/field-news/write')
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
        <h1 className="text-3xl font-bold text-nexo-navy mb-2">현장 소식 작성</h1>
        <p className="text-gray-600">
          설치기사가 촬영한 현장 사진과 설명을 등록하세요
        </p>
      </div>

      <FieldNewsWriteForm userId={user.id} />
    </div>
  )
}

