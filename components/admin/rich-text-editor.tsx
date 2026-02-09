'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadImageToStorage } from '@/app/actions/upload-image'
import { compressImage, needsCompression } from '@/lib/utils/image-compress'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  images?: string[]
  onImagesChange?: (images: string[]) => void
}

export interface RichTextEditorHandle {
  getContent: () => string | null
}

/**
 * 네이버 카페 스타일의 리치 텍스트 에디터
 * 이미지와 텍스트를 자연스럽게 섞어서 작성할 수 있음
 */
export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  images = [],
  onImagesChange,
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null)
  
  // 부모 컴포넌트에서 getContent 메서드를 호출할 수 있도록 노출
  useImperativeHandle(ref, () => ({
    getContent: () => {
      return editorRef.current?.innerHTML || null
    }
  }), [])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  // 초기값 설정
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!editorRef.current) return
    
    const currentHtml = editorRef.current.innerHTML
    const normalizedCurrent = currentHtml.trim()
    const normalizedValue = (value || '').trim()
    
    // 현재 에디터에 이미지가 있는데 value에 이미지가 없으면 덮어쓰지 않음
    const hasImagesInEditor = normalizedCurrent.includes('<img')
    const hasImagesInValue = normalizedValue.includes('<img')
    
    // 에디터에 이미지가 있고 value에 없으면 업데이트하지 않음 (이미지 업로드 중일 수 있음)
    if (hasImagesInEditor && !hasImagesInValue && normalizedCurrent.length > normalizedValue.length) {
      console.log('⏸️ 에디터에 이미지가 있어서 value 업데이트를 건너뜀')
      return
    }
    
    // value가 실제로 변경된 경우에만 업데이트
    if (normalizedCurrent !== normalizedValue) {
      editorRef.current.innerHTML = value || ''
      
      // content에 이미지가 있는 경우 images 배열 동기화 (브라우저에서만)
      if (value && onImagesChange) {
        try {
          const parser = new DOMParser()
          const doc = parser.parseFromString(value, 'text/html')
          const imgElements = doc.querySelectorAll('img')
          const urls: string[] = []
          imgElements.forEach((img) => {
            const src = img.getAttribute('src')
            if (src && !urls.includes(src)) {
              urls.push(src)
            }
          })
          if (urls.length > 0 && JSON.stringify(urls) !== JSON.stringify(images)) {
            onImagesChange(urls)
          }
        } catch (error) {
          console.error('이미지 동기화 오류:', error)
        }
      }
    }
  }, [value])

  const handleInput = () => {
    if (!editorRef.current) return
    
    // 에디터의 현재 HTML을 직접 가져옴
    const html = editorRef.current.innerHTML
    
    // 이미지가 있는지 먼저 확인
    const hasImages = html.includes('<img')
    
    // 빈 contentEditable의 경우 <br>만 있을 수 있으므로 처리 (단, 이미지가 있으면 제외)
    let cleanedHtml = (!hasImages && (html === '<br>' || html === '<div><br></div>')) ? '' : html
    
    // 빈 div 태그 제거 (이미지가 있는 경우는 제외)
    if (!hasImages) {
      cleanedHtml = cleanedHtml.replace(/<div><\/div>/g, '')
    }
    
    // 이미지가 있는 경우 반드시 포함되도록 보장 (가장 중요!)
    if (hasImages && !cleanedHtml.includes('<img')) {
      console.warn('⚠️ handleInput: 이미지 복구 시도 - 원본 HTML 사용')
      cleanedHtml = html
    }
    
    // 디버깅: 이미지가 포함되어 있는지 확인
    if (process.env.NODE_ENV === 'development') {
      if (cleanedHtml.includes('<img')) {
        const imgCount = (cleanedHtml.match(/<img/gi) || []).length
        const imgTags = cleanedHtml.match(/<img[^>]*>/gi) || []
        console.log(`📸 handleInput: 이미지 ${imgCount}개 포함된 HTML 길이: ${cleanedHtml.length}자`)
        if (imgTags.length > 0) {
          console.log(`   첫 번째 이미지 태그: ${imgTags[0].substring(0, 100)}...`)
        }
      } else if (hasImages) {
        console.error('❌ handleInput: 에디터에 이미지가 있지만 cleanedHtml에 없음!')
        console.error('   원본 HTML 길이:', html.length)
        console.error('   원본 HTML 샘플:', html.substring(0, 500))
        // 이미지가 있는데 cleanedHtml에 없으면 원본 HTML 사용
        cleanedHtml = html
      }
    }
    
    // onChange 호출 전 최종 확인: 이미지가 있으면 반드시 포함
    if (hasImages && !cleanedHtml.includes('<img')) {
      console.error('❌ handleInput: 최종 확인 실패 - 원본 HTML 강제 사용')
      cleanedHtml = html
    }
    
    onChange(cleanedHtml)
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setImageFiles((prev) => [...prev, ...newFiles])
    setUploading(true)

    try {
      // 이미지를 압축 후 Supabase Storage에 업로드
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
            // 압축 실패 시 원본 사용
            const reader = new FileReader()
            base64Data = await new Promise<string>((resolve, reject) => {
              reader.onload = (event) => resolve(event.target?.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
          }
        } else {
          // 작은 이미지는 그대로 사용
          const reader = new FileReader()
          base64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = (event) => resolve(event.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        }
        
        // 이미지를 에디터에 삽입 (동기적으로 처리)
        if (!editorRef.current) {
          console.error('에디터가 없습니다')
          continue
        }
        
        const selection = window.getSelection()
        let range: Range | null = null
        
        try {
          if (selection && selection.rangeCount > 0) {
            range = selection.getRangeAt(0)
          } else {
            // 범위가 없으면 에디터 끝에 삽입
            range = document.createRange()
            range.selectNodeContents(editorRef.current)
            range.collapse(false)
          }
        } catch (error) {
          // 범위 생성 실패 시 에디터 끝에 삽입
          range = document.createRange()
          if (editorRef.current.lastChild) {
            range.setStartAfter(editorRef.current.lastChild)
          } else {
            range.setStart(editorRef.current, 0)
          }
          range.collapse(false)
        }
        
        // 이미지 요소 생성
        const tempImg = document.createElement('img')
        tempImg.src = base64Data
        tempImg.className = 'field-news-image'
        tempImg.style.maxWidth = '100%'
        tempImg.style.height = 'auto'
        tempImg.style.borderRadius = '8px'
        tempImg.style.margin = '16px 0'
        tempImg.style.display = 'block'
        tempImg.style.opacity = '0.5'
        tempImg.contentEditable = 'false'
        tempImg.setAttribute('data-temp-image', 'true') // 임시 이미지 표시
        
        // 커서 위치에 이미지 삽입
        if (range) {
          range.insertNode(tempImg)
          const br = document.createElement('br')
          range.setStartAfter(tempImg)
          range.insertNode(br)
          range.collapse(false)
          if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
          }
        } else {
          // 범위가 없으면 에디터 끝에 추가
          editorRef.current.appendChild(tempImg)
          editorRef.current.appendChild(document.createElement('br'))
        }
        
        // DOM 업데이트가 완료된 후 handleInput 호출
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // 이중 requestAnimationFrame으로 DOM 업데이트 완료 보장
              handleInput()
              resolve()
            })
          })
        })
        
        // 이미지 삽입 확인 (비동기로 확인, 충분한 시간 대기)
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            if (editorRef.current) {
              const html = editorRef.current.innerHTML
              // base64 데이터의 시작 부분 또는 data-temp-image 속성으로 확인
              const base64Prefix = base64Data.substring(0, 50)
              const imgExists = html.includes(base64Prefix) || 
                               html.includes('data:image') ||
                               editorRef.current.querySelector('img[data-temp-image="true"]') ||
                               editorRef.current.querySelectorAll('img').length > 0
              
              if (imgExists) {
                console.log('✅ 이미지가 에디터에 삽입됨')
                // 한 번 더 handleInput 호출 (안전장치)
                handleInput()
              } else {
                // 더 긴 대기 후 재확인
                setTimeout(() => {
                  if (editorRef.current) {
                    const retryHtml = editorRef.current.innerHTML
                    const retryImgExists = retryHtml.includes(base64Prefix) || 
                                          retryHtml.includes('data:image') ||
                                          editorRef.current.querySelector('img')
                    
                    if (!retryImgExists) {
                      console.warn('⚠️ 이미지가 에디터에 삽입되지 않음, 재시도...')
                      // 재시도: 에디터 끝에 직접 추가
                      const retryImg = document.createElement('img')
                      retryImg.src = base64Data
                      retryImg.className = 'field-news-image'
                      retryImg.style.maxWidth = '100%'
                      retryImg.style.height = 'auto'
                      retryImg.style.borderRadius = '8px'
                      retryImg.style.margin = '16px 0'
                      retryImg.style.display = 'block'
                      retryImg.contentEditable = 'false'
                      retryImg.setAttribute('data-temp-image', 'true')
                      editorRef.current.appendChild(retryImg)
                      editorRef.current.appendChild(document.createElement('br'))
                      
                      // DOM 업데이트 후 handleInput 호출
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          handleInput()
                        })
                      })
                    } else {
                      console.log('✅ 재확인: 이미지가 에디터에 삽입됨')
                      handleInput()
                    }
                  }
                  resolve()
                }, 100)
                return
              }
            }
            resolve()
          }, 100) // 초기 대기 시간 증가 (50ms -> 100ms)
        })
        
        // Supabase Storage에 업로드 (비동기로 처리)
        uploadImageToStorage(base64Data, file.name)
          .then((uploadResult) => {
            if (uploadResult.success && uploadResult.url) {
              // 업로드 성공: base64를 Storage URL로 교체
              if (editorRef.current) {
                const imgElements = editorRef.current.querySelectorAll('img[data-temp-image="true"], img')
                imgElements.forEach((img) => {
                  if (img.src === base64Data || img.getAttribute('data-temp-image') === 'true') {
                    img.src = uploadResult.url!
                    img.style.opacity = '1'
                    img.removeAttribute('data-temp-image')
                  }
                })
                
                handleInput()
                
                // 이미지 URL을 배열에 추가
                if (onImagesChange) {
                  onImagesChange([...images, uploadResult.url])
                }
              }
            } else {
              // 업로드 실패: base64 유지
              console.warn('⚠️ 이미지 업로드 실패, base64로 저장됩니다:', uploadResult.error)
              
              if (editorRef.current) {
                const imgElements = editorRef.current.querySelectorAll('img[data-temp-image="true"], img')
                imgElements.forEach((img) => {
                  if (img.src === base64Data || img.getAttribute('data-temp-image') === 'true') {
                    img.style.opacity = '1'
                    img.removeAttribute('data-temp-image')
                  }
                })
                
                handleInput()
                
                // base64도 배열에 추가 (fallback)
                if (onImagesChange) {
                  onImagesChange([...images, base64Data])
                }
              }
            }
          })
          .catch((error) => {
            console.error('이미지 업로드 처리 오류:', error)
            // 업로드 실패해도 base64는 유지
            if (editorRef.current) {
              const imgElements = editorRef.current.querySelectorAll('img[data-temp-image="true"]')
              imgElements.forEach((img) => {
                img.style.opacity = '1'
                img.removeAttribute('data-temp-image')
              })
              handleInput()
            }
          })
      }
    } catch (error) {
      console.error('이미지 처리 오류:', error)
      alert('이미지 처리 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
      // input 초기화
      e.target.value = ''
    }
  }

  const insertImageAtCursor = (imageUrl: string) => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)

    const img = document.createElement('img')
    img.src = imageUrl
    img.className = 'field-news-image'
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.borderRadius = '8px'
    img.style.margin = '16px 0'
    img.style.display = 'block'
    img.contentEditable = 'false'

    if (range) {
      range.insertNode(img)
      const br = document.createElement('br')
      range.setStartAfter(img)
      range.insertNode(br)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    } else {
      editorRef.current.appendChild(img)
      editorRef.current.appendChild(document.createElement('br'))
    }

    handleInput()
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault()
    const items = e.clipboardData.items

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          setUploading(true)
          
          try {
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
                // 압축 실패 시 원본 사용
                const reader = new FileReader()
                base64Data = await new Promise<string>((resolve, reject) => {
                  reader.onload = (event) => resolve(event.target?.result as string)
                  reader.onerror = reject
                  reader.readAsDataURL(file)
                })
              }
            } else {
              // 작은 이미지는 그대로 사용
              const reader = new FileReader()
              base64Data = await new Promise<string>((resolve, reject) => {
                reader.onload = (event) => resolve(event.target?.result as string)
                reader.onerror = reject
                reader.readAsDataURL(file)
              })
            }
            
            // 이미지를 에디터에 삽입 (동기적으로 처리)
            if (!editorRef.current) {
              console.error('에디터가 없습니다')
              continue
            }
            
            const selection = window.getSelection()
            let range: Range | null = null
            
            try {
              if (selection && selection.rangeCount > 0) {
                range = selection.getRangeAt(0)
              } else {
                // 범위가 없으면 에디터 끝에 삽입
                range = document.createRange()
                range.selectNodeContents(editorRef.current)
                range.collapse(false)
              }
            } catch (error) {
              // 범위 생성 실패 시 에디터 끝에 삽입
              range = document.createRange()
              if (editorRef.current.lastChild) {
                range.setStartAfter(editorRef.current.lastChild)
              } else {
                range.setStart(editorRef.current, 0)
              }
              range.collapse(false)
            }
            
            // 이미지 요소 생성
            const tempImg = document.createElement('img')
            tempImg.src = base64Data
            tempImg.className = 'field-news-image'
            tempImg.style.maxWidth = '100%'
            tempImg.style.height = 'auto'
            tempImg.style.borderRadius = '8px'
            tempImg.style.margin = '16px 0'
            tempImg.style.display = 'block'
            tempImg.style.opacity = '0.5'
            tempImg.contentEditable = 'false'
            tempImg.setAttribute('data-temp-image', 'true')
            
            // 커서 위치에 이미지 삽입
            if (range) {
              range.insertNode(tempImg)
              const br = document.createElement('br')
              range.setStartAfter(tempImg)
              range.insertNode(br)
              range.collapse(false)
              if (selection) {
                selection.removeAllRanges()
                selection.addRange(range)
              }
            } else {
              editorRef.current.appendChild(tempImg)
              editorRef.current.appendChild(document.createElement('br'))
            }
            
            // DOM 업데이트가 완료된 후 handleInput 호출
            await new Promise<void>((resolve) => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // 이중 requestAnimationFrame으로 DOM 업데이트 완료 보장
                  handleInput()
                  resolve()
                })
              })
            })
            
            // 이미지 삽입 확인 (비동기로 확인, 충분한 시간 대기)
            await new Promise<void>((resolve) => {
              setTimeout(() => {
                if (editorRef.current) {
                  const html = editorRef.current.innerHTML
                  // base64 데이터의 시작 부분 또는 data-temp-image 속성으로 확인
                  const base64Prefix = base64Data.substring(0, 50)
                  const imgExists = html.includes(base64Prefix) || 
                                   html.includes('data:image') ||
                                   editorRef.current.querySelector('img[data-temp-image="true"]') ||
                                   editorRef.current.querySelectorAll('img').length > 0
                  
                  if (imgExists) {
                    console.log('✅ 이미지가 에디터에 삽입됨 (paste)')
                    // 한 번 더 handleInput 호출 (안전장치)
                    handleInput()
                  } else {
                    // 더 긴 대기 후 재확인
                    setTimeout(() => {
                      if (editorRef.current) {
                        const retryHtml = editorRef.current.innerHTML
                        const retryImgExists = retryHtml.includes(base64Prefix) || 
                                              retryHtml.includes('data:image') ||
                                              editorRef.current.querySelector('img')
                        
                        if (!retryImgExists) {
                          console.warn('⚠️ 이미지가 에디터에 삽입되지 않음 (paste), 재시도...')
                          const retryImg = document.createElement('img')
                          retryImg.src = base64Data
                          retryImg.className = 'field-news-image'
                          retryImg.style.maxWidth = '100%'
                          retryImg.style.height = 'auto'
                          retryImg.style.borderRadius = '8px'
                          retryImg.style.margin = '16px 0'
                          retryImg.style.display = 'block'
                          retryImg.contentEditable = 'false'
                          retryImg.setAttribute('data-temp-image', 'true')
                          editorRef.current.appendChild(retryImg)
                          editorRef.current.appendChild(document.createElement('br'))
                          
                          // DOM 업데이트 후 handleInput 호출
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                              handleInput()
                            })
                          })
                        } else {
                          console.log('✅ 재확인: 이미지가 에디터에 삽입됨 (paste)')
                          handleInput()
                        }
                      }
                      resolve()
                    }, 100)
                    return
                  }
                }
                resolve()
              }, 100) // 초기 대기 시간 증가 (50ms -> 100ms)
            })
            
            // Supabase Storage에 업로드 (비동기로 처리)
            uploadImageToStorage(base64Data, file.name)
              .then((uploadResult) => {
                if (uploadResult.success && uploadResult.url) {
                  // 업로드 성공: base64를 Storage URL로 교체
                  if (editorRef.current) {
                    const imgElements = editorRef.current.querySelectorAll('img[data-temp-image="true"], img')
                    imgElements.forEach((img) => {
                      if (img.src === base64Data || img.getAttribute('data-temp-image') === 'true') {
                        img.src = uploadResult.url!
                        img.style.opacity = '1'
                        img.removeAttribute('data-temp-image')
                      }
                    })
                    
                    handleInput()
                    
                    if (onImagesChange) {
                      onImagesChange([...images, uploadResult.url])
                    }
                  }
                } else {
                  // 업로드 실패: base64 유지
                  console.warn('⚠️ 이미지 업로드 실패, base64로 저장됩니다 (paste):', uploadResult.error)
                  
                  if (editorRef.current) {
                    const imgElements = editorRef.current.querySelectorAll('img[data-temp-image="true"], img')
                    imgElements.forEach((img) => {
                      if (img.src === base64Data || img.getAttribute('data-temp-image') === 'true') {
                        img.style.opacity = '1'
                        img.removeAttribute('data-temp-image')
                      }
                    })
                    
                    handleInput()
                    
                    if (onImagesChange) {
                      onImagesChange([...images, base64Data])
                    }
                  }
                }
                setUploading(false)
              })
              .catch((error) => {
                console.error('이미지 업로드 처리 오류 (paste):', error)
                // 업로드 실패해도 base64는 유지
                if (editorRef.current) {
                  const imgElements = editorRef.current.querySelectorAll('img[data-temp-image="true"]')
                  imgElements.forEach((img) => {
                    img.style.opacity = '1'
                    img.removeAttribute('data-temp-image')
                  })
                  handleInput()
                }
                setUploading(false)
              })
            
            setUploading(false)
          } catch (error) {
            console.error('이미지 처리 오류:', error)
            setUploading(false)
          }
        }
      } else if (item.type === 'text/plain') {
        item.getAsString(async (text) => {
          if (editorRef.current) {
            const selection = window.getSelection()
            const range = selection?.getRangeAt(0)
            if (range) {
              range.deleteContents()
              const textNode = document.createTextNode(text)
              range.insertNode(textNode)
              range.setStartAfter(textNode)
              range.collapse(false)
              selection?.removeAllRanges()
              selection?.addRange(range)
              handleInput()
            }
          }
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
        <label
          htmlFor="rich-editor-image-upload"
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-white transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          <span>사진 삽입</span>
        </label>
        <input
          id="rich-editor-image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading && (
          <span className="text-sm text-gray-500">이미지 처리 중...</span>
        )}
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="min-h-[400px] w-full p-4 border border-input rounded-md bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* 플레이스홀더 스타일 */}
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #999;
          pointer-events: none;
        }
        .field-news-image {
          cursor: pointer;
        }
        .field-news-image:hover {
          opacity: 0.9;
        }
      `}</style>

      {/* 도움말 */}
      <p className="text-xs text-gray-500">
        💡 텍스트를 입력하고, "사진 삽입" 버튼을 클릭하거나 이미지를 복사-붙여넣기하여 텍스트 중간에 사진을 넣을 수 있습니다.
      </p>
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'
