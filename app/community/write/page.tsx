import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostWriteForm } from '@/components/community/post-write-form'

export default async function WritePostPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirect=/community/write')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexo-navy mb-2">글쓰기</h1>
        <p className="text-gray-600">커뮤니티에 글을 작성해주세요</p>
      </div>

      <PostWriteForm userId={user.id} />
    </div>
  )
}

