'use client'

import { useState, useEffect } from 'react'
import { Share2, MessageCircle, Facebook, Twitter, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonsProps {
  title: string
  description?: string
  url?: string
  image?: string
}

export function ShareButtons({ title, description, url, image }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [hasNativeShare, setHasNativeShare] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setHasNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  // url prop이 있으면 사용, 없으면 baseUrl 사용 (서버와 클라이언트에서 동일한 값)
  const shareUrl = url || baseUrl
  const shareTitle = title
  const shareDescription = description || 'NEXO Daily - 전자칠판 교육 정보 큐레이션'
  const shareImage = image || `${baseUrl}/assets/images/og-image.png`

  // 카카오톡 공유
  const shareKakao = () => {
    if (typeof window === 'undefined' || !(window as any).Kakao) {
      alert('카카오톡 공유를 사용하려면 카카오 SDK가 필요합니다.')
      return
    }

    const { Kakao } = window as any
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: shareTitle,
        description: shareDescription,
        imageUrl: shareImage,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
    })
  }

  // 페이스북 공유
  const shareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  // 트위터 공유
  const shareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  // 링크 복사
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 네이티브 공유 (모바일)
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        })
      } catch (err) {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      // 네이티브 공유가 지원되지 않으면 링크 복사
      copyLink()
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-600 mr-2">공유하기:</span>
      
      {/* 카카오톡 공유 */}
      <Button
        variant="outline"
        size="sm"
        onClick={shareKakao}
        className="flex items-center gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        카카오톡
      </Button>

      {/* 페이스북 공유 */}
      <Button
        variant="outline"
        size="sm"
        onClick={shareFacebook}
        className="flex items-center gap-2"
      >
        <Facebook className="w-4 h-4" />
        페이스북
      </Button>

      {/* 트위터 공유 */}
      <Button
        variant="outline"
        size="sm"
        onClick={shareTwitter}
        className="flex items-center gap-2"
      >
        <Twitter className="w-4 h-4" />
        트위터
      </Button>

      {/* 링크 복사 */}
      <Button
        variant="outline"
        size="sm"
        onClick={copyLink}
        className="flex items-center gap-2"
      >
        <Link2 className="w-4 h-4" />
        {copied ? '복사됨!' : '링크 복사'}
      </Button>

      {/* 네이티브 공유 (모바일) - 클라이언트에서만 렌더링 */}
      {mounted && hasNativeShare && (
        <Button
          variant="outline"
          size="sm"
          onClick={shareNative}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          공유
        </Button>
      )}
    </div>
  )
}

