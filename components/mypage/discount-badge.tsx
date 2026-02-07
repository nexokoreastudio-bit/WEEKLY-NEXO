'use client'

import { CheckCircle2, Percent } from 'lucide-react'

interface DiscountBadgeProps {
  isVerified: boolean
  verifiedAt: string | null
}

/**
 * 구독자 인증 할인 배지 컴포넌트
 * 마이페이지 상단에 표시되는 할인 정보
 */
export function DiscountBadge({ isVerified, verifiedAt }: DiscountBadgeProps) {
  if (!isVerified) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 rounded-full p-3">
            <Percent className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              🎁 구독자 인증 시 10% 할인 혜택
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              전자칠판 구매 시 구독자 인증을 완료하시면 <strong>10% 할인</strong>이 적용됩니다.
            </p>
            <p className="text-xs text-amber-700">
              💡 구매하신 제품의 시리얼 번호를 입력하여 인증하세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-green-100 rounded-full p-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
            ✅ 구독자 인증 완료
          </h3>
          <p className="text-sm text-green-800 mb-2">
            <strong className="text-lg">10% 할인</strong> 혜택이 적용됩니다.
          </p>
          {verifiedAt && (
            <p className="text-xs text-green-700">
              인증일: {new Date(verifiedAt).toLocaleDateString('ko-KR')}
            </p>
          )}
          <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-green-900">
              🛒 전자칠판 구매 시 자동으로 10% 할인이 적용됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

