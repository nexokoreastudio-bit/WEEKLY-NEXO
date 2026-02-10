'use client'

import { useState } from 'react'
import { createInsight } from '@/lib/actions/insights'
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
import { Loader2, Sparkles } from 'lucide-react'
import { EditionInfo } from '@/lib/supabase/articles'

interface InsightFormProps {
  editions: EditionInfo[]
}

export function InsightForm({ editions }: InsightFormProps) {
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<'입시' | '정책' | '학습법' | '상담팁' | '기타'>('기타')
  const [editionId, setEditionId] = useState<string>('none')
  const [publishDate, setPublishDate] = useState<string>('') // 발행 날짜 (YYYY-MM-DD)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string
    insight: string
    consulting_tips: string[]
  } | null>(null)

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'URL을 먼저 입력해주세요.' })
      return
    }

    setAnalyzing(true)
    setMessage(null)
    setAnalysisResult(null)

    try {
      const response = await fetch('/api/analyze-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ 
          type: 'error', 
          text: data.error || `분석 중 오류가 발생했습니다. (${response.status})` 
        })
        setAnalyzing(false)
        return
      }

      if (data.success && data.data) {
        setAnalysisResult(data.data)
        setMessage({ type: 'success', text: '✨ 넥소 에디터가 기사를 분석했습니다!' })
      } else {
        setMessage({ type: 'error', text: '분석 결과를 받을 수 없습니다.' })
      }
    } catch (error: any) {
      console.error('분석 오류:', error)
      setMessage({ 
        type: 'error', 
        text: `분석 중 오류가 발생했습니다: ${error?.message || '네트워크 오류가 발생했을 수 있습니다.'}` 
      })
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'URL을 입력해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const finalEditionId = editionId === 'none' ? undefined : editionId
      const finalPublishDate = publishDate || undefined // 발행 날짜 전달
      const result = await createInsight(url, category, finalEditionId, finalPublishDate)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: '✅ 인사이트가 생성되었습니다! Gemini AI가 자동으로 글을 작성했습니다.' })
        setUrl('')
        setEditionId('none')
        setPublishDate('')
        setAnalysisResult(null)
        // 목록 새로고침을 위해 페이지 리로드
        setTimeout(() => {
          window.location.reload()
        }, 2000)
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
        <Label htmlFor="url">링크 URL</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            disabled={loading || analyzing}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || analyzing || !url.trim()}
            variant="outline"
            className="whitespace-nowrap"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                AI 분석
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          링크를 입력하고 <strong>AI 분석</strong> 버튼을 클릭하면 넥소 에디터가 기사를 분석합니다.
          <br />
          <span className="text-xs text-gray-400">
            * 일부 사이트는 인코딩 문제로 제목이 깨질 수 있습니다. 생성 후 제목을 수정할 수 있습니다.
          </span>
        </p>
      </div>

      {/* 분석 결과 미리보기 */}
      {analysisResult && (
        <div className="p-4 bg-gradient-to-r from-nexo-cyan/10 to-nexo-navy/10 rounded-lg border border-nexo-cyan/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-nexo-cyan" />
            <h3 className="font-bold text-nexo-navy">✍️ 넥소 에디터 분석 결과</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">📌 3줄 요약</h4>
              <p className="text-gray-600">{analysisResult.summary}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">🧐 넥소 에디터의 관점</h4>
              <p className="text-gray-600">{analysisResult.insight}</p>
            </div>
            
            <div className="bg-white p-3 rounded border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">🗣️ 학부모 상담 가이드</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {analysisResult.consulting_tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            💡 이 분석 결과는 인사이트 생성 시 자동으로 포함됩니다.
          </p>
        </div>
      )}

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="publish-date">발행 날짜 (선택사항)</Label>
          <Input
            id="publish-date"
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // 오늘 이후만 선택 가능
            className="mt-1"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            날짜를 선택하면 해당 날짜 0시에 자동 발행됩니다.
            <br />
            선택하지 않으면 수동 발행 대기 상태입니다.
            <br />
            <br />
            💡 <strong>팁:</strong> 특정 날짜의 발행호에만 표시하려면 아래 "발행 에디션"에서도 같은 날짜를 선택하세요.
          </p>
        </div>

        <div>
          <Label htmlFor="edition">발행 에디션 (선택사항)</Label>
          <Select value={editionId || 'none'} onValueChange={(value) => setEditionId(value === 'none' ? '' : value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="에디션을 선택하세요 (선택하지 않으면 일반 인사이트)">
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
            특정 날짜의 에디션을 선택하면 해당 에디션 페이지에만 표시됩니다.
            <br />
            "일반 인사이트"를 선택하면 모든 발행호에 표시됩니다.
          </p>
        </div>
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

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '생성 중...' : '인사이트 생성'}
      </Button>
    </form>
  )
}

