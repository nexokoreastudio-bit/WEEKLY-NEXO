'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    academy_name: '',
    phone: '',
    referrer_code: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 비밀번호 확인
      if (formData.password !== formData.passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다.')
        setLoading(false)
        return
      }

      // 비밀번호 길이 확인
      if (formData.password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.')
        setLoading(false)
        return
      }

      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            academy_name: formData.academy_name || '',
            phone: formData.phone || '',
            referrer_code: formData.referrer_code || '',
          },
          emailRedirectTo: window.location.origin,
        },
      })

      if (signUpError) {
        let errorMsg = signUpError.message || '알 수 없는 오류가 발생했습니다.'

        if (errorMsg.includes('rate limit')) {
          errorMsg = '이메일 전송 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.'
        } else if (errorMsg.includes('invalid')) {
          errorMsg = '이메일 주소가 유효하지 않습니다.'
        } else if (errorMsg.includes('already registered')) {
          errorMsg = '이미 가입된 이메일입니다. 로그인을 시도해주세요.'
        } else if (errorMsg.includes('Email signups are disabled')) {
          errorMsg = '이메일 회원가입이 비활성화되어 있습니다.'
        }

        setError(errorMsg)
        setLoading(false)
        return
      }

      // 이메일 확인이 필요한 경우
      if (data.user && !data.session) {
        alert('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.')
        router.push('/login')
      } else {
        alert('구독이 완료되었습니다! 🎉')
        router.push('/')
      }
    } catch (err) {
      setError('회원 가입 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            NEXO Daily에 가입하고 다양한 혜택을 받아보세요
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
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="최소 6자 이상"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academy_name">학원명</Label>
              <Input
                id="academy_name"
                name="academy_name"
                type="text"
                placeholder="소속 학원명 (선택사항)"
                value={formData.academy_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-0000-0000 (선택사항)"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referrer_code">추천인 코드</Label>
              <Input
                id="referrer_code"
                name="referrer_code"
                type="text"
                placeholder="추천인 코드 (선택사항)"
                value={formData.referrer_code}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>

            <div className="text-center text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

