'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // 이미 로그인된 사용자는 홈으로 리다이렉트
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // 리다이렉트는 window.location을 사용하여 컴포넌트 언마운트 보장
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        }
      } catch (err) {
        // 에러 무시 (로그인 페이지에 머무름)
      }
    }
    
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 환경 변수 확인
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase 환경 변수가 설정되지 않았습니다.')
        setError('시스템 설정 오류가 발생했습니다. 관리자에게 문의해주세요.')
        setLoading(false)
        return
      }

      const supabase = createClient()
      
      // 이메일 형식 확인
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('이메일 형식이 올바르지 않습니다.')
        setLoading(false)
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        let errorMsg = signInError.message || '이메일 또는 비밀번호가 올바르지 않습니다.'
        
        if (errorMsg.includes('Invalid login credentials')) {
          errorMsg = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (errorMsg.includes('Email not confirmed')) {
          errorMsg = '이메일 인증이 필요합니다. 가입 시 받은 이메일을 확인해주세요.'
        }
        
        setError(errorMsg)
        setLoading(false)
        return
      }

      if (data?.user) {
        // 로그인 성공
        if (remember && typeof window !== 'undefined') {
          localStorage.setItem('nexo-login-remember', 'true')
        }
        
        // 페이지 새로고침 후 홈으로 이동
        router.refresh()
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          } else {
            router.push('/')
          }
        }, 100)
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('로그인 오류:', err)
      setError(err?.message || '로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">로딩 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            NEXO Daily에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                로그인 상태 유지
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            <div className="text-center text-sm space-y-2">
              <div>
                <Link href="/signup" className="text-primary hover:underline">
                  회원가입
                </Link>
                {' · '}
                <Link href="/find-password" className="text-muted-foreground hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

