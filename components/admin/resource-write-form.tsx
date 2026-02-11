'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createResource, updateResource, uploadFileToStorage } from '@/app/actions/resources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, X, Image as ImageIcon } from 'lucide-react'
import { uploadImageToStorage } from '@/app/actions/upload-image'
import { compressImage, needsCompression } from '@/lib/utils/image-compress'
import { SafeImage } from '@/components/safe-image'

interface ResourceWriteFormProps {
  userId: string
  initialData?: {
    id?: number
    title?: string
    description?: string | null
    file_url?: string
    file_type?: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null
    access_level?: 'bronze' | 'silver' | 'gold'
    download_cost?: number
    thumbnail_url?: string | null
  }
}

export function ResourceWriteForm({ userId, initialData }: ResourceWriteFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState(initialData?.file_url || '')
  const [fileType, setFileType] = useState<'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null>(
    initialData?.file_type || null
  )
  const [accessLevel, setAccessLevel] = useState<'bronze' | 'silver' | 'gold'>(
    initialData?.access_level || 'bronze'
  )
  const [downloadCost, setDownloadCost] = useState(initialData?.download_cost || 0)
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // 파일 형식 확인
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase()
    const allowedTypes = ['pdf', 'xlsx', 'hwp', 'docx', 'pptx']
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      setError(`지원하지 않는 파일 형식입니다. (${allowedTypes.join(', ')}만 가능)`)
      return
    }

    setFile(selectedFile)
    setFileType(fileExt as 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx')
    setError(null)

    // 파일 업로드
    setUploading(true)
    try {
      // File 객체를 ArrayBuffer로 변환하여 Server Action에 전달
      const arrayBuffer = await selectedFile.arrayBuffer()
      const fileName = selectedFile.name
      const fileType = selectedFile.type || ''
      
      const result = await uploadFileToStorage({
        arrayBuffer: Array.from(new Uint8Array(arrayBuffer)), // ArrayBuffer를 배열로 변환
        fileName: fileName,
        fileType: fileType,
      })
      
      // result를 plain object로 변환
      const plainResult = {
        success: Boolean(result.success),
        url: result.url ? String(result.url) : undefined,
        error: result.error ? String(result.error) : undefined,
      }
      
      if (plainResult.success && plainResult.url) {
        setFileUrl(plainResult.url)
      } else {
        setError(plainResult.error || '파일 업로드에 실패했습니다.')
        setFile(null)
        setFileType(null)
      }
    } catch (err: any) {
      setError(err.message || '파일 업로드 중 오류가 발생했습니다.')
      setFile(null)
      setFileType(null)
    } finally {
      setUploading(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // 이미지 파일 확인
    if (!selectedFile.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    setThumbnailFile(selectedFile)
    setError(null)

    // 이미지 업로드
    setUploadingImage(true)
    try {
      let base64Data: string

      // 큰 이미지는 자동으로 압축
      if (needsCompression(selectedFile, 500)) {
        try {
          base64Data = await compressImage(selectedFile, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.85,
            maxSizeKB: 500,
          })
        } catch (error) {
          console.error('이미지 압축 실패, 원본 사용:', error)
          const reader = new FileReader()
          base64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = (event) => resolve(event.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(selectedFile)
          })
        }
      } else {
        const reader = new FileReader()
        base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = (event) => resolve(event.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
      }

      const result = await uploadImageToStorage(base64Data, selectedFile.name)

      // result를 plain object로 변환
      const plainResult = {
        success: Boolean(result.success),
        url: result.url ? String(result.url) : undefined,
        error: result.error ? String(result.error) : undefined,
      }

      if (plainResult.success && plainResult.url) {
        setThumbnailUrl(plainResult.url)
      } else {
        setError(plainResult.error || '이미지 업로드에 실패했습니다.')
        setThumbnailFile(null)
      }
    } catch (err: any) {
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.')
      setThumbnailFile(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!fileUrl && !initialData?.file_url) {
      setError('파일을 업로드해주세요.')
      return
    }

    if (!fileType && !initialData?.file_type) {
      setError('파일 형식을 확인할 수 없습니다.')
      return
    }

    setLoading(true)

    try {
      const finalFileUrl = fileUrl || initialData?.file_url || ''
      const finalFileType = fileType || initialData?.file_type || 'pdf'

      if (initialData?.id) {
        // 수정 - 모든 값을 명시적으로 plain object로 변환
        const result = await updateResource(
          Number(initialData.id),
          String(title),
          description ? String(description) : null,
          fileUrl ? String(fileUrl) : null,
          fileType ? String(fileType) as 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' : null,
          String(accessLevel) as 'bronze' | 'silver' | 'gold',
          Number(downloadCost) || 0,
          thumbnailUrl ? String(thumbnailUrl) : null
        )

        // result를 plain object로 변환
        const plainResult = {
          success: Boolean(result.success),
          error: result.error ? String(result.error) : undefined,
        }

        if (plainResult.success) {
          router.push('/admin/resources')
          router.refresh()
        } else {
          setError(plainResult.error || '자료 수정에 실패했습니다.')
        }
      } else {
        // 등록 - 모든 값을 명시적으로 plain object로 변환
        const result = await createResource(
          String(title),
          description ? String(description) : null,
          String(finalFileUrl),
          String(finalFileType) as 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx',
          String(accessLevel) as 'bronze' | 'silver' | 'gold',
          Number(downloadCost) || 0,
          thumbnailUrl ? String(thumbnailUrl) : null
        )

        // result를 plain object로 변환
        const plainResult = {
          success: Boolean(result.success),
          error: result.error ? String(result.error) : undefined,
          resourceId: result.resourceId ? Number(result.resourceId) : undefined,
        }

        if (plainResult.success) {
          router.push('/admin/resources')
          router.refresh()
        } else {
          setError(plainResult.error || '자료 등록에 실패했습니다.')
        }
      }
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 제목 */}
      <div>
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 2026학년도 대학입시 정책 가이드"
          required
          className="mt-1"
        />
      </div>

      {/* 설명 */}
      <div>
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="자료에 대한 설명을 입력하세요"
          rows={4}
          className="mt-1"
        />
      </div>

      {/* 썸네일 이미지 업로드 */}
      <div>
        <Label>썸네일 이미지 (선택사항)</Label>
        {thumbnailUrl ? (
          <div className="mt-2">
            <div className="relative w-full max-w-md h-48 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <SafeImage
                src={thumbnailUrl}
                alt="썸네일 미리보기"
                className="object-cover"
                fill
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                onClick={() => {
                  setThumbnailUrl('')
                  setThumbnailFile(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">클릭하여 이미지 선택</span> 또는 드래그 앤 드롭
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WebP (최대 5MB, 권장 크기: 1200x1200px)
                </p>
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
                disabled={uploadingImage}
              />
            </label>
            {uploadingImage && (
              <p className="mt-2 text-sm text-gray-600">이미지 업로드 중...</p>
            )}
          </div>
        )}
      </div>

      {/* 파일 업로드 */}
      <div>
        <Label>파일 *</Label>
        {fileUrl || initialData?.file_url ? (
          <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-nexo-navy" />
                <div>
                  <p className="font-medium text-gray-900">
                    {file?.name || '업로드된 파일'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {fileType || initialData?.file_type || '파일'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setFileUrl('')
                  setFileType(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">클릭하여 파일 선택</span> 또는 드래그 앤 드롭
                </p>
                <p className="text-xs text-gray-500">
                  PDF, Excel, 한글, Word, PowerPoint (최대 50MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.xlsx,.hwp,.docx,.pptx"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
            {uploading && (
              <p className="mt-2 text-sm text-gray-600">파일 업로드 중...</p>
            )}
          </div>
        )}
      </div>

      {/* 접근 레벨 */}
      <div>
        <Label htmlFor="accessLevel">접근 레벨</Label>
        <Select value={accessLevel} onValueChange={(value: 'bronze' | 'silver' | 'gold') => setAccessLevel(value)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bronze">🥉 브론즈 (모든 사용자)</SelectItem>
            <SelectItem value="silver">🥈 실버 (500포인트 이상)</SelectItem>
            <SelectItem value="gold">🥇 골드 (1000포인트 이상)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 다운로드 비용 */}
      <div>
        <Label htmlFor="downloadCost">다운로드 비용 (포인트)</Label>
        <Input
          id="downloadCost"
          type="number"
          min="0"
          value={downloadCost}
          onChange={(e) => setDownloadCost(parseInt(e.target.value) || 0)}
          placeholder="0"
          className="mt-1"
        />
        <p className="mt-1 text-sm text-gray-500">
          0으로 설정하면 무료로 다운로드할 수 있습니다.
        </p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading || uploading || uploadingImage}
          className="flex-1 bg-nexo-navy hover:bg-nexo-cyan"
        >
          {loading ? '저장 중...' : initialData?.id ? '수정하기' : '등록하기'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading || uploading || uploadingImage}
        >
          취소
        </Button>
      </div>
    </form>
  )
}
