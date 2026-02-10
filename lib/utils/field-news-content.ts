/**
 * 현장소식 자동 콘텐츠 생성 유틸리티
 * 구조화된 필드 정보를 HTML로 변환하고 이미지를 자동 배치
 */

export interface StructuredFieldData {
  storeName?: string
  location?: string
  model?: string
  additionalCables?: string
  stand?: string
  wallMount?: string
  payment?: string
  notes?: string
  installationDate?: string
}

/**
 * 구조화된 필드 데이터를 HTML 콘텐츠로 변환
 * 이미지는 텍스트 사이에 자동으로 배치됨
 */
export function generateFieldNewsContent(
  fields: StructuredFieldData,
  images: string[] = []
): string {
  const sections: string[] = []

  // 헤더 섹션 (상점명, 지역, 설치일자)
  if (fields.storeName || fields.location) {
    sections.push('<div class="field-news-header">')
    
    if (fields.storeName) {
      sections.push(`<h2 class="text-2xl font-bold mb-2">${escapeHtml(fields.storeName)}</h2>`)
    }
    
    if (fields.location) {
      sections.push(`<p class="text-gray-600 mb-2">📍 지역: ${escapeHtml(fields.location)}</p>`)
    }
    
    if (fields.installationDate) {
      const date = new Date(fields.installationDate)
      const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      sections.push(`<p class="text-gray-600 mb-4">📅 설치일: ${formattedDate}</p>`)
    }
    
    sections.push('</div>')
    
    // 첫 번째 이미지 삽입
    if (images.length > 0) {
      sections.push(`<div class="field-news-image my-6"><img src="${images[0]}" alt="현장 사진" class="w-full rounded-lg" /></div>`)
    }
  }

  // 설치 정보 섹션
  const installationInfo: string[] = []
  
  if (fields.model) {
    installationInfo.push(`<li><strong>모델:</strong> ${escapeHtml(fields.model)}</li>`)
  }
  
  if (fields.additionalCables) {
    installationInfo.push(`<li><strong>추가 케이블:</strong> ${escapeHtml(fields.additionalCables)}</li>`)
  }
  
  if (fields.stand) {
    installationInfo.push(`<li><strong>스탠드:</strong> ${escapeHtml(fields.stand)}</li>`)
  }
  
  if (fields.wallMount) {
    installationInfo.push(`<li><strong>벽걸이:</strong> ${escapeHtml(fields.wallMount)}</li>`)
  }
  
  if (fields.payment) {
    installationInfo.push(`<li><strong>결제:</strong> ${escapeHtml(fields.payment)}</li>`)
  }

  if (installationInfo.length > 0) {
    sections.push('<div class="field-news-installation-info my-6">')
    sections.push('<h3 class="text-xl font-semibold mb-3">설치 정보</h3>')
    sections.push('<ul class="space-y-2">')
    sections.push(...installationInfo)
    sections.push('</ul>')
    sections.push('</div>')
    
    // 두 번째 이미지 삽입 (있는 경우)
    if (images.length > 1) {
      sections.push(`<div class="field-news-image my-6"><img src="${images[1]}" alt="설치 현장 사진" class="w-full rounded-lg" /></div>`)
    }
  }

  // 특이사항 섹션
  if (fields.notes) {
    sections.push('<div class="field-news-notes my-6">')
    sections.push('<h3 class="text-xl font-semibold mb-3">특이사항</h3>')
    sections.push(`<p class="text-gray-700">${escapeHtml(fields.notes)}</p>`)
    sections.push('</div>')
    
    // 세 번째 이미지 삽입 (있는 경우)
    if (images.length > 2) {
      sections.push(`<div class="field-news-image my-6"><img src="${images[2]}" alt="특이사항 관련 사진" class="w-full rounded-lg" /></div>`)
    }
  }

  // 나머지 이미지들 (4개 이상인 경우)
  if (images.length > 3) {
    sections.push('<div class="field-news-gallery my-6">')
    sections.push('<h3 class="text-xl font-semibold mb-3">추가 사진</h3>')
    sections.push('<div class="grid grid-cols-2 gap-4">')
    
    for (let i = 3; i < images.length; i++) {
      sections.push(`<div class="field-news-image"><img src="${images[i]}" alt="현장 사진 ${i + 1}" class="w-full rounded-lg" /></div>`)
    }
    
    sections.push('</div>')
    sections.push('</div>')
  }

  return sections.join('\n')
}

/**
 * HTML 특수 문자 이스케이프
 */
function escapeHtml(text: string): string {
  if (!text) return ''
  
  if (typeof document !== 'undefined') {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
