import Link from 'next/link'
import { getAllEditionsWithInfo } from '@/lib/supabase/articles'
import { getInsights } from '@/lib/actions/insights'
import { SafeImage } from '@/components/safe-image'
import styles from './archive.module.css'

// 정적 생성 및 재검증 설정 (성능 최적화)
export const revalidate = 0 // 항상 최신 데이터 가져오기 (예약 발행 즉시 반영)

// 날짜 포맷팅 함수
function formatEditionDate(editionId: string): string {
  try {
    const date = new Date(editionId + 'T00:00:00Z')
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    const weekday = date.getUTCDay()
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    
    return `${year}년 ${months[month - 1]} ${day}일 (${weekdays[weekday]})`
  } catch {
    return editionId
  }
}

export default async function NewsArchivePage() {
  const [allEditions, allInsights] = await Promise.all([
    getAllEditionsWithInfo(),
    getInsights() // 모든 발행된 인사이트 가져오기
  ])

  // 발행호별 인사이트 개수 및 정보 계산
  const insightsCountByEdition = new Map<string, number>()
  const insightsByEdition = new Map<string, typeof allInsights>()
  
  allInsights.forEach(insight => {
    // edition_id가 있으면 그대로 사용
    // edition_id가 null이지만 published_at이 있으면 개별 가상 에디션 ID 생성
    let editionId = insight.edition_id
    
    if (!editionId && insight.published_at) {
      // published_at에서 날짜 부분만 추출하고 인사이트 ID를 추가하여 고유한 에디션 ID 생성
      try {
        const publishedDate = new Date(insight.published_at)
        const year = publishedDate.getUTCFullYear()
        const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
        const day = String(publishedDate.getUTCDate()).padStart(2, '0')
        // 각 인사이트마다 고유한 에디션 ID: YYYY-MM-DD-insight-{id}
        editionId = `${year}-${month}-${day}-insight-${insight.id}`
      } catch (e) {
        // 날짜 파싱 실패 시 무시
        console.warn('인사이트 날짜 파싱 실패:', insight.published_at, e)
      }
    }
    
    if (editionId) {
      // 각 인사이트마다 개별 에디션으로 처리
      insightsByEdition.set(editionId, [insight])
      insightsCountByEdition.set(editionId, 1)
    }
  })

  // 실제 에디션과 가상 에디션을 합치기
  const editionsMap = new Map<string, typeof allEditions[0] & { thumbnail_url?: string | null }>()
  
  // 실제 에디션 추가
  allEditions.forEach(edition => {
    const insightsCount = insightsCountByEdition.get(edition.edition_id) || 0
    if (insightsCount > 0) {
      editionsMap.set(edition.edition_id, edition)
    }
  })
  
  // 인사이트만 있는 날짜에 대한 가상 에디션 생성 (각 인사이트마다 개별 에디션)
  insightsByEdition.forEach((insights, editionId) => {
    if (!editionsMap.has(editionId) && insights.length > 0) {
      const firstInsight = insights[0]
      // editionId에서 날짜 부분만 추출 (insight-{id} 제거)
      const dateOnly = editionId.replace(/-insight-\d+$/, '')
      editionsMap.set(editionId, {
        edition_id: editionId,
        title: firstInsight.title || `NEXO Daily ${dateOnly}`,
        subtitle: firstInsight.summary || '학부모님 상담에 도움이 되는 교육 정보',
        thumbnail_url: firstInsight.thumbnail_url,
        published_at: firstInsight.published_at || dateOnly + 'T00:00:00Z',
      })
    }
  })

  // 날짜순으로 정렬 (최신순)
  const editionsWithInsights = Array.from(editionsMap.values()).sort((a, b) => {
    const dateA = new Date(a.published_at || a.edition_id + 'T00:00:00Z').getTime()
    const dateB = new Date(b.published_at || b.edition_id + 'T00:00:00Z').getTime()
    return dateB - dateA // 최신순
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📰 발행호 목록</h1>
        <p className={styles.subtitle}>
          NEXO Daily의 모든 발행호를 확인하세요
        </p>
      </div>

      {editionsWithInsights.length === 0 ? (
        <div className={styles.empty}>
          <p>발행된 인사이트가 있는 호가 아직 없습니다.</p>
          <p className={styles.subtitle} style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            관리자 페이지에서 인사이트를 발행해주세요.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {editionsWithInsights.map((edition) => {
            const insightsCount = insightsCountByEdition.get(edition.edition_id) || 0
            
            return (
              <Link
                key={edition.edition_id}
                href={`/news/${edition.edition_id}`}
                className={styles.card}
              >
                {edition.thumbnail_url && (
                  <div className={styles.imageContainer}>
                    <SafeImage
                      src={edition.thumbnail_url}
                      alt={edition.title}
                      width={400}
                      height={250}
                      className={styles.image}
                    />
                  </div>
                )}
                <div className={styles.content}>
                  <div className={styles.date}>{formatEditionDate(edition.edition_id)}</div>
                  <h2 className={styles.title}>{edition.title}</h2>
                  {edition.subtitle && (
                    <p className={styles.subtitle}>{edition.subtitle}</p>
                  )}
                  {insightsCount > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#0891b2' }}>
                      💡 인사이트 {insightsCount}개
                    </div>
                  )}
                  <div className={styles.footer}>
                    <span className={styles.readMore}>읽기 →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

