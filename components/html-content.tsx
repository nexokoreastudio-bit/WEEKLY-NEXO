'use client'

import { useEffect, useState } from 'react'

interface HtmlContentProps {
  html: string
  className?: string
  maxLength?: number
}

/**
 * HTML 콘텐츠를 안전하게 렌더링하는 컴포넌트
 * Hydration 에러를 방지하기 위해 클라이언트 사이드에서만 렌더링
 * 전역 CSS의 newsletter-content 클래스가 자동으로 적용됩니다
 */
export function HtmlContent({ html, className, maxLength }: HtmlContentProps) {
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    setMounted(true)
    if (maxLength && html.length > maxLength) {
      // HTML 태그를 고려하여 자르기
      const truncated = html.substring(0, maxLength)
      const lastTag = truncated.lastIndexOf('<')
      const lastCloseTag = truncated.lastIndexOf('>')
      if (lastTag > lastCloseTag) {
        // 태그가 닫히지 않은 경우
        setContent(truncated.substring(0, lastTag) + '...')
      } else {
        setContent(truncated + '...')
      }
    } else {
      setContent(html)
    }
  }, [html, maxLength])

  if (!mounted) {
    return <div className={`newsletter-content ${className || ''}`} suppressHydrationWarning />
  }

  return (
    <div 
      className={`newsletter-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
      suppressHydrationWarning
    />
  )
}

