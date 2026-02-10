'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleLike } from '@/app/actions/likes'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: number
  userId: string | null
  initialLikesCount: number
  initialIsLiked?: boolean
}

export function LikeButton({ 
  postId, 
  userId, 
  initialLikesCount,
  initialIsLiked = false 
}: LikeButtonProps) {
  const router = useRouter()
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!userId) {
      // 로그인 필요 알림
      if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      }
      return
    }

    setIsLoading(true)
    const result = await toggleLike(postId, userId)
    
    if (result.success) {
      setIsLiked(result.isLiked)
      setLikesCount((prev) => result.isLiked ? prev + 1 : prev - 1)
      router.refresh()
    } else {
      alert(result.error || '좋아요 처리 중 오류가 발생했습니다.')
    }
    
    setIsLoading(false)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 ${isLiked ? 'text-red-500 border-red-500' : ''}`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likesCount}</span>
    </Button>
  )
}
