import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getArticleByEditionId, getArticlesByEditionId, getAllEditions } from '@/lib/supabase/articles'
import { HtmlContent } from '@/components/html-content'
import { DiscountBanner } from '@/components/promotion/discount-banner'
import { EditionNavigation } from '@/components/edition-navigation'
import { SafeImage } from '@/components/safe-image'
import { NewsArticleJsonLd } from '@/components/seo/json-ld'
import { ShareButtons } from '@/components/social/share-buttons'
import styles from '../../page.module.css'

// 날짜 포맷팅 유틸리티 함수 (서버와 클라이언트에서 동일한 결과 보장)
function formatEditionDate(editionId: string): string {
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

interface PageProps {
  params: {
    editionId: string
  }
}

// 정적 생성 및 재검증 설정 (성능 최적화)
export const revalidate = 3600 // 1시간마다 재검증

export default async function EditionPage({ params }: PageProps) {
  const { editionId } = params

  // 병렬로 데이터 가져오기 (성능 최적화)
  const [mainArticle, allArticles, allEditions] = await Promise.all([
    getArticleByEditionId(editionId),
    getArticlesByEditionId(editionId),
    getAllEditions(),
  ])
  
  if (!mainArticle) {
    notFound()
  }

  // 메인 article과 하위 articles 분리
  const subArticles = allArticles.filter(a => a.id !== mainArticle.id)

  // 이전/다음 발행호 정보 계산 (이미 가져온 데이터 사용)
  const currentIndex = allEditions.indexOf(editionId)
  const prev = currentIndex > 0 ? allEditions[currentIndex - 1] : null
  const next = currentIndex < allEditions.length - 1 ? allEditions[currentIndex + 1] : null

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  const currentUrl = `${baseUrl}/news/${editionId}`

  return (
    <>
      {/* JSON-LD 구조화 데이터 */}
      <NewsArticleJsonLd
        headline={mainArticle.title || 'NEXO Daily'}
        description={mainArticle.subtitle || mainArticle.title || '넥소 전자칠판 교육 정보'}
        image={mainArticle.thumbnail_url || undefined}
        datePublished={mainArticle.published_at || undefined}
        dateModified={mainArticle.updated_at || mainArticle.published_at || undefined}
        author="NEXO Korea"
        url={currentUrl}
      />
      
      <div className={styles.paper}>
      {/* 헤더 */}
      <header className={styles.magazineHeader}>
        <div className={styles.topMeta}>
          <span>VOL. {editionId}</span>
          <span>{formatEditionDate(editionId)}</span>
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
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout}>
        <main>
          {/* 헤드라인 그룹 */}
          <div className={styles.headlineGroup}>
            <h2 className={styles.mainHeadline}>
              {mainArticle.title}
            </h2>
            {mainArticle.subtitle && (
              <p className={styles.subHeadline}>
                {mainArticle.subtitle}
              </p>
            )}
            
            {/* 소셜 공유 버튼 */}
            <div className="mt-4">
              <ShareButtons
                title={mainArticle.title || 'NEXO Daily'}
                description={mainArticle.subtitle || undefined}
                url={currentUrl}
                image={mainArticle.thumbnail_url || undefined}
              />
            </div>
          </div>

          {/* 히어로 섹션 */}
          {mainArticle.thumbnail_url && (
            <div className={styles.heroSection}>
              <div className={styles.heroImage}>
                <SafeImage
                  src={mainArticle.thumbnail_url}
                  alt={mainArticle.title}
                  width={800}
                  height={400}
                  className={styles.heroImageImg}
                />
              </div>
            </div>
          )}

          {/* 할인 홍보 배너 */}
          <DiscountBanner />

          {/* 본문 콘텐츠 */}
          {mainArticle.content && (
            <HtmlContent 
              html={mainArticle.content}
              className={styles.heroDesc}
            />
          )}

          {/* 매거진 섹션 (하위 articles) */}
          {subArticles.length > 0 && (
            <section className={styles.magazineSection} aria-label="매거진">
              <h3 className={styles.magazineSectionTitle}>매거진</h3>
              <div className={styles.magazineGroups}>
                <div className={styles.magazineGroup}>
                  <h4 className={styles.magazineGroupTitle}>
                    {subArticles.some(a => a.category === 'column') ? '칼럼' : '뉴스'}
                  </h4>
                  <div className={styles.articlesGrid}>
                    {subArticles.map((article) => (
                      <article key={article.id} className={styles.articleCard}>
                        <h5 className={styles.articleTitle}>{article.title}</h5>
                        {article.content && (
                          <HtmlContent 
                            html={article.content}
                            className={styles.articleContent}
                            maxLength={200}
                          />
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 이전/다음 호 네비게이션 */}
          <EditionNavigation
            currentEditionId={editionId}
            prevEditionId={prev}
            nextEditionId={next}
            allEditions={allEditions}
          />
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
    </>
  )
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { editionId } = params
  const article = await getArticleByEditionId(editionId)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'

  if (!article) {
    return {
      title: '발행호를 찾을 수 없습니다',
      description: '요청하신 발행호를 찾을 수 없습니다.',
    }
  }

  const title = article.title || 'NEXO Daily'
  const description = article.subtitle || article.title || '넥소 전자칠판 교육 정보'
  const imageUrl = article.thumbnail_url 
    ? (article.thumbnail_url.startsWith('http') 
        ? article.thumbnail_url 
        : `${baseUrl}${article.thumbnail_url}`)
    : `${baseUrl}/assets/images/og-image.png`
  const currentUrl = `${baseUrl}/news/${editionId}`

  return {
    title,
    description,
    keywords: [
      '전자칠판',
      '교육 정보',
      '입시 자료',
      '학원 운영',
      'NEXO Daily',
      editionId,
    ],
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: 'NEXO Daily',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
      publishedTime: article.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: currentUrl,
    },
  }
}

