'use client'

import { Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageDownloadButtonProps {
  imageUrl: string
  fileName: string
}

/**
 * 이미지 다운로드 버튼 컴포넌트
 */
export function ImageDownloadButton({ imageUrl, fileName }: ImageDownloadButtonProps) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    // 파일 확장자 추출
    const extension = imageUrl.split('.').pop()?.split('?')[0] || 'png'
    link.download = `${fileName}_이미지.${extension}`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      <ImageIcon className="w-4 h-4 mr-2" />
      이미지 다운로드
    </Button>
  )
}
