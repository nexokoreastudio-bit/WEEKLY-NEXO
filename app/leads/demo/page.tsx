import { DemoRequestForm } from '@/components/leads/demo-request-form'

export const metadata = {
  title: '상담 신청 | NEXO Daily',
  description: '넥소 전자칠판 구매 상담을 신청하세요. 전문 상담사가 전자칠판 구매 상담을 진행합니다.',
}

export default function DemoRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎯 전자칠판 상담 신청
            </h1>
            <p className="text-gray-600">
              전문 상담사가 전자칠판 구매 상담을 진행합니다
            </p>
          </div>

          <DemoRequestForm />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 상담 혜택</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ 전문 상담사의 1:1 맞춤 상담</li>
            <li>✅ 구매 시 특별 할인 혜택</li>
            <li>✅ 설치 및 교육 지원</li>
            <li>✅ A/S 보장 및 기술 지원</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

