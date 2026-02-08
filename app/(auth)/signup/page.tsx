'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signup } from '@/app/actions/signup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { normalizeReferralCode } from '@/lib/utils/referral'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  // URL 파라미터에서 추천인 코드 읽기
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      const normalizedCode = normalizeReferralCode(refCode)
      setFormData(prev => ({ ...prev, referrer_code: normalizedCode }))
    }
  }, [searchParams])

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

      // 서버 액션으로 회원가입 처리 (추천인 코드 처리 포함)
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        academy_name: formData.academy_name || '',
        phone: formData.phone || '',
        referrer_code: formData.referrer_code || '',
      })

      if (!result.success) {
        setError(result.error || '회원가입에 실패했습니다.')
        setLoading(false)
        return
      }

      // 회원가입 성공
      alert('회원가입이 완료되었습니다! 🎉\n이메일을 확인하여 계정을 활성화해주세요.')
      router.push('/login')
    } catch (err: any) {
      setError(err.message || '회원 가입 중 오류가 발생했습니다.')
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
              <Label htmlFor="referrer_code">추천인 코드 (선택사항)</Label>
              <Input
                id="referrer_code"
                name="referrer_code"
                type="text"
                placeholder="NEXO-XXXX 형식으로 입력"
                value={formData.referrer_code}
                onChange={handleChange}
                disabled={loading}
                className="uppercase"
              />
              {formData.referrer_code && (
                <p className="text-xs text-green-600">
                  ✅ 추천인 코드가 적용되었습니다! 가입 시 양쪽 모두 포인트를 받습니다.
                </p>
              )}
              <p className="text-xs text-gray-500">
                추천인 코드로 가입하면 신규 회원 +100P, 추천인 +50P를 받습니다! 💰
              </p>
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

