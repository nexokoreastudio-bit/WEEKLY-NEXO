'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/app/actions/posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PostWriteFormProps {
  userId: string
  initialBoardType?: 'free' | 'qna' | 'tip' | 'market' | 'review'
}

export function PostWriteForm({ userId, initialBoardType }: PostWriteFormProps) {
  const router = useRouter()
  const [boardType, setBoardType] = useState<string>(initialBoardType || 'free')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      setLoading(false)
      return
    }

    // 후기 작성 시 평점 필수
    if (boardType === 'review' && !rating) {
      setError('후기 작성 시 평점을 선택해주세요.')
      setLoading(false)
      return
    }

    try {
      const result = await createPost(
        boardType as 'free' | 'qna' | 'tip' | 'market' | 'review',
        title,
        content,
        userId,
        undefined,
        rating || undefined
      )

      if (result.success && result.postId) {
        router.push(`/community/${result.postId}`)
        router.refresh()
      } else {
        setError(result.error || '글 작성에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="board-type">게시판</Label>
        <Select value={boardType} onValueChange={setBoardType}>
          <SelectTrigger id="board-type" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">자유게시판</SelectItem>
            <SelectItem value="qna">Q&A</SelectItem>
            <SelectItem value="tip">팁 & 노하우</SelectItem>
            {/* 중고장터는 숨김 */}
            {/* <SelectItem value="market">중고장터</SelectItem> */}
            <SelectItem value="review">고객 후기</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="mt-2"
          required
        />
      </div>

      {/* 후기 작성 시 평점 선택 */}
      {boardType === 'review' && (
        <div>
          <Label htmlFor="rating">평점 *</Label>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-all ${
                  rating && star <= rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              >
                ★
              </button>
            ))}
            {rating && (
              <span className="ml-2 text-sm text-gray-600">
                {rating}점 선택됨
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            후기 작성 시 평점을 필수로 선택해주세요
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="content">내용</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            boardType === 'review'
              ? '전자칠판 사용 후기를 자세히 작성해주세요. 구체적인 사용 경험과 장단점을 포함하면 더욱 도움이 됩니다.'
              : '내용을 입력하세요'
          }
          className="mt-2 w-full min-h-[300px] p-3 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          취소
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? '작성 중...' : '작성하기'}
        </Button>
      </div>
    </form>
  )
}

