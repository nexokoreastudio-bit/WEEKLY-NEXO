/**
 * Articles 관련 Supabase 쿼리 함수
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Article = Database['public']['Tables']['articles']['Row']

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
 */
export async function getLatestArticle(): Promise<EditionArticle | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .not('edition_id', 'is', null)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('최신 발행호 조회 실패:', error)
    return null
  }

  return data as EditionArticle
}

/**
 * 특정 발행호의 메인 article 가져오기
 */
export async function getArticleByEditionId(editionId: string): Promise<EditionArticle | null> {
  const supabase = await createClient()

  console.log(`🔍 Supabase 조회 시작: edition_id = "${editionId}"`)

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('edition_id', editionId)
    .eq('is_published', true)
    .order('id', { ascending: true }) // 가장 먼저 생성된 것이 메인 article
    .limit(1)
    .single()

  if (error) {
    console.error(`❌ 발행호 ${editionId} 조회 실패:`, error)
    console.error('   에러 코드:', error.code)
    console.error('   에러 메시지:', error.message)
    console.error('   에러 상세:', error)
    return null
  }

  if (!data) {
    console.warn(`⚠️  발행호 ${editionId}에 대한 데이터가 없습니다`)
    return null
  }

  const articleData = data as EditionArticle
  console.log(`✅ 발행호 ${editionId} 조회 성공:`, {
    id: articleData.id,
    title: articleData.title?.substring(0, 50),
    edition_id: articleData.edition_id
  })

  return data as EditionArticle
}

/**
 * 특정 발행호의 모든 articles 가져오기 (메인 + 하위)
 */
export async function getArticlesByEditionId(editionId: string): Promise<EditionArticle[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('edition_id', editionId)
    .eq('is_published', true)
    .order('id', { ascending: true })

  if (error) {
    console.error(`발행호 ${editionId}의 articles 조회 실패:`, error)
    return []
  }

  return data as EditionArticle[]
}

/**
 * 모든 발행호 목록 가져오기 (edition_id 기준)
 */
export async function getAllEditions(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select('edition_id')
    .not('edition_id', 'is', null)
    .eq('is_published', true)

  if (error) {
    console.error('발행호 목록 조회 실패:', error)
    return []
  }

  // 중복 제거 및 정렬
  const articles = data as Array<{ edition_id: string | null }>
  const editionIds = [...new Set(articles.map(a => a.edition_id).filter(Boolean) as string[])]
  return editionIds.sort().reverse() // 최신순
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
    console.error('발행호 정보 조회 실패:', error)
    return []
  }

  // edition_id별로 그룹화하고 각 발행호의 첫 번째 article 정보 사용
  const editionMap = new Map<string, EditionInfo>()
  
  for (const article of data) {
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
