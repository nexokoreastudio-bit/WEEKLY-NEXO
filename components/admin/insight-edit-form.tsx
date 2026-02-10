'use client'

import { useState } from 'react'
import { updateInsight } from '@/lib/actions/insights'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Database } from '@/types/database'
import { EditionInfo } from '@/lib/supabase/articles'

type InsightRow = Database['public']['Tables']['insights']['Row']

interface InsightEditFormProps {
  insight: InsightRow
  editions: EditionInfo[]
  onCancel: () => void
  onSuccess: () => void
}

export function InsightEditForm({ insight, editions, onCancel, onSuccess }: InsightEditFormProps) {
  const [title, setTitle] = useState(insight.title)
  const [summary, setSummary] = useState(insight.summary || '')
  const [category, setCategory] = useState<'입시' | '정책' | '학습법' | '상담팁' | '기타'>(insight.category || '기타')
  const [editionId, setEditionId] = useState<string>(insight.edition_id || 'none')
  const [publishDate, setPublishDate] = useState<string>(() => {
    // published_at을 YYYY-MM-DD 형식으로 변환
    if (insight.published_at) {
      const date = new Date(insight.published_at)
      return date.toISOString().split('T')[0]
    }
    return ''
  })
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(insight.thumbnail_url || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setMessage({ type: 'error', text: '제목을 입력해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // 발행 날짜 처리
      let publishedAt: string | null = null
      if (publishDate) {
        publishedAt = new Date(publishDate + 'T00:00:00Z').toISOString()
      }

      const finalEditionId = editionId === 'none' ? null : editionId
      
      const result = await updateInsight(insight.id, {
        title: title.trim(),
        summary: summary.trim() || null,
        category,
        published_at: publishedAt,
        edition_id: finalEditionId,
        thumbnail_url: thumbnailUrl.trim() || null,
      })
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: '수정되었습니다!' })
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: '오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="summary">요약</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={loading}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">카테고리</Label>
          <Select value={category} onValueChange={(value: any) => setCategory(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="입시">입시</SelectItem>
              <SelectItem value="정책">정책</SelectItem>
              <SelectItem value="학습법">학습법</SelectItem>
              <SelectItem value="상담팁">상담팁</SelectItem>
              <SelectItem value="기타">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="publish-date">발행 날짜</Label>
          <Input
            id="publish-date"
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="mt-1"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            날짜를 선택하면 해당 날짜 0시에 자동 발행됩니다.
            <br />
            비우면 수동 발행 대기 상태입니다.
            <br />
            <br />
            💡 <strong>팁:</strong> 특정 날짜의 발행호에만 표시하려면 아래 "발행 에디션"에서도 같은 날짜를 선택하세요.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="edition">발행 에디션</Label>
        <Select value={editionId} onValueChange={(value) => setEditionId(value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="에디션을 선택하세요">
              {editionId && editionId !== 'none' ? (() => {
                const selectedEdition = editions.find(e => e.edition_id === editionId)
                if (selectedEdition) {
                  // -insight-{id} 형식인 경우 날짜 부분만 표시
                  const datePart = editionId.replace(/-insight-\d+$/, '')
                  return `${datePart}${selectedEdition.title ? ` - ${selectedEdition.title}` : ''}`
                }
                // 찾지 못한 경우 editionId만 표시
                return editionId.replace(/-insight-\d+$/, '')
              })() : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">일반 인사이트 (에디션 없음)</SelectItem>
            {editions.map((edition) => {
              // -insight-{id} 형식인 경우 날짜 부분만 표시
              const displayId = edition.edition_id.replace(/-insight-\d+$/, '')
              return (
                <SelectItem key={edition.edition_id} value={edition.edition_id}>
                  {displayId} - {edition.title || '제목 없음'}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          <strong>원하는 날짜에 발행하려면:</strong>
          <br />
          1️⃣ 발행 날짜를 원하는 날짜로 선택 (예: 2026-02-10)
          <br />
          2️⃣ 발행 에디션을 해당 날짜의 발행호로 선택 (예: 2026-02-10)
          <br />
          <br />
          특정 날짜의 에디션을 선택하면 해당 에디션에만 표시됩니다.
          <br />
          "일반 인사이트"를 선택하면 모든 발행호에 표시됩니다.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="thumbnail-url">썸네일 이미지 URL</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!title.trim()) {
                setMessage({ type: 'error', text: '제목을 먼저 입력해주세요.' })
                return
              }
              
              setLoading(true)
              setMessage(null)
              
              try {
                const result = await updateInsight(insight.id, {
                  title: title.trim(),
                  summary: summary.trim() || null,
                  category,
                  published_at: publishDate ? new Date(publishDate + 'T00:00:00Z').toISOString() : null,
                  edition_id: editionId === 'none' ? null : editionId,
                  autoGenerateImage: true, // 이미지 자동 생성 요청
                })
                
                if (result.error) {
                  setMessage({ type: 'error', text: result.error })
                } else if (result.data?.thumbnail_url) {
                  setThumbnailUrl(result.data.thumbnail_url)
                  setMessage({ type: 'success', text: '이미지가 자동으로 생성되었습니다!' })
                } else {
                  setMessage({ type: 'error', text: '이미지 생성에 실패했습니다.' })
                }
              } catch (error) {
                setMessage({ type: 'error', text: '이미지 생성 중 오류가 발생했습니다.' })
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading || !title.trim()}
            className="text-xs"
          >
            ✨ 이미지 자동 생성
          </Button>
        </div>
        <Input
          id="thumbnail-url"
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={loading}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          카드에 표시될 이미지 URL을 입력하세요. "이미지 자동 생성" 버튼을 클릭하면 제목과 요약을 기반으로 관련 이미지를 자동으로 생성합니다.
        </p>
        {thumbnailUrl && (
          <div className="mt-2">
            <img 
              src={thumbnailUrl} 
              alt="미리보기" 
              className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? '저장 중...' : '저장'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          취소
        </Button>
      </div>
    </form>
  )
}


