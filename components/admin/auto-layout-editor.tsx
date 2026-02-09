'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { uploadImageToStorage } from '@/app/actions/upload-image'
import { compressImage, needsCompression } from '@/lib/utils/image-compress'

interface AutoLayoutEditorProps {
  onContentChange: (html: string) => void
  onImagesChange: (images: string[]) => void
  initialText?: string
  initialImages?: string[]
  onTextChange?: (text: string) => void
}

/**
 * 이미지와 텍스트를 분리해서 입력하고 자동으로 배치하는 에디터
 */
export function AutoLayoutEditor({
  onContentChange,
  onImagesChange,
  initialText = '',
  initialImages = [],
  onTextChange,
}: AutoLayoutEditorProps) {
  const [text, setText] = useState(initialText)
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // initialText나 initialImages가 변경되면 상태 업데이트
  useEffect(() => {
    if (initialText !== text) {
      setText(initialText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText])

  useEffect(() => {
    const initialImagesStr = JSON.stringify(initialImages)
    const uploadedImagesStr = JSON.stringify(uploadedImages)
    if (initialImagesStr !== uploadedImagesStr) {
      setUploadedImages(initialImages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages])

  // 텍스트와 이미지를 자동으로 배치하여 HTML 생성 (개선된 버전)
  const generateLayout = (textContent: string, images: string[]): string => {
    if (!textContent && images.length === 0) return ''
    
    // 텍스트를 문단 단위로 분리 (빈 줄로 구분)
    const paragraphs = textContent
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
    
    if (paragraphs.length === 0 && images.length === 0) return ''
    
    const htmlParts: string[] = []
    
    // 이미지가 없는 경우
    if (images.length === 0) {
      return paragraphs.map(p => `<p class="field-news-paragraph">${p.replace(/\n/g, '<br>')}</p>`).join('')
    }
    
    // 이미지가 있는 경우: 문단과 이미지를 조화롭게 배치
    // 문단 길이와 위치를 고려하여 이미지 배치 최적화
    
    let imageIndex = 0
    const totalParagraphs = paragraphs.length
    const totalImages = images.length
    
    // 이미지 배치 전략:
    // 1. 첫 번째 문단은 짧으면 이미지를 바로 뒤에, 길면 약간의 간격 후 배치
    // 2. 중간 문단들은 문단 길이에 따라 간격 조정
    // 3. 마지막 문단 뒤에는 남은 이미지들을 자연스럽게 배치
    
    paragraphs.forEach((paragraph, paraIndex) => {
      const paragraphLength = paragraph.length
      const isFirstParagraph = paraIndex === 0
      const isLastParagraph = paraIndex === totalParagraphs - 1
      
      // 문단 추가 (스타일 클래스 포함)
      htmlParts.push(`<p class="field-news-paragraph">${paragraph.replace(/\n/g, '<br>')}</p>`)
      
      // 이미지 배치 로직
      if (imageIndex < totalImages) {
        const imageUrl = images[imageIndex]
        
        // 문단 길이에 따른 간격 조정
        let marginTop = '32px'
        let marginBottom = '32px'
        
        if (isFirstParagraph) {
          // 첫 번째 문단: 짧으면 작은 간격, 길면 큰 간격
          if (paragraphLength < 100) {
            marginTop = '24px'
            marginBottom = '32px'
          } else {
            marginTop = '32px'
            marginBottom = '40px'
          }
        } else if (isLastParagraph) {
          // 마지막 문단: 남은 이미지가 많으면 작은 간격
          const remainingImages = totalImages - imageIndex
          if (remainingImages > 1) {
            marginTop = '32px'
            marginBottom = '24px'
          } else {
            marginTop = '32px'
            marginBottom = '0px'
          }
        } else {
          // 중간 문단: 길이에 따라 조정
          if (paragraphLength < 80) {
            marginTop = '24px'
            marginBottom = '28px'
          } else if (paragraphLength > 200) {
            marginTop = '40px'
            marginBottom = '40px'
          } else {
            marginTop = '32px'
            marginBottom = '32px'
          }
        }
        
        // 이미지 HTML 생성 (개선된 스타일)
        htmlParts.push(
          `<div class="field-news-image-wrapper" style="margin-top: ${marginTop}; margin-bottom: ${marginBottom};">
            <img 
              src="${imageUrl}" 
              class="field-news-image" 
              style="max-width: 100%; height: auto; border-radius: 12px; display: block; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12); transition: transform 0.3s ease;" 
              loading="lazy"
              alt="현장 소식 이미지 ${imageIndex + 1}"
            />
          </div>`
        )
        imageIndex++
      }
    })
    
    // 남은 이미지가 있으면 마지막에 자연스럽게 추가
    while (imageIndex < totalImages) {
      const imageUrl = images[imageIndex]
      const isLastImage = imageIndex === totalImages - 1
      
      htmlParts.push(
        `<div class="field-news-image-wrapper" style="margin-top: ${imageIndex === 0 ? '32px' : '24px'}; margin-bottom: ${isLastImage ? '0px' : '24px'};">
          <img 
            src="${imageUrl}" 
            class="field-news-image" 
            style="max-width: 100%; height: auto; border-radius: 12px; display: block; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12); transition: transform 0.3s ease;" 
            loading="lazy"
            alt="현장 소식 이미지 ${imageIndex + 1}"
          />
        </div>`
      )
      imageIndex++
    }
    
    return htmlParts.join('')
  }

  // 텍스트 변경 시 레이아웃 재생성
  const handleTextChange = (newText: string) => {
    setText(newText)
    if (onTextChange) {
      onTextChange(newText)
    }
    const html = generateLayout(newText, uploadedImages)
    onContentChange(html)
  }

  // 이미지 업로드
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of newFiles) {
        let base64Data: string

        // 큰 이미지는 자동으로 압축
        if (needsCompression(file, 500)) {
          try {
            base64Data = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1920,
              quality: 0.85,
              maxSizeKB: 500,
            })
          } catch (error) {
            console.error('이미지 압축 실패, 원본 사용:', error)
            const reader = new FileReader()
            base64Data = await new Promise<string>((resolve, reject) => {
              reader.onload = (event) => resolve(event.target?.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
          }
        } else {
          const reader = new FileReader()
          base64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = (event) => resolve(event.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        }

        // Supabase Storage에 업로드
        const uploadResult = await uploadImageToStorage(base64Data, file.name)

        if (uploadResult.success && uploadResult.url) {
          uploadedUrls.push(uploadResult.url)
        } else {
          console.error('이미지 업로드 실패:', uploadResult.error)
          // 업로드 실패 시 base64 사용
          uploadedUrls.push(base64Data)
        }
      }

      const newImages = [...uploadedImages, ...uploadedUrls]
      setUploadedImages(newImages)
      onImagesChange(newImages)

      // 레이아웃 재생성
      const html = generateLayout(text, newImages)
      onContentChange(html)
    } catch (error) {
      console.error('이미지 처리 오류:', error)
      alert('이미지 처리 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 이미지 삭제
  const handleImageRemove = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    onImagesChange(newImages)

    // 레이아웃 재생성
    const html = generateLayout(text, newImages)
    onContentChange(html)
  }

  // 이미지 순서 변경
  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...uploadedImages]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    setUploadedImages(newImages)
    onImagesChange(newImages)

    // 레이아웃 재생성
    const html = generateLayout(text, newImages)
    onContentChange(html)
  }

  return (
    <div className="space-y-4">
      {/* 텍스트 입력 영역 */}
      <div>
        <label className="text-sm font-medium mb-2 block">본문 내용</label>
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="설치 현장의 분위기와 특징을 자세히 설명해주세요.&#10;&#10;빈 줄로 문단을 구분하면 이미지가 문단 사이에 자동으로 배치됩니다."
          className="min-h-[300px] resize-y"
        />
        <p className="mt-2 text-xs text-gray-500">
          💡 빈 줄로 문단을 구분하면 이미지가 문단 사이에 자동으로 배치됩니다.
        </p>
      </div>

      {/* 이미지 업로드 영역 */}
      <div>
        <label className="text-sm font-medium mb-2 block">사진</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
            id="auto-layout-image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="auto-layout-image-upload"
            className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 p-4 rounded transition-colors"
          >
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {uploading ? '이미지 업로드 중...' : '사진 선택 또는 드래그 앤 드롭'}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              여러 장 선택 가능 (자동 압축)
            </span>
          </label>
        </div>

        {/* 업로드된 이미지 미리보기 */}
        {uploadedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imageUrl}
                    alt={`업로드된 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => handleImageReorder(index, index - 1)}
                      className="bg-white/90 hover:bg-white p-1 rounded shadow-sm"
                      title="위로 이동"
                    >
                      ↑
                    </button>
                  )}
                  {index < uploadedImages.length - 1 && (
                    <button
                      onClick={() => handleImageReorder(index, index + 1)}
                      className="bg-white/90 hover:bg-white p-1 rounded shadow-sm"
                      title="아래로 이동"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    onClick={() => handleImageRemove(index)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded shadow-sm"
                    title="삭제"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}번째 이미지
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 미리보기 영역 */}
      {text || uploadedImages.length > 0 ? (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-sm font-medium mb-4 text-gray-700">미리보기</h3>
          <div
            className="prose prose-sm max-w-none field-news-preview"
            style={{
              fontSize: '1.0625rem',
              lineHeight: '1.9',
              color: '#333',
            }}
            dangerouslySetInnerHTML={{
              __html: generateLayout(text, uploadedImages),
            }}
          />
          <style jsx>{`
            .field-news-preview :global(.field-news-paragraph) {
              margin-bottom: 20px;
              line-height: 1.9;
              color: #333;
              word-break: keep-all;
            }
            .field-news-preview :global(.field-news-image-wrapper) {
              position: relative;
              width: 100%;
            }
            .field-news-preview :global(.field-news-image) {
              max-width: 100%;
              height: auto;
              border-radius: 12px;
              display: block;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              background: #fafafa;
            }
          `}</style>
        </div>
      ) : null}
    </div>
  )
}
