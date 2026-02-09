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
 */
export async function getLatestArticle(): Promise<EditionArticle | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
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
    return null
  }

  return data as EditionArticle | null
}

/**
 * 특정 발행호의 메인 article 가져오기
 * 성능 최적화: 필요한 컬럼만 선택
 */
export async function getArticleByEditionId(editionId: string): Promise<EditionArticle | null> {
  const supabase = await createClient()

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
 */
export async function getAllEditions(): Promise<string[]> {
  const supabase = await createClient()

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
 */
export async function getAllEditionsWithInfo(): Promise<EditionInfo[]> {
  const supabase = await createClient()

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
