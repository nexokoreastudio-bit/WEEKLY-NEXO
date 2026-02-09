'use client'

import { useEffect, useState, useMemo } from 'react'
import { sanitizeHtml } from '@/lib/utils/sanitize'

interface HtmlContentProps {
  html: string
  className?: string
  maxLength?: number
}

/**
 * HTML 콘텐츠를 안전하게 렌더링하는 컴포넌트
 * Hydration 에러를 방지하기 위해 클라이언트 사이드에서만 렌더링
 * XSS 방지를 위해 HTML sanitization 적용
 * 전역 CSS의 newsletter-content 클래스가 자동으로 적용됩니다
 */
export function HtmlContent({ html, className, maxLength }: HtmlContentProps) {
  const [mounted, setMounted] = useState(false)

  // HTML sanitization 및 최적화 (메모이제이션)
  const sanitizedContent = useMemo(() => {
    let processedHtml = sanitizeHtml(html)
    
    if (maxLength && processedHtml.length > maxLength) {
      // HTML 태그를 고려하여 자르기
      const truncated = processedHtml.substring(0, maxLength)
      const lastTag = truncated.lastIndexOf('<')
      const lastCloseTag = truncated.lastIndexOf('>')
      if (lastTag > lastCloseTag) {
        // 태그가 닫히지 않은 경우
        processedHtml = truncated.substring(0, lastTag) + '...'
      } else {
        processedHtml = truncated + '...'
      }
    }
    
    return processedHtml
  }, [html, maxLength])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`newsletter-content ${className || ''}`} suppressHydrationWarning />
  }

  return (
    <div 
      className={`newsletter-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      suppressHydrationWarning
    />
  )
}

