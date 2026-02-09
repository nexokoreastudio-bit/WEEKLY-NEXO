'use client'

import { useState } from 'react'
import { verifySubscriber } from '@/app/actions/subscriber'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SubscriberVerificationProps {
  userId: string
}

/**
 * 구독자 인증 컴포넌트
 * 시리얼 번호를 입력하여 구독자 인증을 완료합니다
 */
export function SubscriberVerification({ userId }: SubscriberVerificationProps) {
  const [serialNumber, setSerialNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await verifySubscriber(userId, serialNumber.trim())
      
      if (result.success) {
        setMessage({ type: 'success', text: '✅ 구독자 인증이 완료되었습니다! 10% 할인 혜택이 적용됩니다.' })
        setSerialNumber('')
        // 페이지 새로고침하여 상태 업데이트
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || '인증에 실패했습니다. 시리얼 번호를 확인해주세요.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '오류가 발생했습니다. 다시 시도해주세요.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🔐 구독자 인증
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        전자칠판 구매 시 제공된 시리얼 번호를 입력하여 구독자 인증을 완료하세요.
        인증 완료 시 <strong className="text-nexo-cyan">10% 할인</strong> 혜택이 적용됩니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="serial-number" className="text-sm font-semibold text-gray-700">
            구매 시리얼 번호
          </Label>
          <Input
            id="serial-number"
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="예: NEXO-2026-XXXX-XXXX"
            className="mt-2"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 시리얼 번호는 제품 박스 또는 구매 영수증에서 확인할 수 있습니다.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !serialNumber.trim()}
          className="w-full bg-nexo-navy hover:bg-nexo-cyan text-white"
        >
          {loading ? '인증 중...' : '인증하기'}
        </Button>
      </form>
    </div>
  )
}


