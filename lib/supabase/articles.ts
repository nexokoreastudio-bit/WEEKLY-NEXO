/**
 * Articles 관련 Supabase 쿼리 함수
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Article = Database['public']['Tables']['articles']['Row']
type ArticleRow = Database['public']['Tables']['articles']['Row']

export interface EditionArticle extends Article {
  edition_id: string
}

export interface EditionInfo {
  edition_id: string
  title: string
  subtitle: string | null
  thumbnail_url: string | null
  published_at: string | null
}

/**
 * 최신 발행호 가져오기
 * 성능 최적화: 필요한 컬럼만 선택
 * 예약 발행된 article 자동 발행 처리 포함
 */
export async function getLatestArticle(): Promise<EditionArticle | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // 예약 발행된 article 자동 발행 처리
  const { data: scheduledArticles, error: checkError } = await (supabase
    .from('articles') as any)
    .select('id, edition_id, title, published_at')
    .eq('is_published', false)
    .lte('published_at', now)
    .not('published_at', 'is', null)
    .not('edition_id', 'is', null)

  if (checkError) {
    console.error('예약 발행 article 조회 실패:', checkError)
  } else if (scheduledArticles && scheduledArticles.length > 0) {
    console.log(`🔄 [getLatestArticle] 예약 발행된 article ${scheduledArticles.length}개 발견, 자동 발행 처리 중...`)
    scheduledArticles.forEach((article: any) => {
      console.log(`  - ${article.edition_id}: ${article.title} (${article.published_at})`)
    })

    const { error: autoPublishError } = await (supabase
      .from('articles') as any)
      .update({ is_published: true })
      .eq('is_published', false)
      .lte('published_at', now)
      .not('published_at', 'is', null)
      .not('edition_id', 'is', null)

    if (autoPublishError) {
      console.error('❌ 자동 발행 처리 실패:', autoPublishError)
    } else {
      console.log(`✅ [getLatestArticle] ${scheduledArticles.length}개 article 자동 발행 완료`)
    }
  }

  // article과 insight를 모두 확인하여 가장 최신 것을 찾기
  const { data: articleData, error } = await supabase
    .from('articles')
    .select('id, title, subtitle, content, thumbnail_url, edition_id, published_at, updated_at, category, is_published')
    .not('edition_id', 'is', null)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('최신 발행호 조회 실패:', error)
    }
  }

  // 인사이트도 확인하여 가장 최신 것 찾기
  let latestInsight: any = null
  try {
    const { getInsights } = await import('@/lib/actions/insights')
    const allInsights = await getInsights(undefined, false)
    
    if (allInsights && allInsights.length > 0) {
      // published_at이 있는 인사이트 중 가장 최신 것 찾기
      const insightsWithDate = allInsights
        .filter(insight => insight.published_at)
        .sort((a, b) => {
          const dateA = new Date(a.published_at!).getTime()
          const dateB = new Date(b.published_at!).getTime()
          return dateB - dateA
        })
      
      if (insightsWithDate.length > 0) {
        latestInsight = insightsWithDate[0]
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('인사이트 조회 실패:', e)
    }
  }

  // article과 insight 중 더 최신 것 선택
  let latestArticle = articleData
  let latestDate = articleData?.published_at ? new Date(articleData.published_at).getTime() : 0
  
  if (latestInsight && latestInsight.published_at) {
    const insightDate = new Date(latestInsight.published_at).getTime()
    if (insightDate > latestDate) {
      // 인사이트가 더 최신이면 가상 article 생성
      const publishedDate = new Date(latestInsight.published_at)
      const year = publishedDate.getUTCFullYear()
      const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(publishedDate.getUTCDate()).padStart(2, '0')
      const editionId = `${year}-${month}-${day}`
      
      // 해당 날짜의 article이 있는지 다시 확인
      const { data: articleForDate } = await supabase
        .from('articles')
        .select('id, title, subtitle, content, thumbnail_url, edition_id, published_at, updated_at, category, is_published')
        .eq('edition_id', editionId)
        .eq('is_published', true)
        .limit(1)
        .maybeSingle()
      
      if (articleForDate) {
        latestArticle = articleForDate
      } else {
        // article이 없으면 인사이트 정보로 가상 article 생성
        latestArticle = {
          id: 0, // 가상 ID
          title: `NEXO Daily ${editionId}`,
          subtitle: latestInsight.summary || '학부모님 상담에 도움이 되는 교육 정보',
          content: null,
          thumbnail_url: latestInsight.thumbnail_url,
          edition_id: editionId,
          published_at: latestInsight.published_at,
          updated_at: latestInsight.updated_at || latestInsight.created_at,
          category: 'news' as const,
          is_published: true,
          views: 0,
          created_at: latestInsight.created_at,
        } as EditionArticle
      }
    }
  }

  return latestArticle as EditionArticle | null
}

/**
 * 특정 발행호의 메인 article 가져오기
 * 성능 최적화: 필요한 컬럼만 선택
 * 예약 발행된 article 자동 발행 처리 포함
 */
export async function getArticleByEditionId(editionId: string): Promise<EditionArticle | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // 예약 발행된 article 자동 발행 처리 (해당 edition_id만)
  const { error: autoPublishError } = await (supabase
    .from('articles') as any)
    .update({ is_published: true })
    .eq('edition_id', editionId)
    .eq('is_published', false)
    .lte('published_at', now)
    .not('published_at', 'is', null)

  if (autoPublishError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('자동 발행 처리 실패:', autoPublishError)
    }
  }

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, subtitle, content, thumbnail_url, edition_id, published_at, updated_at, category, is_published')
    .eq('edition_id', editionId)
    .eq('is_published', true)
    .order('id', { ascending: true }) // 가장 먼저 생성된 것이 메인 article
    .limit(1)
    .maybeSingle()

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ 발행호 ${editionId} 조회 실패:`, error)
    }
    return null
  }

  return data as EditionArticle | null
}

/**
 * 특정 발행호의 모든 articles 가져오기 (메인 + 하위)
 * 성능 최적화: 필요한 컬럼만 선택
 */
export async function getArticlesByEditionId(editionId: string): Promise<EditionArticle[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, subtitle, content, thumbnail_url, edition_id, category, created_at')
    .eq('edition_id', editionId)
    .eq('is_published', true)
    .order('id', { ascending: true })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`발행호 ${editionId}의 articles 조회 실패:`, error)
    }
    return []
  }

  return (data || []) as EditionArticle[]
}

/**
 * 모든 발행호 목록 가져오기 (edition_id 기준)
 * 성능 최적화: DISTINCT 사용 및 인덱스 활용
 * 예약 발행된 article 자동 발행 처리 포함
 */
export async function getAllEditions(): Promise<string[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // 예약 발행된 article 자동 발행 처리
  const { data: scheduledArticles } = await (supabase
    .from('articles') as any)
    .select('id, edition_id, title, published_at')
    .eq('is_published', false)
    .lte('published_at', now)
    .not('published_at', 'is', null)
    .not('edition_id', 'is', null)

  if (scheduledArticles && scheduledArticles.length > 0) {
    const { error: autoPublishError } = await (supabase
      .from('articles') as any)
      .update({ is_published: true })
      .eq('is_published', false)
      .lte('published_at', now)
      .not('published_at', 'is', null)
      .not('edition_id', 'is', null)

    if (autoPublishError) {
      console.error('자동 발행 처리 실패:', autoPublishError)
    }
  }

  // DISTINCT ON을 사용하여 중복 제거 (더 효율적)
  const { data, error } = await supabase
    .from('articles')
    .select('edition_id')
    .not('edition_id', 'is', null)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('발행호 목록 조회 실패:', error)
    }
    return []
  }

  // 중복 제거 및 정렬 (Set 사용으로 최적화)
  const articles = (data || []) as Array<{ edition_id: string | null }>
  const editionIds = [...new Set(articles.map(a => a.edition_id).filter(Boolean) as string[])]
  return editionIds // 이미 published_at DESC로 정렬되어 있으므로 reverse 불필요
}

/**
 * 모든 발행호 정보 가져오기 (제목, 썸네일 등 포함)
 * 예약 발행된 article 자동 발행 처리 포함
 */
export async function getAllEditionsWithInfo(): Promise<EditionInfo[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // 예약 발행된 article 자동 발행 처리
  const { data: scheduledArticles } = await (supabase
    .from('articles') as any)
    .select('id, edition_id, title, published_at')
    .eq('is_published', false)
    .lte('published_at', now)
    .not('published_at', 'is', null)
    .not('edition_id', 'is', null)

  if (scheduledArticles && scheduledArticles.length > 0) {
    const { error: autoPublishError } = await (supabase
      .from('articles') as any)
      .update({ is_published: true })
      .eq('is_published', false)
      .lte('published_at', now)
      .not('published_at', 'is', null)
      .not('edition_id', 'is', null)

    if (autoPublishError) {
      console.error('자동 발행 처리 실패:', autoPublishError)
    }
  }

  const { data, error } = await supabase
    .from('articles')
    .select('edition_id, title, subtitle, thumbnail_url, published_at')
    .not('edition_id', 'is', null)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('발행호 정보 조회 실패:', error)
    }
    return []
  }

  // edition_id별로 그룹화하고 각 발행호의 가장 최신 article 정보 사용 (published_at 기준)
  const editionMap = new Map<string, EditionInfo>()
  
  const articles = (data || []) as Pick<ArticleRow, 'edition_id' | 'title' | 'subtitle' | 'thumbnail_url' | 'published_at'>[]
  
  // published_at 기준으로 정렬 (이미 정렬되어 있지만 확실하게)
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
    return dateB - dateA // 최신순
  })
  
  for (const article of sortedArticles) {
    const editionId = article.edition_id
    if (editionId && !editionMap.has(editionId)) {
      editionMap.set(editionId, {
        edition_id: editionId,
        title: article.title,
        subtitle: article.subtitle,
        thumbnail_url: article.thumbnail_url,
        published_at: article.published_at,
      })
    }
  }

  return Array.from(editionMap.values())
}

/**
 * 이전/다음 발행호 ID 가져오기
 */
/**
 * 이전/다음 발행호 ID 계산 (getAllEditions 결과를 재사용)
 * @deprecated 이 함수는 더 이상 사용하지 않습니다. 직접 계산하세요.
 */
export async function getPrevNextEditions(currentEditionId: string): Promise<{
  prev: string | null
  next: string | null
}> {
  const allEditions = await getAllEditions()
  const currentIndex = allEditions.indexOf(currentEditionId)

  return {
    prev: currentIndex > 0 ? allEditions[currentIndex - 1] : null,
    next: currentIndex < allEditions.length - 1 ? allEditions[currentIndex + 1] : null,
  }
}
