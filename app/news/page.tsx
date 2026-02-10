import Link from 'next/link'
import { getAllEditionsWithInfo } from '@/lib/supabase/articles'
import { getInsights } from '@/lib/actions/insights'
import { SafeImage } from '@/components/safe-image'
import styles from './archive.module.css'

// 정적 생성 및 재검증 설정 (성능 최적화)
export const revalidate = 0 // 항상 최신 데이터 가져오기 (예약 발행 즉시 반영)

// 날짜 포맷팅 함수
function formatEditionDate(editionId: string | null): string {
  if (!editionId) return '최신호'
  
  try {
    // -insight-{id} 형식인 경우 날짜 부분만 추출
    const datePart = editionId.replace(/-insight-\d+$/, '')
    
    // YYYY-MM-DD 형식인지 확인
    const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!dateMatch) {
      return editionId // 형식이 맞지 않으면 그대로 반환
    }
    
    const year = parseInt(dateMatch[1], 10)
    const month = parseInt(dateMatch[2], 10)
    const day = parseInt(dateMatch[3], 10)
    
    // 유효한 날짜인지 확인
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return editionId
    }
    
    const date = new Date(Date.UTC(year, month - 1, day))
    const weekday = date.getUTCDay()
    
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    
    return `${year}년 ${months[month - 1]} ${day}일 ${weekdays[weekday]}`
  } catch {
    return editionId
  }
}

interface PageProps {
  searchParams: { page?: string }
}

export default async function NewsArchivePage({ searchParams }: PageProps) {
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10))
  const itemsPerPage = 9
  
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
  const allEditionsSorted = Array.from(editionsMap.values()).sort((a, b) => {
    const dateA = new Date(a.published_at || a.edition_id + 'T00:00:00Z').getTime()
    const dateB = new Date(b.published_at || b.edition_id + 'T00:00:00Z').getTime()
    return dateB - dateA // 최신순
  })

  // 페이지네이션 계산
  const totalItems = allEditionsSorted.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const editionsWithInsights = allEditionsSorted.slice(startIndex, endIndex)

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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationContent}>
            {/* 이전 페이지 버튼 */}
            {currentPage > 1 ? (
              <Link 
                href={`/news?page=${currentPage - 1}`}
                className={styles.paginationButton}
              >
                ← 이전
              </Link>
            ) : (
              <span className={`${styles.paginationButton} ${styles.paginationButtonDisabled}`}>
                ← 이전
              </span>
            )}

            {/* 페이지 번호 버튼들 */}
            <div className={styles.paginationNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // 현재 페이지 주변과 처음/끝 페이지만 표시
                const showPage = 
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                
                if (!showPage) {
                  // 생략 표시
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className={styles.paginationEllipsis}>
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Link
                    key={pageNum}
                    href={`/news?page=${pageNum}`}
                    className={`${styles.paginationNumber} ${
                      pageNum === currentPage ? styles.paginationNumberActive : ''
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
            </div>

            {/* 다음 페이지 버튼 */}
            {currentPage < totalPages ? (
              <Link 
                href={`/news?page=${currentPage + 1}`}
                className={styles.paginationButton}
              >
                다음 →
              </Link>
            ) : (
              <span className={`${styles.paginationButton} ${styles.paginationButtonDisabled}`}>
                다음 →
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

