/**
 * 이미지 압축 및 리사이징 유틸리티
 */

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

/**
 * 이미지를 압축하고 리사이징합니다
 * @param file 원본 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 이미지의 base64 데이터 URL
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeKB = 500,
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 원본 크기 확인
        let width = img.width
        let height = img.height

        // 비율 유지하면서 리사이징
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        // Canvas 생성
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        // 이미지 그리기
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context를 생성할 수 없습니다.'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // JPEG로 변환 (압축)
        const compressAndCheck = (currentQuality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('이미지 압축에 실패했습니다.'))
                return
              }

              const sizeKB = blob.size / 1024

              // 목표 크기보다 크면 품질을 낮춰서 다시 압축
              if (sizeKB > maxSizeKB && currentQuality > 0.3) {
                compressAndCheck(currentQuality - 0.1)
                return
              }

              // 최종 base64 변환
              const reader = new FileReader()
              reader.onload = (event) => {
                resolve(event.target?.result as string)
              }
              reader.onerror = () => {
                reject(new Error('이미지 변환에 실패했습니다.'))
              }
              reader.readAsDataURL(blob)
            },
            'image/jpeg',
            currentQuality
          )
        }

        compressAndCheck(quality)
      }
      img.onerror = () => {
        reject(new Error('이미지를 로드할 수 없습니다.'))
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 이미지 파일의 크기를 확인합니다
 * @param file 이미지 파일
 * @returns 크기 (KB)
 */
export function getImageSizeKB(file: File): number {
  return file.size / 1024
}

/**
 * 이미지가 압축이 필요한지 확인합니다
 * @param file 이미지 파일
 * @param thresholdKB 임계값 (KB)
 * @returns 압축 필요 여부
 */
export function needsCompression(file: File, thresholdKB: number = 1000): boolean {
  return getImageSizeKB(file) > thresholdKB
}
