import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FieldNewsList } from '@/components/admin/field-news-list'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AdminFieldNewsPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirect=/admin/field-news')
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-nexo-navy mb-2">현장 소식 관리</h1>
          <p className="text-gray-600">
            설치기사가 촬영한 현장 사진과 설명을 등록하세요
          </p>
        </div>
        <Link
          href="/admin/field-news/write"
          className="flex items-center gap-2 px-6 py-3 bg-nexo-navy text-white rounded-lg hover:bg-nexo-cyan transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          현장 소식 작성
        </Link>
      </div>

      <FieldNewsList />
    </div>
  )
}

