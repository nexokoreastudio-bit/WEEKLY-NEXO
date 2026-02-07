import Link from 'next/link'
import { getAllEditionsWithInfo } from '@/lib/supabase/articles'
import { SafeImage } from '@/components/safe-image'
import styles from './archive.module.css'

// 날짜 포맷팅 함수
function formatEditionDate(editionId: string): string {
  try {
    const date = new Date(editionId + 'T00:00:00Z')
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()
    const weekday = date.getUTCDay()
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    
    return `${year}년 ${months[month - 1]} ${day}일 (${weekdays[weekday]})`
  } catch {
    return editionId
  }
}

export default async function NewsArchivePage() {
  const editions = await getAllEditionsWithInfo()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📰 발행호 목록</h1>
        <p className={styles.subtitle}>
          NEXO Daily의 모든 발행호를 확인하세요
        </p>
      </div>

      {editions.length === 0 ? (
        <div className={styles.empty}>
          <p>발행된 호가 아직 없습니다.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {editions.map((edition) => (
            <Link
              key={edition.edition_id}
              href={`/news/${edition.edition_id}`}
              className={styles.card}
            >
              {edition.thumbnail_url && (
                <div className={styles.imageContainer}>
                  <SafeImage
                    src={edition.thumbnail_url}
                    alt={edition.title}
                    width={400}
                    height={250}
                    className={styles.image}
                  />
                </div>
              )}
              <div className={styles.content}>
                <div className={styles.date}>{formatEditionDate(edition.edition_id)}</div>
                <h2 className={styles.title}>{edition.title}</h2>
                {edition.subtitle && (
                  <p className={styles.subtitle}>{edition.subtitle}</p>
                )}
                <div className={styles.footer}>
                  <span className={styles.readMore}>읽기 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

