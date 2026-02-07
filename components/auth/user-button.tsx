'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

export function UserButton() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="flex gap-2">
        <div className="h-10 w-16 animate-pulse bg-muted rounded" />
        <div className="h-10 w-20 animate-pulse bg-muted rounded" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => router.push('/login')}>
          로그인
        </Button>
        <Button onClick={() => router.push('/signup')}>
          회원가입
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/mypage')}
        className="text-sm"
      >
        마이페이지
      </Button>
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {user.user_metadata?.name || user.email}
      </span>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        로그아웃
      </Button>
    </div>
  )
}

