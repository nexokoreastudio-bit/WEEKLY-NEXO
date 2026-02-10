'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import styles from '@/app/page.module.css'
import selectorStyles from './edition-selector.module.css'

interface EditionSelectorProps {
  editions: string[]
  currentEditionId: string
}

// 날짜 포맷팅 함수
function formatEditionDate(editionId: string): string {
  try {
    // -insight-{id} 형식인 경우 날짜 부분만 추출
    const datePart = editionId.replace(/-insight-\d+$/, '')
    
    // YYYY-MM-DD 형식인지 확인
    const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!dateMatch) {
      return '' // 형식이 맞지 않으면 빈 문자열 반환
    }
    
    const month = parseInt(dateMatch[2], 10)
    const day = parseInt(dateMatch[3], 10)
    
    // 유효한 날짜인지 확인
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return ''
    }
    
    return `${month}/${day}`
  } catch {
    return ''
  }
}

export function EditionSelector({ editions, currentEditionId }: EditionSelectorProps) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      router.push(`/news/${e.target.value}`)
    } else {
      router.push('/')
    }
  }

  return (
    <div className={selectorStyles.selectorContainer}>
      <select 
        className={styles.editionSelect}
        onChange={handleChange}
        defaultValue={currentEditionId || ''}
      >
        <option value="">최신호 보기</option>
        {editions.map((editionId) => {
          // -insight-{id} 형식인 경우 날짜 부분만 표시
          const displayId = editionId.replace(/-insight-\d+$/, '')
          const dateStr = formatEditionDate(editionId)
          return (
            <option key={editionId} value={editionId}>
              {displayId}{dateStr ? ` (${dateStr})` : ''}
            </option>
          )
        })}
      </select>
      <Link href="/news" className={selectorStyles.archiveLink}>
        <Calendar className={selectorStyles.icon} />
        <span>전체 목록</span>
      </Link>
    </div>
  )
}

