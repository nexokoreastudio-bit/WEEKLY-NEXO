import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Database } from '@/types/database'
import { sanitizeHtml } from '@/lib/utils/sanitize'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { incrementFieldNewsViews } from '@/app/actions/field-news'
import styles from '../field.module.css'

type FieldNewsRow = Database['public']['Tables']['field_news']['Row']

interface PageProps {
  params: {
    id: string
  }
}

export default async function FieldNewsDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const newsId = parseInt(params.id)

  if (isNaN(newsId)) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>존재하지 않는 현장 소식입니다.</p>
          <Link href="/field" className={styles.backLink}>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 현장 소식 조회
  const { data: fieldNewsData, error } = await supabase
    .from('field_news')
    .select('*')
    .eq('id', newsId)
    .eq('is_published', true)
    .single()

  if (error || !fieldNewsData) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>현장 소식을 찾을 수 없습니다.</p>
          <Link href="/field" className={styles.backLink}>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const news = fieldNewsData as FieldNewsRow

  // 조회수 증가 (비동기로 처리하여 응답 속도 향상)
  incrementFieldNewsViews(newsId).catch((err) => {
    console.error('조회수 증가 실패:', err)
  })

  return (
    <div className={styles.container}>
      <div className={styles.detailHeader}>
        <Link href="/field">
          <Button variant="ghost" size="sm" className={styles.backButton}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
      </div>

      <article className={styles.detailCard}>
        <div className={styles.detailContent}>
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
          <h1 className={styles.detailTitle}>{news.title}</h1>
          
          {/* 네이버 카페 스타일: 이미지와 텍스트가 자연스럽게 섞인 콘텐츠 */}
          <div
            className={styles.detailDescription}
            dangerouslySetInnerHTML={{ 
              __html: (() => {
                let html = sanitizeHtml(news.content || '')
                
                // 이미지 태그가 있으면 클래스 추가 및 속성 보강
                html = html.replace(
                  /<img([^>]*?)(?:\s+class=["'][^"']*["'])?([^>]*)>/gi,
                  (match, before, after) => {
                    const hasClass = /class=["']/.test(match)
                    if (hasClass) {
                      return match.replace(
                        /class=["']([^"']*)["']/,
                        'class="$1 field-news-image"'
                      )
                    } else {
                      return `<img${before} class="field-news-image"${after}>`
                    }
                  }
                )
                
                // loading="lazy" 추가 (없는 경우만)
                html = html.replace(
                  /<img([^>]*?)(?:\s+loading=["'][^"']*["'])?([^>]*)>/gi,
                  (match) => {
                    if (!/loading=["']/.test(match)) {
                      return match.replace(/>$/, ' loading="lazy">')
                    }
                    return match
                  }
                )
                
                return html
              })()
            }}
          />
          
          <div className={styles.detailFooter}>
            <span className={styles.views}>👁️ {news.views || 0}회 조회</span>
            {news.published_at && (
              <span className={styles.publishedAt}>
                발행일: {format(new Date(news.published_at), 'yyyy년 MM월 dd일', { locale: ko })}
              </span>
            )}
          </div>
        </div>
      </article>

      <div className={styles.detailActions}>
        <Link href="/field">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
}
