'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFieldNews } from '@/app/actions/field-news'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

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
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [installationDate, setInstallationDate] = useState(
    initialData?.installation_date || ''
  )
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setImageFiles((prev) => [...prev, ...newFiles])

    // 미리보기용 URL 생성
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        setImages((prev) => [...prev, url])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) {
      return images.filter((img) => img.startsWith('http')) // 기존 URL은 그대로 유지
    }

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      // Supabase Storage에 업로드
      // 실제 구현 시 Supabase Storage 사용
      // 여기서는 임시로 base64 URL 사용 (실제로는 Storage에 업로드 필요)
      
      // TODO: Supabase Storage 연동
      // const supabase = createClient()
      // for (const file of imageFiles) {
      //   const fileName = `${Date.now()}-${file.name}`
      //   const { data, error } = await supabase.storage
      //     .from('field-news')
      //     .upload(fileName, file)
      //   if (!error && data) {
      //     const { data: urlData } = supabase.storage
      //       .from('field-news')
      //       .getPublicUrl(fileName)
      //     uploadedUrls.push(urlData.publicUrl)
      //   }
      // }

      // 임시: base64 URL 사용 (실제로는 Storage URL로 교체 필요)
      return images.filter((img) => img.startsWith('http') || img.startsWith('data:'))
    } catch (err: any) {
      throw new Error('이미지 업로드 실패: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      // 이미지 업로드
      const uploadedImageUrls = await uploadImages()

      const result = await createFieldNews({
        title,
        content,
        location: location || null,
        installation_date: installationDate || null,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        author_id: userId,
      })

      if (result.success) {
        router.push('/admin/field-news')
        router.refresh()
      } else {
        setError(result.error || '작성에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '작성 중 오류가 발생했습니다.')
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
        <Label>현장 사진</Label>
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="image-upload"
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-nexo-cyan transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>사진 선택</span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <span className="text-sm text-gray-500">
              설치기사가 촬영한 현장 사진을 업로드하세요
            </span>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`현장 사진 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="content">현장 분위기 설명 *</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="설치 현장의 분위기와 특징을 자세히 설명해주세요..."
          className="mt-2 w-full min-h-[300px] p-3 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          💡 설치 현장의 분위기, 고객 반응, 특별한 사항 등을 자세히 작성해주세요
        </p>
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
          disabled={loading || uploading}
        >
          취소
        </Button>
        <Button type="submit" disabled={loading || uploading} className="flex-1">
          {uploading
            ? '이미지 업로드 중...'
            : loading
            ? '작성 중...'
            : '작성하기'}
        </Button>
      </div>
    </form>
  )
}

