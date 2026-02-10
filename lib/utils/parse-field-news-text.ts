/**
 * 현장소식 텍스트 파싱 유틸리티
 * 자유 텍스트 입력을 구조화된 데이터로 변환
 */

export interface ParsedFieldData {
  storeName?: string
  location?: string
  model?: string
  additionalCables?: string
  stand?: string
  wallMount?: string
  payment?: string
  notes?: string
}

/**
 * 텍스트를 파싱하여 구조화된 필드 데이터 추출
 */
export function parseFieldNewsText(text: string): ParsedFieldData {
  const result: ParsedFieldData = {}
  
  if (!text || !text.trim()) {
    return result
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 상점명 추출 (예: "상점명 :초원유치원" 또는 "상점명:초원유치원")
    if (line.match(/^상점명\s*[:：]\s*(.+)$/i)) {
      const match = line.match(/^상점명\s*[:：]\s*(.+)$/i)
      if (match) {
        result.storeName = match[1].trim()
      }
      continue
    }

    // 지역 추출 (예: "(지역:안산시 단원구 초지동)" 또는 "지역:안산시 단원구 초지동")
    if (line.match(/[\(（]?\s*지역\s*[:：]\s*(.+?)[\)）]?$/i)) {
      const match = line.match(/[\(（]?\s*지역\s*[:：]\s*(.+?)[\)）]?$/i)
      if (match) {
        result.location = match[1].trim().replace(/[\(\)（）]/g, '')
      }
      continue
    }

    // 추가 케이블 추출
    if (line.match(/^추가\s*케이블\s*[:：]\s*(.+)$/i)) {
      const match = line.match(/^추가\s*케이블\s*[:：]\s*(.+)$/i)
      if (match) {
        result.additionalCables = match[1].trim()
      }
      continue
    }

    // 스탠드 추출 (값이 비어있을 수 있음)
    if (line.match(/^스탠드\s*[:：]\s*(.*)$/i)) {
      const match = line.match(/^스탠드\s*[:：]\s*(.*)$/i)
      if (match) {
        const value = match[1].trim()
        if (value) {
          result.stand = value
        }
      }
      continue
    }

    // 벽걸이 추출
    if (line.match(/^벽걸이\s*[:：]\s*(.+)$/i)) {
      const match = line.match(/^벽걸이\s*[:：]\s*(.+)$/i)
      if (match) {
        result.wallMount = match[1].trim()
      }
      continue
    }

    // 모델 추출
    if (line.match(/^모델\s*[:：]\s*(.+)$/i)) {
      const match = line.match(/^모델\s*[:：]\s*(.+)$/i)
      if (match) {
        result.model = match[1].trim()
      }
      continue
    }

    // 결제 추출 (값이 비어있을 수 있음)
    if (line.match(/^결제\s*[:：]\s*(.*)$/i)) {
      const match = line.match(/^결제\s*[:：]\s*(.*)$/i)
      if (match) {
        const value = match[1].trim()
        if (value) {
          result.payment = value
        }
      }
      continue
    }

    // 특이사항 추출 (여러 줄 가능)
    if (line.match(/^특이사항\s*[:：]\s*(.*)$/i)) {
      const match = line.match(/^특이사항\s*[:：]\s*(.*)$/i)
      if (match) {
        // 특이사항은 여러 줄일 수 있으므로 나머지 줄들도 포함
        let notes = match[1].trim()
        // 다음 줄들도 특이사항에 포함 (다른 필드가 나올 때까지)
        let skipCount = 0
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j]
          // 다른 필드가 시작되면 중단
          if (nextLine.match(/^(상점명|지역|추가\s*케이블|스탠드|벽걸이|모델|결제|특이사항)\s*[:：]/i)) {
            break
          }
          notes += '\n' + nextLine
          skipCount++
        }
        if (notes.trim()) {
          result.notes = notes.trim()
        }
        // 처리한 줄들 건너뛰기
        i += skipCount
      }
      continue
    }
  }

  return result
}

/**
 * 파싱된 데이터로부터 제목 자동 생성
 */
export function generateTitle(parsedData: ParsedFieldData): string {
  if (parsedData.storeName) {
    return `${parsedData.storeName} 설치 완료`
  }
  return '현장 설치 완료'
}
