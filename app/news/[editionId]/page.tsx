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
  params: {
    editionId: string
  }
  searchParams?: {
    preview?: string
  }
}

// 정적 생성 및 재검증 설정 (성능 최적화)
export const revalidate = 0 // 항상 최신 데이터 가져오기 (예약 발행 즉시 반영)

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

  // editionId 파싱: insight-{id} 형식인지 확인 (먼저 파싱)
  const isInsightSpecific = editionId.includes('-insight-')
  let targetInsightId: number | null = null
  let dateOnlyEditionId = editionId
  
  if (isInsightSpecific) {
    const match = editionId.match(/-insight-(\d+)$/)
    if (match) {
      targetInsightId = parseInt(match[1], 10)
      dateOnlyEditionId = editionId.replace(/-insight-\d+$/, '')
    }
  }
  
  // 병렬로 데이터 가져오기 (성능 최적화)
  // 개별 인사이트인 경우 날짜만 사용하여 article 조회
  const [mainArticle, allArticles, allEditionsBase, allInsights] = await Promise.all([
    getArticleByEditionId(dateOnlyEditionId), // 날짜만 사용
    getArticlesByEditionId(dateOnlyEditionId), // 날짜만 사용
    getAllEditions(),
    (async () => {
      const { getInsights } = await import('@/lib/actions/insights')
      return await getInsights(undefined, false) // 모든 발행된 인사이트 가져오기
    })(),
  ])
  
  // 인사이트 기반 가상 에디션 ID 생성 (각 인사이트마다 개별 에디션 ID)
  const virtualEditionIds = new Set<string>()
  allInsights.forEach(insight => {
    if (!insight.edition_id && insight.published_at) {
      try {
        const publishedDate = new Date(insight.published_at)
        const year = publishedDate.getUTCFullYear()
        const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
        const day = String(publishedDate.getUTCDate()).padStart(2, '0')
        // 각 인사이트마다 고유한 에디션 ID: YYYY-MM-DD-insight-{id}
        const virtualEditionId = `${year}-${month}-${day}-insight-${insight.id}`
        virtualEditionIds.add(virtualEditionId)
      } catch (e) {
        // 날짜 파싱 실패 시 무시
      }
    }
  })
  
  // 실제 에디션과 가상 에디션 합치기
  const allEditionsSet = new Set([...allEditionsBase, ...Array.from(virtualEditionIds)])
  const allEditions = Array.from(allEditionsSet).sort((a, b) => {
    // 날짜순 정렬 (최신순)
    return b.localeCompare(a)
  })
  
  // 해당 발행호에 인사이트가 있는지 확인 (인사이트만 있는 발행호도 표시하기 위해)
  // isInsightSpecific와 targetInsightId는 이미 위에서 정의됨
  const editionInsights = await (async () => {
    const { getInsights } = await import('@/lib/actions/insights')
    // 개별 인사이트인 경우 editionId를 undefined로 전달하고 클라이언트에서 필터링
    if (isInsightSpecific && targetInsightId) {
      // 모든 인사이트를 가져온 후 특정 ID로 필터링
      const allInsights = await getInsights(undefined, false)
      return allInsights.filter(insight => insight.id === targetInsightId)
    } else {
      // 일반 에디션인 경우 기존 로직 사용
      return await getInsights(editionId, false)
    }
  })()
  const hasInsights = editionInsights && editionInsights.length > 0
  
  // 미리보기 모드가 아니고 발행호도 없고 인사이트도 없으면 404
  if (!mainArticle && !hasInsights && !isPreview) {
    notFound()
  }

  // 미리보기 모드이고 발행호가 없을 때 기본 정보 생성
  // 인사이트가 있으면 인사이트 정보를 기반으로 가상 article 생성
  const displayArticle = mainArticle || (hasInsights && editionInsights.length > 0 ? {
    title: isInsightSpecific && editionInsights[0].title 
      ? editionInsights[0].title 
      : `NEXO Daily ${editionId.replace(/-insight-\d+$/, '')}`,
    subtitle: editionInsights[0].summary || `${editionId.replace(/-insight-\d+$/, '')} 교육 뉴스`,
    content: null,
    thumbnail_url: editionInsights[0].thumbnail_url,
    edition_id: editionId,
    published_at: editionInsights[0].published_at || editionId.replace(/-insight-\d+$/, '') + 'T00:00:00Z',
    updated_at: editionInsights[0].updated_at || editionInsights[0].created_at,
    category: 'news' as const,
    is_published: true,
    views: 0,
    created_at: editionInsights[0].created_at,
  } : {
    title: `NEXO Daily ${editionId.replace(/-insight-\d+$/, '')}`,
    subtitle: `${editionId.replace(/-insight-\d+$/, '')} 교육 뉴스`,
    content: null,
    thumbnail_url: null,
    edition_id: editionId,
    published_at: editionId.replace(/-insight-\d+$/, '') + 'T00:00:00Z',
    updated_at: new Date().toISOString(),
    category: 'news' as const,
    is_published: false,
    views: 0,
    created_at: new Date().toISOString(),
  })

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
                <span>VOL. {editionId.replace(/-insight-\d+$/, '')}</span>
                <span>{formatEditionDate(editionId)}</span>
              </div>
              <h1 className={styles.heroBannerTitle}>{displayArticle.title}</h1>
              {displayArticle.subtitle && (
                <p className={styles.heroBannerSubtitle}>{displayArticle.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      ) : (hasInsights || isPreview || mainArticle) ? (
        // 인사이트가 있거나 미리보기 모드이거나 메인 아티클이 있을 때 기본 헤더 표시
        <div className={styles.heroBanner} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.heroBannerContent}>
            <div className={styles.heroBannerMeta}>
              <span>VOL. {editionId.replace(/-insight-\d+$/, '')}</span>
              <span>{formatEditionDate(editionId)}</span>
            </div>
            <h1 className={styles.heroBannerTitle}>{displayArticle.title}</h1>
            {displayArticle.subtitle && (
              <p className={styles.heroBannerSubtitle}>{displayArticle.subtitle}</p>
            )}
            {isPreview && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  👁️ 관리자 미리보기 모드: 발행호가 아직 생성되지 않았습니다.
                </p>
              </div>
            )}
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
          {/* 개별 인사이트인 경우 editionId를 undefined로 전달하고 specificInsightId 사용 */}
          <InsightsSection 
            editionId={isInsightSpecific ? undefined : editionId} 
            previewMode={isPreview}
            specificInsightId={isInsightSpecific ? (targetInsightId ?? undefined) : undefined}
          />

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
  
  // -insight- 형식인 경우 날짜 부분만 추출하여 article 조회
  const isInsightSpecific = editionId.includes('-insight-')
  const dateOnlyEditionId = isInsightSpecific 
    ? editionId.replace(/-insight-\d+$/, '')
    : editionId
  
  const article = await getArticleByEditionId(dateOnlyEditionId)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'

  // article이 없어도 인사이트가 있을 수 있으므로 체크
  let insightData: { title: string; summary?: string; thumbnail_url?: string | null; published_at?: string } | null = null
  if (isInsightSpecific) {
    const { getInsights } = await import('@/lib/actions/insights')
    const match = editionId.match(/-insight-(\d+)$/)
    if (match) {
      const targetInsightId = parseInt(match[1], 10)
      const allInsights = await getInsights(undefined, false)
      const foundInsight = allInsights.find(insight => insight.id === targetInsightId)
      if (foundInsight) {
        insightData = {
          title: foundInsight.title,
          summary: foundInsight.summary || undefined,
          thumbnail_url: foundInsight.thumbnail_url || undefined,
          published_at: foundInsight.published_at || undefined,
        }
      }
    }
  }

  if (!article && !insightData) {
    return {
      title: '발행호를 찾을 수 없습니다',
      description: '요청하신 발행호를 찾을 수 없습니다.',
    }
  }

  // article이 있으면 article 정보 사용, 없으면 insight 정보 사용
  const title = article?.title || insightData?.title || 'NEXO Daily'
  const description = article?.subtitle || article?.title || insightData?.summary || insightData?.title || '넥소 전자칠판 교육 정보'
  const imageUrl = (article?.thumbnail_url || insightData?.thumbnail_url)
    ? ((article?.thumbnail_url || insightData?.thumbnail_url)?.startsWith('http') 
        ? (article?.thumbnail_url || insightData?.thumbnail_url)
        : `${baseUrl}${article?.thumbnail_url || insightData?.thumbnail_url}`)
    : `${baseUrl}/assets/images/og-image.png`
  const currentUrl = `${baseUrl}/news/${editionId}`
  const publishedTime = article?.published_at || insightData?.published_at || undefined

  return {
    title,
    description,
    keywords: [
      '전자칠판',
      '교육 정보',
      '입시 자료',
      '학원 운영',
      'NEXO Daily',
      dateOnlyEditionId,
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
      publishedTime,
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

