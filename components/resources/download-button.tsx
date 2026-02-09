'use client'

import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { downloadResource } from '@/app/actions/resources'
import { Button } from '@/components/ui/button'

interface DownloadResourceButtonProps {
  resourceId: number
  downloadCost: number
  hasDownloaded: boolean
  userPoint: number
}

/**
 * 자료 다운로드 버튼 컴포넌트
 */
export function DownloadResourceButton({
  resourceId,
  downloadCost,
  hasDownloaded,
  userPoint,
}: DownloadResourceButtonProps) {
  const [loading, setLoading] = useState(false)
  const [downloaded, setDownloaded] = useState(hasDownloaded)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (downloaded) {
      // 이미 다운로드한 경우 다시 다운로드
      const result = await downloadResource(resourceId)
      if (result.success && result.fileUrl) {
        window.open(result.fileUrl, '_blank')
      }
      return
    }

    if (userPoint < downloadCost) {
      setError(`포인트가 부족합니다. (필요: ${downloadCost}P)`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await downloadResource(resourceId)

      if (result.success && result.fileUrl) {
        setDownloaded(true)
        // 파일 다운로드
        window.open(result.fileUrl, '_blank')
        // 페이지 새로고침하여 포인트 업데이트
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setError(result.error || '다운로드에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '다운로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
          {error}
        </div>
      )}
      <Button
        onClick={handleDownload}
        disabled={loading || (!downloaded && userPoint < downloadCost)}
        className={`w-full ${
          downloaded
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-nexo-navy hover:bg-nexo-cyan'
        }`}
      >
        {loading ? (
          <>로딩 중...</>
        ) : downloaded ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            다시 다운로드
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {downloadCost > 0 ? `${downloadCost}P로 다운로드` : '무료 다운로드'}
          </>
        )}
      </Button>
    </div>
  )
}


