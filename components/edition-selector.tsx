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
    const date = new Date(editionId + 'T00:00:00Z')
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    return `${month}/${day}`
  } catch {
    return editionId
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
        {editions.map((editionId) => (
          <option key={editionId} value={editionId}>
            {editionId} ({formatEditionDate(editionId)})
          </option>
        ))}
      </select>
      <Link href="/news" className={selectorStyles.archiveLink}>
        <Calendar className={selectorStyles.icon} />
        <span>전체 목록</span>
      </Link>
    </div>
  )
}

