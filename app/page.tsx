import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getLatestArticle, getAllEditions } from '@/lib/supabase/articles'
import { EditionSelector } from '@/components/edition-selector'
import styles from './page.module.css'

// 날짜 포맷팅 유틸리티 함수 (서버와 클라이언트에서 동일한 결과 보장)
function formatEditionDate(editionId: string | null): string {
  if (!editionId) return '최신호'
  
  try {
    const date = new Date(editionId + 'T00:00:00Z') // UTC로 명시적으로 설정
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    const weekday = date.getUTCDay()
    
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    
    return `${year}년 ${months[month - 1]} ${day}일 ${weekdays[weekday]}`
  } catch {
    return editionId
  }
}

// 정적 생성 및 재검증 설정 (성능 최적화)
export const revalidate = 3600 // 1시간마다 재검증

export default async function HomePage() {
  // 최신 발행호 가져오기
  const latestArticle = await getLatestArticle()
  
  if (!latestArticle) {
    // 데이터가 없으면 기존 정적 페이지로 리다이렉트 또는 에러 페이지
    return (
      <div className={styles.paper}>
        <div className={styles.errorMessage}>
          <h1>발행 데이터를 불러올 수 없습니다</h1>
          <p>데이터베이스 마이그레이션이 필요합니다.</p>
          <Link href="/" className={styles.link}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 최신 발행호의 edition_id로 리다이렉트
  if (latestArticle.edition_id) {
    redirect(`/news/${latestArticle.edition_id}`)
  }

  // fallback: 직접 렌더링
  const allEditions = await getAllEditions()

  return (
    <div className={styles.paper}>
      {/* 헤더 */}
      <header className={styles.magazineHeader}>
        <div className={styles.topMeta}>
          <span>VOL. {latestArticle.edition_id || 'LATEST'}</span>
          <span>{formatEditionDate(latestArticle.edition_id)}</span>
        </div>
        
        <div className={styles.brandLogoArea}>
          <Link href="/" className={styles.logoHomeLink}>
            <div className={styles.logoContainer}>
              <Image
                src="/assets/images/nexo_logo_black.png"
                alt="NEXO 로고"
                width={120}
                height={40}
                className={styles.nexoLogo}
              />
              <h1>DAILY</h1>
            </div>
          </Link>
          <div className={styles.conceptBadge}>
            <span className={styles.conceptIcon}>📰</span>
            <span className={styles.conceptText}>
              전자칠판 = 전자신문 | 매일 아침, 정보의 새로운 전달 방식
            </span>
          </div>

          {/* 발행호 선택 드롭다운 */}
          {allEditions.length > 0 && (
            <div className={styles.editionNav}>
              <EditionSelector 
                editions={allEditions}
                currentEditionId={latestArticle.edition_id || ''}
              />
            </div>
          )}
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout}>
        <main>
          {/* 헤드라인 그룹 */}
          <div className={styles.headlineGroup}>
            <h2 className={styles.mainHeadline}>
              {latestArticle.title}
            </h2>
            {latestArticle.subtitle && (
              <p className={styles.subHeadline}>
                {latestArticle.subtitle}
              </p>
            )}
          </div>

          {/* 히어로 섹션 */}
          {latestArticle.thumbnail_url && (
            <div className={styles.heroSection}>
              <div className={styles.heroImage}>
                <Image
                  src={latestArticle.thumbnail_url}
                  alt={latestArticle.title}
                  width={800}
                  height={400}
                  className={styles.heroImageImg}
                />
              </div>
            </div>
          )}

          {/* 본문 콘텐츠 */}
          {latestArticle.content && (
            <div 
              className={styles.heroDesc}
              dangerouslySetInnerHTML={{ __html: latestArticle.content }}
            />
          )}
        </main>

        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.tipsBox}>
            <h4>💡 실전 팁</h4>
            <p>
              <strong>QR 공유:</strong> 판서 내용을 즉시 PDF로 변환하여 학생들에게 전송하세요.
            </p>
            <p>
              <strong>화면 분할:</strong> 한쪽에는 영상을, 다른 한쪽에는 판서를 동시에 진행하세요.
            </p>
          </div>
        </aside>
      </div>

      {/* 푸터 */}
      <footer className={styles.footer}>
        (주)넥소 | 인천 서구 보듬로 158 블루텍 | Tel: 032-569-5771~2 | www.nexokorea.co.kr | Digital Transformation Partner
      </footer>
    </div>
  )
}
