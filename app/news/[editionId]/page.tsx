import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getArticleByEditionId, getArticlesByEditionId, getAllEditions } from '@/lib/supabase/articles'
import { HtmlContent } from '@/components/html-content'
import { DiscountBanner } from '@/components/promotion/discount-banner'
import { EditionNavigation } from '@/components/edition-navigation'
import { EditionSelector } from '@/components/edition-selector'
import { SafeImage } from '@/components/safe-image'
import { Database } from '@/types/database'
import { NewsArticleJsonLd } from '@/components/seo/json-ld'
import { ShareButtons } from '@/components/social/share-buttons'
import { InsightsSection } from '@/components/insights/insights-section'
import { createClient } from '@/lib/supabase/server'
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
  searchParams?: {
    preview?: string
  }
}

// 정적 생성 및 재검증 설정 (성능 최적화)
export const revalidate = 60 // 1분마다 재검증 (발행호 업데이트 즉시 반영)

export default async function EditionPage({ 
  params,
  searchParams 
}: PageProps & { searchParams?: { preview?: string } }) {
  const { editionId } = params
  const isPreview = searchParams?.preview === 'true'

  // 미리보기 모드일 때 관리자 권한 확인
  if (isPreview) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      notFound() // 로그인하지 않은 사용자는 미리보기 불가
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
    if (profileData?.role !== 'admin') {
      notFound() // 관리자가 아니면 미리보기 불가
    }
  }

  // 병렬로 데이터 가져오기 (성능 최적화)
  const [mainArticle, allArticles, allEditions] = await Promise.all([
    getArticleByEditionId(editionId),
    getArticlesByEditionId(editionId),
    getAllEditions(),
  ])
  
  // 미리보기 모드가 아니고 발행호가 없으면 404
  if (!mainArticle && !isPreview) {
    notFound()
  }

  // 미리보기 모드이고 발행호가 없을 때 기본 정보 생성
  const displayArticle = mainArticle || {
    title: `NEXO Daily ${editionId}`,
    subtitle: `${editionId} 교육 뉴스`,
    content: null,
    thumbnail_url: null,
    edition_id: editionId,
    published_at: editionId + 'T00:00:00Z',
    updated_at: new Date().toISOString(),
    category: 'news' as const,
    is_published: false,
  }

  // 메인 article과 하위 articles 분리
  const subArticles = mainArticle ? allArticles.filter(a => a.id !== mainArticle.id) : []

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
        headline={displayArticle.title || 'NEXO Daily'}
        description={displayArticle.subtitle || displayArticle.title || '넥소 전자칠판 교육 정보'}
        image={displayArticle.thumbnail_url || undefined}
        datePublished={displayArticle.published_at || undefined}
        dateModified={displayArticle.updated_at || displayArticle.published_at || undefined}
        author="NEXO Korea"
        url={currentUrl}
      />
      
      <div className={styles.paper}>
      {/* 히어로 배너 섹션 */}
      {displayArticle.thumbnail_url ? (
        <div className={styles.heroBanner}>
          <SafeImage
            src={displayArticle.thumbnail_url}
            alt={displayArticle.title}
            width={1920}
            height={600}
            className={styles.heroBannerImg}
          />
          <div className={styles.heroBannerOverlay}>
            <div className={styles.heroBannerContent}>
              <div className={styles.heroBannerMeta}>
                <span>VOL. {editionId}</span>
                <span>{formatEditionDate(editionId)}</span>
              </div>
              <h1 className={styles.heroBannerTitle}>{displayArticle.title}</h1>
              {displayArticle.subtitle && (
                <p className={styles.heroBannerSubtitle}>{displayArticle.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      ) : isPreview ? (
        // 미리보기 모드이고 썸네일이 없을 때 기본 헤더 표시
        <div className={styles.heroBanner} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.heroBannerContent}>
            <div className={styles.heroBannerMeta}>
              <span>VOL. {editionId}</span>
              <span>{formatEditionDate(editionId)}</span>
            </div>
            <h1 className={styles.heroBannerTitle}>{displayArticle.title}</h1>
            {displayArticle.subtitle && (
              <p className={styles.heroBannerSubtitle}>{displayArticle.subtitle}</p>
            )}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                👁️ 관리자 미리보기 모드: 발행호가 아직 생성되지 않았습니다.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout}>
        <main>
          {/* 발행호 선택 */}
          {allEditions.length > 0 && (
            <div className={styles.editionSelectorWrapper}>
              <EditionSelector 
                editions={allEditions}
                currentEditionId={editionId}
              />
            </div>
          )}

          {/* 소셜 공유 버튼 */}
          {mainArticle && (
            <div className="mb-6">
              <ShareButtons
                title={displayArticle.title || 'NEXO Daily'}
                description={displayArticle.subtitle || undefined}
                url={currentUrl}
                image={displayArticle.thumbnail_url || undefined}
              />
            </div>
          )}

          {/* 할인 홍보 배너 */}
          <DiscountBanner />

          {/* CTA 버튼 (상담 신청 / 견적 요청) */}
          <div className="mt-8 p-6 bg-gradient-to-r from-nexo-navy to-nexo-cyan rounded-xl text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">전자칠판 상담 및 견적 문의</h3>
                <p className="text-white/90">구독자 전용 특별 할인 혜택을 받아보세요</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/leads/demo"
                  className="px-6 py-3 bg-white text-nexo-navy font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  상담 신청
                </Link>
                <Link
                  href="/leads/quote"
                  className="px-6 py-3 bg-nexo-cyan text-white font-semibold rounded-lg hover:bg-nexo-cyan/90 transition-colors"
                >
                  견적 요청
                </Link>
              </div>
            </div>
          </div>

          {/* 본문 콘텐츠 */}
          {displayArticle.content && (
            <HtmlContent 
              html={displayArticle.content}
              className={styles.heroDesc}
            />
          )}

          {/* 학부모님 상담용 인사이트 섹션 */}
          {/* 에러 발생 시에도 페이지가 정상 로드되도록 try-catch는 InsightsSection 내부에서 처리 */}
          <InsightsSection editionId={editionId} previewMode={isPreview} />

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

