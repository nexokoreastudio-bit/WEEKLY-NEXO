import { redirect, notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { FieldNewsWriteForm } from '@/components/admin/field-news-write-form'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type FieldNewsRow = Database['public']['Tables']['field_news']['Row']

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditFieldNewsPage({ params }: PageProps) {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirect=/admin/field-news')
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

  // 현장 소식 조회 (관리자 클라이언트로 RLS 우회)
  const adminSupabase = await createAdminClient()
  const newsId = parseInt(params.id)

  if (isNaN(newsId)) {
    notFound()
  }

  const { data: fieldNews, error } = await adminSupabase
    .from('field_news')
    .select('*')
    .eq('id', newsId)
    .single()

  if (error || !fieldNews) {
    notFound()
  }

  const news = fieldNews as FieldNewsRow

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexo-navy mb-2">현장 소식 수정</h1>
        <p className="text-gray-600">
          현장 소식 내용을 수정하세요
        </p>
      </div>

      <FieldNewsWriteForm
        userId={user.id}
        initialData={{
          id: news.id,
          title: news.title,
          content: news.content,
          location: news.location || undefined,
          installation_date: news.installation_date || undefined,
          images: news.images || undefined,
          store_name: news.store_name || undefined,
          model: news.model || undefined,
          additional_cables: news.additional_cables || undefined,
          stand: news.stand || undefined,
          wall_mount: news.wall_mount || undefined,
          payment: news.payment || undefined,
          notes: news.notes || undefined,
        }}
      />
    </div>
  )
}
