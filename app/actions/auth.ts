'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  // redirect 대신 클라이언트 측에서 리다이렉트 처리하도록 변경
  // 클라이언트 컴포넌트에서 router.push('/') 사용
}


