/**
 * Supabase 쿼리 캐싱 유틸리티
 * Next.js의 unstable_cache를 사용하여 데이터베이스 쿼리 결과를 캐싱
 */

import { unstable_cache } from 'next/cache'

/**
 * 캐시된 쿼리 실행 함수
 * @param key 캐시 키
 * @param fetchFn 데이터를 가져오는 함수
 * @param tags 캐시 태그 (선택적)
 * @param revalidate 재검증 시간 (초)
 */
export async function cachedQuery<T>(
  key: string,
  fetchFn: () => Promise<T>,
  tags?: string[],
  revalidate: number = 3600 // 기본 1시간
): Promise<T> {
  return unstable_cache(
    async () => {
      return await fetchFn()
    },
    [key],
    {
      tags,
      revalidate,
    }
  )()
}


