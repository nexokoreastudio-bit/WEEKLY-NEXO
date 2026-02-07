'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  width: number
  height: number
  className?: string
  fallbackSrc?: string
}

/**
 * 안전한 이미지 로딩 컴포넌트
 * 이미지 로드 실패 시 fallback 이미지 표시
 */
export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = '/assets/images/nexo_logo_black.png',
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    // 경로 정규화
    if (!src) return fallbackSrc
    
    // 이미 절대 경로인 경우 (http://, https://, /로 시작)
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
      return src
    }
    
    // 상대 경로인 경우 / 추가
    if (!src.startsWith('/')) {
      return `/${src}`
    }
    
    return src
  })
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      unoptimized={imgSrc.startsWith('http')} // 외부 URL은 최적화 비활성화
      priority={false}
      loading="lazy"
    />
  )
}

