/**
 * Resources 관련 Supabase 쿼리 함수
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Resource = Database['public']['Tables']['resources']['Row']
type ResourceInsert = Database['public']['Tables']['resources']['Insert']

export interface ResourceWithAccess extends Resource {
  canAccess: boolean
  hasDownloaded: boolean
}

/**
 * 모든 자료 목록 가져오기
 */
export async function getAllResources(
  userLevel: 'bronze' | 'silver' | 'gold' = 'bronze',
  userId?: string
): Promise<ResourceWithAccess[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('자료 목록 조회 실패:', error)
    return []
  }

  // 사용자 레벨에 따른 접근 가능 여부 확인
  const levelOrder = { bronze: 1, silver: 2, gold: 3 }
  const userLevelOrder = levelOrder[userLevel]

  // 다운로드 이력 확인 (사용자가 로그인한 경우)
  let downloadedResourceIds: number[] = []
  if (userId) {
    const { data: downloads } = await supabase
      .from('downloads')
      .select('resource_id')
      .eq('user_id', userId)

    downloadedResourceIds = (downloads || []).map(d => d.resource_id)
  }

  return (data || []).map(resource => {
    const resourceLevelOrder = levelOrder[resource.access_level]
    return {
      ...resource,
      canAccess: resourceLevelOrder <= userLevelOrder,
      hasDownloaded: downloadedResourceIds.includes(resource.id),
    }
  }) as ResourceWithAccess[]
}

/**
 * 특정 자료 가져오기
 */
export async function getResourceById(
  resourceId: number,
  userLevel: 'bronze' | 'silver' | 'gold' = 'bronze',
  userId?: string
): Promise<ResourceWithAccess | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .single()

  if (error) {
    console.error('자료 조회 실패:', error)
    return null
  }

  // 접근 가능 여부 확인
  const levelOrder = { bronze: 1, silver: 2, gold: 3 }
  const canAccess = levelOrder[data.access_level] <= levelOrder[userLevel]

  // 다운로드 이력 확인
  let hasDownloaded = false
  if (userId) {
    const { data: download } = await supabase
      .from('downloads')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single()

    hasDownloaded = !!download
  }

  return {
    ...data,
    canAccess,
    hasDownloaded,
  } as ResourceWithAccess
}

/**
 * 자료 다운로드 처리
 */
export async function downloadResource(
  resourceId: number,
  userId: string,
  userLevel: 'bronze' | 'silver' | 'gold' = 'bronze'
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // 사용자 정보 확인
    const { data: user } = await supabase
      .from('users')
      .select('point, level')
      .eq('id', userId)
      .single()

    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' }
    }

    // 자료 정보 확인
    const resource = await getResourceById(resourceId, userLevel, userId)

    if (!resource) {
      return { success: false, error: '자료를 찾을 수 없습니다.' }
    }

    if (!resource.canAccess) {
      return { success: false, error: '접근 권한이 없습니다.' }
    }

    // 포인트 확인
    if (user.point < resource.download_cost) {
      return {
        success: false,
        error: `포인트가 부족합니다. (필요: ${resource.download_cost}, 현재: ${user.point})`,
      }
    }

    // 이미 다운로드한 경우 체크
    if (resource.hasDownloaded) {
      return { success: true, fileUrl: resource.file_url }
    }

    // 포인트 차감
    if (resource.download_cost > 0) {
      const { error: pointError } = await supabase
        .from('users')
        .update({ point: user.point - resource.download_cost })
        .eq('id', userId)

      if (pointError) {
        return { success: false, error: '포인트 차감 실패' }
      }

      // 포인트 로그 기록
      await supabase.from('point_logs').insert({
        user_id: userId,
        amount: -resource.download_cost,
        reason: 'download_resource',
        related_id: resourceId,
      })
    }

    // 다운로드 이력 기록
    await supabase.from('downloads').insert({
      user_id: userId,
      resource_id: resourceId,
    })

    // 다운로드 횟수 증가
    await supabase
      .from('resources')
      .update({ downloads_count: resource.downloads_count + 1 })
      .eq('id', resourceId)

    return { success: true, fileUrl: resource.file_url }
  } catch (error: any) {
    console.error('자료 다운로드 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

