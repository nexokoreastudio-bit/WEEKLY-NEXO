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
    let mounted = true

    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user)
        setLoading(false)
      }
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        if (!session?.user) {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      // 클라이언트 측에서도 로그아웃 처리
      await supabase.auth.signOut()
      // 서버 액션 호출
      await signOut()
      // 상태 즉시 업데이트
      setUser(null)
      // 페이지 새로고침하여 모든 상태 동기화
      router.refresh()
      // window.location을 사용하여 완전한 페이지 리로드
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // 에러가 발생해도 리다이렉트는 시도
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
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

