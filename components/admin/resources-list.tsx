'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FileText, FileSpreadsheet, File, FileImage, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteResource, getResourcesForAdmin } from '@/app/actions/resources'
import { SafeImage } from '@/components/safe-image'
import Link from 'next/link'

type Resource = Database['public']['Tables']['resources']['Row']

const FILE_TYPE_ICONS = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  hwp: File,
  docx: FileText,
  pptx: FileImage,
}

const FILE_TYPE_LABELS = {
  pdf: 'PDF',
  xlsx: 'Excel',
  hwp: '한글',
  docx: 'Word',
  pptx: 'PowerPoint',
}

const LEVEL_LABELS = {
  bronze: '🥉 브론즈',
  silver: '🥈 실버',
  gold: '🥇 골드',
}

export function ResourcesList() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      const result = await getResourcesForAdmin()
      
      if (result.success && result.data) {
        setResources(result.data)
      } else {
        console.error('자료 조회 실패:', result.error)
      }
    } catch (error) {
      console.error('자료 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`정말 삭제하시겠습니까?\n\n제목: ${title}\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const result = await deleteResource(id)

      if (result.success) {
        loadResources()
      } else {
        alert('삭제 실패: ' + (result.error || '알 수 없는 오류'))
      }
    } catch (error: any) {
      console.error('삭제 오류:', error)
      alert('오류: ' + (error.message || '알 수 없는 오류가 발생했습니다.'))
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">등록된 자료가 없습니다.</p>
        <Link
          href="/admin/resources/write"
          className="inline-block px-6 py-3 bg-nexo-navy text-white rounded-lg hover:bg-nexo-cyan transition-colors"
        >
          첫 자료 등록하기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => {
        const FileIcon = resource.file_type
          ? FILE_TYPE_ICONS[resource.file_type] || File
          : File

        const thumbnailUrl = (resource as any).thumbnail_url

        return (
          <div
            key={resource.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* 썸네일 이미지 */}
            {thumbnailUrl && (
              <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                <SafeImage
                  src={thumbnailUrl}
                  alt={resource.title}
                  className="object-cover"
                  fill
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FileIcon className="w-6 h-6 text-nexo-navy" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {resource.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {resource.file_type ? FILE_TYPE_LABELS[resource.file_type] : '파일'}
                    </span>
                  </div>

                  {resource.description && (
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>{LEVEL_LABELS[resource.access_level]}</span>
                    {resource.download_cost > 0 && (
                      <span>💰 {resource.download_cost}P</span>
                    )}
                    <span>📥 {resource.downloads_count}회 다운로드</span>
                    <span>
                      등록일: {format(new Date(resource.created_at), 'yyyy.MM.dd', { locale: ko })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/admin/resources/${resource.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      수정
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(resource.id, resource.title)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
