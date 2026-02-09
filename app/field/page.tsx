import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SafeImage } from '@/components/safe-image'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Database } from '@/types/database'
import styles from './field.module.css'

type FieldNewsRow = Database['public']['Tables']['field_news']['Row']

// content에서 첫 번째 이미지 URL 추출
function getFirstImageUrl(content: string | null): string | null {
  if (!content) return null
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  return imgMatch ? imgMatch[1] : null
}

// content에서 텍스트만 추출 (요약용)
function getTextSummary(content: string | null, maxLength: number = 150): string {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '').trim()
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export default async function FieldNewsPage() {
  const supabase = await createClient()

  // 현장 소식 가져오기 (최신순)
  const { data: fieldNewsData, error } = await supabase
    .from('field_news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('❌ 현장 소식 조회 실패:', error)
  }

  const fieldNews = (fieldNewsData || []) as FieldNewsRow[]


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🏗️ 넥소 현장 소식</h1>
        <p className={styles.subtitle}>
          전국 각지에서 진행되는 넥소 전자칠판 설치 현장을 소개합니다
        </p>
      </div>

      {!fieldNews || fieldNews.length === 0 ? (
        <div className={styles.empty}>
          <p>현장 소식이 아직 없습니다.</p>
          <p className={styles.emptySubtext}>
            곧 다양한 현장 소식을 전해드리겠습니다.
          </p>
        </div>
      ) : (
        <div className={styles.newsGrid}>
          {fieldNews.map((news) => {
            const thumbnailUrl = getFirstImageUrl(news.content)
            const summary = getTextSummary(news.content)
            
            return (
              <Link key={news.id} href={`/field/${news.id}`} className={styles.newsCardLink}>
                <article className={styles.newsCard}>
                  {thumbnailUrl && (
                    <div className={styles.thumbnail}>
                      <SafeImage
                        src={thumbnailUrl}
                        alt={news.title || '현장 소식'}
                        width={400}
                        height={300}
                        className={styles.thumbnailImage}
                      />
                    </div>
                  )}
                  <div className={styles.cardContent}>
                    <div className={styles.meta}>
                      {news.location && (
                        <span className={styles.location}>📍 {news.location}</span>
                      )}
                      {news.installation_date && (
                        <span className={styles.date}>
                          📅 {format(new Date(news.installation_date), 'yyyy년 M월 d일', { locale: ko })}
                        </span>
                      )}
                    </div>
                    <h2 className={styles.cardTitle}>{news.title}</h2>
                    {summary && (
                      <p className={styles.summary}>{summary}</p>
                    )}
                    <div className={styles.cardFooter}>
                      <span className={styles.views}>👁️ {news.views || 0}</span>
                      {news.published_at && (
                        <span className={styles.publishedAt}>
                          {format(new Date(news.published_at), 'yyyy.MM.dd', { locale: ko })}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}

      <div className={styles.cta}>
        <h3>현장 소식은 관리자가 직접 등록합니다</h3>
        <p>
          설치기사가 촬영한 현장 사진과 설명을 관리자 페이지에서 등록하여<br />
          사용자들에게 현장의 생생한 분위기를 전달합니다.
        </p>
      </div>
    </div>
  )
}

