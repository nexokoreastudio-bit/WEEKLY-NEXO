import { getInsights } from '@/lib/actions/insights'
import { Database } from '@/types/database'
import Link from 'next/link'
import { sanitizeHtml } from '@/lib/utils/sanitize'

type InsightRow = Database['public']['Tables']['insights']['Row']

interface InsightsSectionProps {
  editionId?: string
  previewMode?: boolean // 관리자 미리보기 모드
}

export async function InsightsSection({ editionId, previewMode = false }: InsightsSectionProps) {
  try {
    const insights = await getInsights(editionId, previewMode)

    // 디버깅: 인사이트 조회 결과 확인
    if (process.env.NODE_ENV === 'development') {
      console.log(`[InsightsSection] editionId: ${editionId}, 조회된 인사이트 수: ${insights?.length || 0}`)
      if (insights && insights.length > 0) {
        console.log('[InsightsSection] 인사이트 목록:', insights.map(i => ({ id: i.id, title: i.title, is_published: i.is_published, edition_id: i.edition_id })))
      }
    }

    // 미리보기 모드일 때는 인사이트가 없어도 안내 메시지 표시
    if (!insights || insights.length === 0) {
      if (previewMode) {
        return (
          <section className="mb-8">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                👁️ 관리자 미리보기 모드: 예약 발행된 인사이트도 표시됩니다.
              </p>
            </div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              💡 학부모님 상담용 인사이트
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-500">
                {editionId 
                  ? `이 발행호(${editionId})에 연결된 인사이트가 없습니다.`
                  : '등록된 인사이트가 없습니다.'}
              </p>
            </div>
          </section>
        )
      }
      return null
    }

  return (
    <section className="mb-8">
      {previewMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-medium">
            👁️ 관리자 미리보기 모드: 예약 발행된 인사이트도 표시됩니다.
          </p>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        💡 학부모님 상담용 인사이트
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        상담 시 학부모님께 넌지시 건넬 수 있는 최신 트렌드와 팁입니다.
      </p>
      <div className="space-y-4">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </section>
  )
  } catch (error) {
    // 에러 발생 시 섹션을 숨김 (사용자 경험 개선)
    console.error('인사이트 섹션 로딩 실패:', error)
    return null
  }
}

function InsightCard({ insight }: { insight: InsightRow }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-1 bg-nexo-cyan/10 text-nexo-cyan rounded">
              {insight.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
          {insight.summary && (
            <p className="text-sm text-gray-600 mb-3">{insight.summary}</p>
          )}
          {insight.content && (
            <div
              className="text-sm text-gray-700 mb-3 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(insight.content) }}
            />
          )}
          <Link
            href={insight.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-nexo-cyan hover:text-nexo-navy font-medium inline-flex items-center gap-1"
          >
            원문 보기 →
          </Link>
        </div>
      </div>
    </div>
  )
}

