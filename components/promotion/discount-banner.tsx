'use client'

import Link from 'next/link'
import { Percent, ShoppingCart } from 'lucide-react'

/**
 * 구독자 인증 할인 홍보 배너
 * 메인 페이지나 뉴스레터에 표시되는 홍보용 배너
 */
export function DiscountBanner() {
  return (
    <div className="bg-gradient-to-r from-nexo-navy via-nexo-navy to-nexo-cyan text-white rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-white/20 rounded-full p-4">
            <Percent className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">
              🎁 구독자 인증 시 10% 할인 혜택
            </h3>
            <p className="text-sm text-white/90">
              전자칠판 구매 시 구독자 인증을 완료하시면 <strong>10% 할인</strong>이 자동 적용됩니다
            </p>
          </div>
        </div>
        <Link
          href="/mypage"
          className="flex items-center gap-2 bg-white text-nexo-navy font-bold px-6 py-3 rounded-lg hover:bg-nexo-cyan hover:text-white transition-colors whitespace-nowrap"
        >
          <ShoppingCart className="w-5 h-5" />
          인증하러 가기
        </Link>
      </div>
    </div>
  )
}

