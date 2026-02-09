'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import styles from './edition-navigation.module.css'

interface EditionNavigationProps {
  currentEditionId: string
  prevEditionId: string | null
  nextEditionId: string | null
  allEditions: string[]
}

/**
 * 발행호 네비게이션 컴포넌트
 * 이전/다음 발행호로 이동할 수 있는 버튼과 발행호 목록 링크 제공
 */
export function EditionNavigation({
  currentEditionId,
  prevEditionId,
  nextEditionId,
  allEditions,
}: EditionNavigationProps) {
  const formatDate = (editionId: string): string => {
    try {
      const date = new Date(editionId + 'T00:00:00Z')
      const month = date.getUTCMonth() + 1
      const day = date.getUTCDate()
      return `${month}/${day}`
    } catch {
      return editionId
    }
  }

  return (
    <nav className={styles.navigation}>
      <div className={styles.navButtons}>
        {prevEditionId ? (
          <Link href={`/news/${prevEditionId}`} className={styles.navButton}>
            <ChevronLeft className={styles.icon} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>이전 호</span>
              <span className={styles.buttonDate}>{formatDate(prevEditionId)}</span>
            </div>
          </Link>
        ) : (
          <div className={`${styles.navButton} ${styles.disabled}`}>
            <ChevronLeft className={styles.icon} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>이전 호</span>
              <span className={styles.buttonDate}>없음</span>
            </div>
          </div>
        )}

        <Link href="/news" className={styles.archiveButton}>
          <Calendar className={styles.icon} />
          <span>발행호 목록</span>
        </Link>

        {nextEditionId ? (
          <Link href={`/news/${nextEditionId}`} className={styles.navButton}>
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>다음 호</span>
              <span className={styles.buttonDate}>{formatDate(nextEditionId)}</span>
            </div>
            <ChevronRight className={styles.icon} />
          </Link>
        ) : (
          <div className={`${styles.navButton} ${styles.disabled}`}>
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>다음 호</span>
              <span className={styles.buttonDate}>없음</span>
            </div>
            <ChevronRight className={styles.icon} />
          </div>
        )}
      </div>
    </nav>
  )
}


