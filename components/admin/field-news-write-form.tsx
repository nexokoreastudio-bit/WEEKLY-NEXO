'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFieldNews, updateFieldNews } from '@/app/actions/field-news'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor, RichTextEditorHandle } from './rich-text-editor'
import { AutoLayoutEditor } from './auto-layout-editor'

interface FieldNewsWriteFormProps {
  userId: string
  initialData?: {
    id?: number
    title?: string
    content?: string
    location?: string
    installation_date?: string
    images?: string[]
  }
}

export function FieldNewsWriteForm({ userId, initialData }: FieldNewsWriteFormProps) {
  const router = useRouter()
  
  // content에서 이미지 URL 추출 함수 (브라우저에서만 실행)
  const extractImageUrls = (html: string): string[] => {
    if (typeof window === 'undefined' || !html) return []
    
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const imgElements = doc.querySelectorAll('img')
      const urls: string[] = []
      imgElements.forEach((img) => {
        const src = img.getAttribute('src')
        if (src) {
          urls.push(src)
        }
      })
      return urls
    } catch (error) {
      console.error('이미지 URL 추출 오류:', error)
      return []
    }
  }

  // 초기값 설정 (서버 사이드에서도 안전하게)
  const initialContent = initialData?.content || ''
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialContent)
  const [location, setLocation] = useState(initialData?.location || '')
  const [installationDate, setInstallationDate] = useState(
    initialData?.installation_date || ''
  )
  
  // images는 useEffect에서 초기화 (브라우저에서만 실행)
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const editorRef = React.useRef<RichTextEditorHandle>(null)
  
  // 에디터 모드 선택 (auto: 자동 배치, rich: 리치 텍스트 에디터)
  const [editorMode, setEditorMode] = useState<'auto' | 'rich'>('auto')
  
  // 자동 레이아웃 에디터용 텍스트 상태
  const [autoLayoutText, setAutoLayoutText] = useState(() => {
    // 기존 content에서 텍스트만 추출 (이미지 제거)
    if (typeof window !== 'undefined' && initialContent) {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(initialContent, 'text/html')
        const paragraphs = Array.from(doc.querySelectorAll('p'))
        return paragraphs.map(p => p.textContent || '').join('\n\n')
      } catch {
        return initialContent.replace(/<[^>]*>/g, '').trim()
      }
    }
    return ''
  })

  // 컴포넌트 마운트 시 content에서 이미지 추출하여 images 배열 초기화
  React.useEffect(() => {
    if (typeof window !== 'undefined' && initialContent) {
      const extractedImages = extractImageUrls(initialContent)
      if (extractedImages.length > 0) {
        // initialData.images가 없거나 비어있으면 content에서 추출한 이미지 사용
        if (!initialData?.images || initialData.images.length === 0) {
          setImages(extractedImages)
        }
      }
    }
  }, []) // 초기 마운트 시에만 실행

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      setLoading(false)
      return
    }

    // 제출 직전에 에디터의 최신 HTML을 다시 읽어서 content 업데이트
    let finalContent = content
    
    console.log('🔄 제출 직전 에디터 HTML 확인 시작')
    console.log('   typeof window:', typeof window)
    console.log('   editorRef.current:', editorRef.current)
    
    if (typeof window !== 'undefined' && editorRef.current) {
      const editorHtml = editorRef.current.getContent()?.trim() || ''
      const currentContent = content.trim()
      
      if (editorHtml) {
        console.log('🔄 제출 직전 에디터 HTML 확인')
        console.log('   기존 content 길이:', currentContent.length)
        console.log('   에디터 HTML 길이:', editorHtml.length)
        console.log('   기존 content에 이미지:', currentContent.includes('<img'))
        console.log('   에디터 HTML에 이미지:', editorHtml.includes('<img'))
        
        // 에디터에 이미지가 있는데 content에 없으면 무조건 에디터 HTML 사용
        const hasImagesInEditor = editorHtml.includes('<img')
        const hasImagesInContent = currentContent.includes('<img')
        
        if (hasImagesInEditor && !hasImagesInContent) {
          console.log('   ⚠️ 에디터에 이미지가 있지만 content에 없음 - 에디터 HTML 사용')
          finalContent = editorHtml
          setContent(editorHtml) // state도 업데이트
        } else if (hasImagesInEditor && editorHtml.length > currentContent.length) {
          // 에디터 HTML이 더 길고 이미지가 있으면 에디터 HTML 사용
          console.log('   ⚠️ 에디터 HTML이 더 길고 이미지 포함 - 에디터 HTML 사용')
          finalContent = editorHtml
          setContent(editorHtml)
        } else if (hasImagesInEditor) {
          // 에디터에 이미지가 있으면 무조건 에디터 HTML 사용 (안전장치)
          console.log('   ✅ 에디터에 이미지 포함 - 에디터 HTML 사용')
          finalContent = editorHtml
          setContent(editorHtml)
        } else if (editorHtml !== currentContent && editorHtml.length > 0) {
          // 내용이 다르면 에디터 HTML 사용
          console.log('   📝 내용이 다름 - 에디터 HTML 사용')
          finalContent = editorHtml
          setContent(editorHtml)
        }
        
        console.log('   최종 content 길이:', finalContent.length)
        console.log('   최종 content에 이미지:', finalContent.includes('<img'))
      } else {
        console.warn('⚠️ 제출 직전 에디터 확인 실패 - editorHtml이 비어있음')
      }
    } else {
      console.warn('⚠️ 제출 직전 에디터 확인 실패 - editorRef.current가 null')
    }

    // content가 실제로 비어있는지 확인 (태그만 있거나 공백만 있는 경우)
    const textContent = finalContent.replace(/<[^>]*>/g, '').trim()
    const hasImages = finalContent.includes('<img')
    
    if (!textContent && !hasImages) {
      setError('내용을 입력하거나 사진을 삽입해주세요.')
      setLoading(false)
      return
    }

    try {
      // content에서 이미지 URL 추출
      const imageUrls = extractImageUrls(finalContent)

      const isEditMode = !!initialData?.id

      // content에 실제로 이미지가 포함되어 있는지 확인
      const hasImagesInContent = finalContent.includes('<img')
      const imageCountInContent = (finalContent.match(/<img/gi) || []).length
      
      console.log(isEditMode ? '📝 수정 데이터:' : '📝 작성 데이터:', {
        id: initialData?.id,
        title,
        contentLength: finalContent.length,
        hasImages: imageUrls.length > 0,
        hasImagesInContent,
        imageCountInContent,
        imageUrlsCount: imageUrls.length,
        location,
        installationDate,
      })
      
      // 경고: 이미지가 추출되었지만 content에 없는 경우
      if (imageUrls.length > 0 && !hasImagesInContent) {
        console.warn('⚠️ 경고: 이미지 URL은 추출되었지만 content에 <img> 태그가 없습니다!')
        console.warn('   Content:', finalContent.substring(0, 200))
      }

      let result

      if (isEditMode) {
        // 수정 모드
        result = await updateFieldNews(initialData.id!, {
          title,
          content: finalContent || '',
          location: location || null,
          installation_date: installationDate || null,
          images: imageUrls.length > 0 ? imageUrls : null,
        })
      } else {
        // 작성 모드
        result = await createFieldNews({
          title,
          content: finalContent || '', // HTML 형식으로 저장 (이미지 포함)
          location: location || null,
          installation_date: installationDate || null,
          images: imageUrls.length > 0 ? imageUrls : null, // 이미지 URL 배열
          author_id: userId,
        })
      }

      console.log(isEditMode ? '📤 수정 결과:' : '📤 작성 결과:', result)

      if (result.success) {
        router.push('/admin/field-news')
        router.refresh()
      } else {
        setError(result.error || (isEditMode ? '수정에 실패했습니다.' : '작성에 실패했습니다.'))
      }
    } catch (err: any) {
      console.error('❌ 오류:', err)
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 서울 강남구 XX학원 설치 완료"
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="location">설치 장소</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="예: 서울 강남구 XX학원"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="installation-date">설치 일자</Label>
        <Input
          id="installation-date"
          type="date"
          value={installationDate}
          onChange={(e) => setInstallationDate(e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="content">현장 소식 내용 *</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={editorMode === 'auto' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditorMode('auto')}
            >
              자동 배치 모드
            </Button>
            <Button
              type="button"
              variant={editorMode === 'rich' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditorMode('rich')}
            >
              직접 편집 모드
            </Button>
          </div>
        </div>
        <div className="mt-2">
          {editorMode === 'auto' ? (
            <AutoLayoutEditor
              onContentChange={(html) => {
                setContent(html)
              }}
              onImagesChange={(newImages) => {
                setImages(newImages)
              }}
              onTextChange={(newText) => {
                setAutoLayoutText(newText)
              }}
              initialText={autoLayoutText}
              initialImages={images}
            />
          ) : (
            <>
              <RichTextEditor
                ref={editorRef}
                value={content}
                onChange={setContent}
                placeholder="설치 현장의 분위기와 특징을 자세히 설명해주세요. 텍스트 중간에 사진을 삽입할 수 있습니다."
                images={images}
                onImagesChange={setImages}
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 네이버 카페 글 형식처럼 텍스트와 사진을 자연스럽게 섞어서 작성하세요. "사진 삽입" 버튼을 클릭하거나 이미지를 복사-붙여넣기하여 텍스트 중간에 사진을 넣을 수 있습니다.
              </p>
            </>
          )}
        </div>
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
          {loading
            ? initialData?.id
              ? '수정 중...'
              : '작성 중...'
            : initialData?.id
            ? '수정하기'
            : '작성하기'}
        </Button>
      </div>
    </form>
  )
}


