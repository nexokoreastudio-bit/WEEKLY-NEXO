'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFieldNews, updateFieldNews } from '@/app/actions/field-news'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor, RichTextEditorHandle } from './rich-text-editor'
import { AutoLayoutEditor } from './auto-layout-editor'
import { generateFieldNewsContent } from '@/lib/utils/field-news-content'
import { parseFieldNewsText, generateTitle } from '@/lib/utils/parse-field-news-text'
import { generateFieldNewsBlogContent } from '@/lib/actions/generate-field-news-content'
import { Upload, X, Eye } from 'lucide-react'
import { uploadImageToStorage } from '@/app/actions/upload-image'
import { compressImage, needsCompression } from '@/lib/utils/image-compress'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { sanitizeHtml } from '@/lib/utils/sanitize'
import styles from '@/app/field/field.module.css'

interface FieldNewsWriteFormProps {
  userId: string
  initialData?: {
    id?: number
    title?: string
    content?: string
    location?: string
    installation_date?: string
    images?: string[]
    store_name?: string
    model?: string
    additional_cables?: string
    stand?: string
    wall_mount?: string
    payment?: string
    notes?: string
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
  
  // 에디터 모드 선택 (structured: 구조화된 필드, auto: 자동 배치, rich: 리치 텍스트 에디터)
  // 수정 모드일 때는 자동으로 리치 에디터 모드로 설정
  const [editorMode, setEditorMode] = useState<'structured' | 'auto' | 'rich'>(
    initialData?.id ? 'rich' : 'structured'
  )
  
  // 구조화된 필드 상태 (자동 파싱용)
  const [structuredText, setStructuredText] = useState(() => {
    // 기존 데이터가 있으면 텍스트로 변환
    if (initialData?.store_name || initialData?.location) {
      const parts: string[] = []
      if (initialData.store_name) parts.push(`상점명 :${initialData.store_name}`)
      if (initialData.location) parts.push(`(지역:${initialData.location})`)
      if (initialData.model) parts.push(`모델 :${initialData.model}`)
      if (initialData.additional_cables) parts.push(`추가 케이블 :${initialData.additional_cables}`)
      if (initialData.stand) parts.push(`스탠드 :${initialData.stand}`)
      if (initialData.wall_mount) parts.push(`벽걸이 :${initialData.wall_mount}`)
      if (initialData.payment) parts.push(`결제 :${initialData.payment}`)
      if (initialData.notes) parts.push(`특이사항:${initialData.notes}`)
      return parts.join('\n')
    }
    return ''
  })
  
  // 파싱된 데이터 (자동 업데이트)
  const [parsedData, setParsedData] = useState(() => {
    if (structuredText) {
      return parseFieldNewsText(structuredText)
    }
    return {
      storeName: initialData?.store_name || '',
      location: initialData?.location || '',
      model: initialData?.model || '',
      additionalCables: initialData?.additional_cables || '',
      stand: initialData?.stand || '',
      wallMount: initialData?.wall_mount || '',
      payment: initialData?.payment || '',
      notes: initialData?.notes || '',
    }
  })
  
  // 이미지 업로드 관련
  const [uploadingImages, setUploadingImages] = useState(false)
  const [generatingContent, setGeneratingContent] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 미리보기 모달 상태
  const [showPreview, setShowPreview] = useState(false)
  
  // 텍스트 변경 시 자동 파싱 및 제목 생성
  useEffect(() => {
    if (editorMode === 'structured' && structuredText) {
      const parsed = parseFieldNewsText(structuredText)
      setParsedData(parsed)
      
      // 제목 자동 생성 (상점명이 있으면 항상 업데이트)
      if (parsed.storeName) {
        const autoTitle = generateTitle(parsed)
        setTitle(autoTitle)
      }
    }
  }, [structuredText, editorMode])
  
  // AI로 블로그 글 생성
  const handleGenerateBlogContent = async () => {
    if (!structuredText.trim()) {
      setError('설치 정보를 입력해주세요.')
      return
    }

    setGeneratingContent(true)
    setError(null)

    try {
      const result = await generateFieldNewsBlogContent(
        structuredText,
        parsedData,
        images
      )

      if (result.success && result.content) {
        setContent(result.content)
      } else {
        setError(result.error || '블로그 글 생성에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('블로그 글 생성 오류:', error)
      setError(error.message || '블로그 글 생성 중 오류가 발생했습니다.')
    } finally {
      setGeneratingContent(false)
    }
  }
  
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

    // 구조화된 모드인 경우: AI로 블로그 글 자동 생성
    if (editorMode === 'structured') {
      // content가 비어있거나 기본 템플릿만 있으면 AI로 생성 시도
      if (!finalContent || finalContent.trim().length < 50) {
        try {
          setLoading(true)
          const aiResult = await generateFieldNewsBlogContent(
            structuredText,
            parsedData,
            images
          )
          
          if (aiResult.success && aiResult.content) {
            finalContent = aiResult.content
            setContent(aiResult.content)
          } else {
            // AI 생성 실패 시 기본 템플릿 사용
            finalContent = generateFieldNewsContent({
              storeName: parsedData.storeName,
              location: parsedData.location,
              model: parsedData.model,
              additionalCables: parsedData.additionalCables,
              stand: parsedData.stand,
              wallMount: parsedData.wallMount,
              payment: parsedData.payment,
              notes: parsedData.notes,
              installationDate,
            }, images)
          }
        } catch (error: any) {
          console.error('AI 글 생성 오류:', error)
          // 오류 발생 시 기본 템플릿 사용
          finalContent = generateFieldNewsContent({
            storeName: parsedData.storeName,
            location: parsedData.location,
            model: parsedData.model,
            additionalCables: parsedData.additionalCables,
            stand: parsedData.stand,
            wallMount: parsedData.wallMount,
            payment: parsedData.payment,
            notes: parsedData.notes,
            installationDate,
          }, images)
        }
      }
    }

    // content가 실제로 비어있는지 확인 (태그만 있거나 공백만 있는 경우)
    const textContent = finalContent.replace(/<[^>]*>/g, '').trim()
    const hasImages = finalContent.includes('<img') || images.length > 0
    
    if (!textContent && !hasImages && editorMode !== 'structured') {
      setError('내용을 입력하거나 사진을 삽입해주세요.')
      setLoading(false)
      return
    }

    try {
      // content에서 이미지 URL 추출 (구조화된 모드는 images 배열 사용)
      const imageUrls = editorMode === 'structured' 
        ? images 
        : extractImageUrls(finalContent)

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
          location: parsedData.location || location || null,
          installation_date: installationDate || null,
          images: imageUrls.length > 0 ? imageUrls : null,
          store_name: parsedData.storeName || null,
          model: parsedData.model || null,
          additional_cables: parsedData.additionalCables || null,
          stand: parsedData.stand || null,
          wall_mount: parsedData.wallMount || null,
          payment: parsedData.payment || null,
          notes: parsedData.notes || null,
        })
      } else {
        // 작성 모드
        result = await createFieldNews({
          title,
          content: finalContent || '', // HTML 형식으로 저장 (이미지 포함)
          location: parsedData.location || location || null,
          installation_date: installationDate || null,
          images: imageUrls.length > 0 ? imageUrls : null, // 이미지 URL 배열
          author_id: userId,
          store_name: parsedData.storeName || null,
          model: parsedData.model || null,
          additional_cables: parsedData.additionalCables || null,
          stand: parsedData.stand || null,
          wall_mount: parsedData.wallMount || null,
          payment: parsedData.payment || null,
          notes: parsedData.notes || null,
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
    <div>
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

      {/* 에디터 모드 선택 */}
      <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
        <Button
          type="button"
          variant={editorMode === 'structured' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEditorMode('structured')}
        >
          📋 구조화된 입력
        </Button>
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

      {/* 구조화된 입력 모드 */}
      {editorMode === 'structured' && (
        <div className="space-y-4 p-6 border border-gray-200 rounded-lg bg-white">
          <div>
            <Label htmlFor="structured-text">설치 정보 입력 *</Label>
            <p className="text-sm text-gray-500 mb-2">
              아래 형식으로 입력하면 자동으로 파싱됩니다. 제목과 본문이 자동 생성됩니다.
            </p>
            <Textarea
              id="structured-text"
              value={structuredText}
              onChange={(e) => setStructuredText(e.target.value)}
              placeholder={`상점명 :초원유치원
(지역:안산시 단원구 초지동)
추가 케이블 : HDMI 5m 9EA / 터치 5m 9EA
스탠드 :
벽걸이 : 9개
모델 : NXH65*9
결제 :
특이사항:에듀앤플레이 
setting_3588,
ufile_3588설치 완료`}
              className="mt-2 font-mono text-sm"
              rows={12}
              required
            />
            <div className="mt-2 text-xs text-gray-500">
              💡 예시 형식:
              <pre className="mt-1 p-2 bg-gray-50 rounded text-xs">
{`상점명 :상점명
(지역:주소)
추가 케이블 : HDMI 5m 1EA / 터치 5m 1EA
스탠드 : 1대
벽걸이 : 
모델 : NXH65
결제 :
특이사항:특이사항 내용`}
              </pre>
            </div>
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

          {/* 파싱 결과 미리보기 및 AI 글 생성 버튼 */}
          {structuredText && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">📋 파싱 결과 미리보기:</p>
                <div className="text-xs text-blue-800 space-y-1">
                  {parsedData.storeName && <div>상점명: {parsedData.storeName}</div>}
                  {parsedData.location && <div>지역: {parsedData.location}</div>}
                  {parsedData.model && <div>모델: {parsedData.model}</div>}
                  {parsedData.additionalCables && <div>추가 케이블: {parsedData.additionalCables}</div>}
                  {parsedData.stand && <div>스탠드: {parsedData.stand}</div>}
                  {parsedData.wallMount && <div>벽걸이: {parsedData.wallMount}</div>}
                  {parsedData.payment && <div>결제: {parsedData.payment}</div>}
                  {parsedData.notes && <div>특이사항: {parsedData.notes}</div>}
                </div>
              </div>
              
              <Button
                type="button"
                onClick={handleGenerateBlogContent}
                disabled={generatingContent || !structuredText.trim()}
                className="w-full bg-nexo-navy hover:bg-nexo-navy/90 text-white"
              >
                {generatingContent ? '🤖 AI가 블로그 글을 작성 중...' : '✨ AI로 블로그 글 자동 생성'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                💡 입력한 정보를 바탕으로 AI가 자연스러운 블로그 글을 작성합니다. 사진은 자동으로 적절한 위치에 배치됩니다.
              </p>
            </div>
          )}

          {/* 이미지 업로드 */}
          <div>
            <Label>사진 첨부</Label>
            <div className="mt-2 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length === 0) return

                  setUploadingImages(true)
                  const newImages: string[] = []

                  for (const file of files) {
                    try {
                      let base64Data: string
                      
                      // 압축이 필요한 경우
                      if (needsCompression(file)) {
                        base64Data = await compressImage(file)
                      } else {
                        // 압축이 필요 없는 경우 직접 base64로 변환
                        const reader = new FileReader()
                        base64Data = await new Promise<string>((resolve, reject) => {
                          reader.onload = () => resolve(reader.result as string)
                          reader.onerror = () => reject(new Error('파일 읽기 실패'))
                          reader.readAsDataURL(file)
                        })
                      }

                      const uploadResult = await uploadImageToStorage(base64Data, file.name)
                      if (uploadResult.success && uploadResult.url) {
                        newImages.push(uploadResult.url)
                      } else {
                        console.error('이미지 업로드 실패:', uploadResult.error)
                        setError(uploadResult.error || '이미지 업로드에 실패했습니다.')
                      }
                    } catch (error: any) {
                      console.error('이미지 업로드 실패:', error)
                      setError(error.message || '이미지 업로드 중 오류가 발생했습니다.')
                    }
                  }

                  setImages([...images, ...newImages])
                  setUploadingImages(false)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingImages ? '업로드 중...' : '사진 추가'}
              </Button>

              {/* 업로드된 이미지 미리보기 */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((imgUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imgUrl}
                        alt={`업로드된 이미지 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImages(images.filter((_, i) => i !== index))
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500">
                💡 사진을 업로드하면 자동으로 글 사이에 배치됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 기존 에디터 모드들 */}
      {editorMode !== 'structured' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="content">현장 소식 내용 *</Label>
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
      )}

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
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(true)}
          disabled={loading || !title.trim()}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          미리보기
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

    {/* 미리보기 모달 - form 밖에 위치 */}
    {showPreview && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* 모달 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900">미리보기</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 미리보기 내용 */}
          <div className="p-6">
            <article className={styles.detailCard}>
              <div className={styles.detailContent}>
                <div className={styles.meta}>
                  {(parsedData.location || location) && (
                    <span className={styles.location}>
                      📍 {parsedData.location || location}
                    </span>
                  )}
                  {installationDate && (
                    <span className={styles.date}>
                      📅 {format(new Date(installationDate), 'yyyy년 M월 d일', { locale: ko })}
                    </span>
                  )}
                </div>
                <h1 className={styles.detailTitle}>
                  {title || '제목을 입력해주세요'}
                </h1>
                
                {/* 콘텐츠 미리보기 */}
                {content ? (
                  <div
                    className={styles.detailDescription}
                    dangerouslySetInnerHTML={{ 
                      __html: (() => {
                        let html = sanitizeHtml(content)
                        
                        // 이미지 태그에 클래스 추가
                        html = html.replace(
                          /<img([^>]*?)(?:\s+class=["'][^"']*["'])?([^>]*)>/gi,
                          (match, before, after) => {
                            const hasClass = /class=["']/.test(match)
                            if (hasClass) {
                              return match.replace(
                                /class=["']([^"']*)["']/,
                                'class="$1 field-news-image"'
                              )
                            } else {
                              return `<img${before} class="field-news-image"${after}>`
                            }
                          }
                        )
                        
                        // loading="lazy" 추가
                        html = html.replace(
                          /<img([^>]*?)(?:\s+loading=["'][^"']*["'])?([^>]*)>/gi,
                          (match) => {
                            if (!/loading=["']/.test(match)) {
                              return match.replace(/>$/, ' loading="lazy">')
                            }
                            return match
                          }
                        )
                        
                        return html
                      })()
                    }}
                  />
                ) : (
                  <div className={styles.detailDescription}>
                    <p className="text-gray-400 italic">
                      내용이 아직 생성되지 않았습니다. AI로 블로그 글을 생성하거나 직접 입력해주세요.
                    </p>
                  </div>
                )}
                
                <div className={styles.detailFooter}>
                  <span className={styles.views}>👁️ 0회 조회</span>
                  <span className={styles.publishedAt}>
                    미리보기 모드
                  </span>
                </div>
              </div>
            </article>
          </div>

          {/* 모달 푸터 */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              닫기
            </Button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}


