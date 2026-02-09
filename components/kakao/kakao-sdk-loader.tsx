'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface KakaoSDKLoaderProps {
  jsKey: string
}

/**
 * 카카오 SDK 로더 컴포넌트
 * 카카오 JavaScript SDK를 로드하고 초기화합니다.
 */
export function KakaoSDKLoader({ jsKey }: KakaoSDKLoaderProps) {
  useEffect(() => {
    // SDK가 로드된 후 초기화
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const { Kakao } = window as any
      if (!Kakao.isInitialized()) {
        Kakao.init(jsKey)
      }
    }
  }, [jsKey])

  return (
    <Script
      src="https://developers.kakao.com/sdk/js/kakao.js"
      strategy="lazyOnload"
      onLoad={() => {
        // SDK 로드 완료 후 초기화
        if (typeof window !== 'undefined' && (window as any).Kakao) {
          const { Kakao } = window as any
          if (!Kakao.isInitialized()) {
            Kakao.init(jsKey)
          }
        }
      }}
    />
  )
}


