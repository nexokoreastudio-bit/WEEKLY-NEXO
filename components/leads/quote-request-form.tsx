'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createQuoteRequest } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function QuoteRequestForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    academy_name: '',
    region: '',
    size: '',
    mount_type: '',
    quantity: '',
    message: '',
    referrer_code: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await createQuoteRequest({
        ...formData,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      })

      if (!result.success) {
        setError(result.error || '견적 요청에 실패했습니다.')
        setLoading(false)
        return
      }

      // 성공 시 감사 페이지로 이동
      alert('견적 요청이 완료되었습니다! 🎉\n24시간 이내에 견적서를 보내드리겠습니다.')
      router.push('/')
    } catch (err: any) {
      setError(err.message || '견적 요청 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">연락처 *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="010-0000-0000"
            value={formData.phone}
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
            placeholder="학원명 (선택사항)"
            value={formData.academy_name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">지역 *</Label>
        <Input
          id="region"
          name="region"
          type="text"
          placeholder="예: 서울 노원구"
          value={formData.region}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">인치 종류 *</Label>
          <Select
            value={formData.size}
            onValueChange={(value) => handleSelectChange('size', value)}
            disabled={loading}
          >
            <SelectTrigger id="size">
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="65">65인치</SelectItem>
              <SelectItem value="75">75인치</SelectItem>
              <SelectItem value="86">86인치</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mount_type">설치 방식 *</Label>
          <Select
            value={formData.mount_type}
            onValueChange={(value) => handleSelectChange('mount_type', value)}
            disabled={loading}
          >
            <SelectTrigger id="mount_type">
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wall">벽걸이</SelectItem>
              <SelectItem value="stand">이동형 스탠드</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">구매 수량 *</Label>
          <Select
            value={formData.quantity}
            onValueChange={(value) => handleSelectChange('quantity', value)}
            disabled={loading}
          >
            <SelectTrigger id="quantity">
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1대</SelectItem>
              <SelectItem value="2">2대</SelectItem>
              <SelectItem value="3">3대</SelectItem>
              <SelectItem value="4">4대</SelectItem>
              <SelectItem value="5">5대 이상</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">추가 요청사항</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="특별 요청사항이나 질문을 입력해주세요"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referrer_code">추천인 코드</Label>
        <Input
          id="referrer_code"
          name="referrer_code"
          type="text"
          placeholder="NEXO-XXXX (선택사항)"
          value={formData.referrer_code}
          onChange={handleChange}
          disabled={loading}
          className="uppercase"
        />
        <p className="text-xs text-gray-500">
          추천인 코드를 입력하시면 추가 할인 혜택을 받으실 수 있습니다
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? '요청 중...' : '견적 요청하기'}
      </Button>

      <p className="text-xs text-center text-gray-500">
        제출하신 정보는 견적 산출 및 상담 목적으로만 사용됩니다.
      </p>
    </form>
  )
}


