import { QuoteRequestForm } from '@/components/leads/quote-request-form'

export const metadata = {
  title: '견적 요청 | NEXO Daily',
  description: '넥소 전자칠판 최저가 견적을 요청하세요. 빠른 응답과 특별 할인 혜택을 제공합니다.',
}

export default function QuoteRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💰 최저가 견적 요청
            </h1>
            <p className="text-gray-600">
              구독자 전용 특별 할인 혜택과 함께 최저가 견적을 받아보세요
            </p>
          </div>

          <QuoteRequestForm />
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">🎁 견적 요청 혜택</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✅ 구독자 전용 10% 할인</li>
            <li>✅ 빠른 견적 응답 (24시간 이내)</li>
            <li>✅ 무료 설치 및 교육 지원</li>
            <li>✅ A/S 보장 및 기술 지원</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


