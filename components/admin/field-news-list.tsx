'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SafeImage } from '@/components/safe-image'
import { Button } from '@/components/ui/button'
import styles from './field-news-list.module.css'

type FieldNewsUpdate = Database['public']['Tables']['field_news']['Update']

interface FieldNews {
  id: number
  title: string
  content: string
  location: string | null
  installation_date: string | null
  images: string[] | null
  is_published: boolean
  views: number
  published_at: string | null
  created_at: string
}

export function FieldNewsList() {
  const [fieldNews, setFieldNews] = useState<FieldNews[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFieldNews()
  }, [])

  const loadFieldNews = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('field_news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('현장 소식 조회 실패:', error)
        return
      }

      setFieldNews(data || [])
    } catch (error) {
      console.error('현장 소식 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const updateData: FieldNewsUpdate = {
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null,
      }
      
      const { error } = await supabase
        .from('field_news')
        .update(updateData as any as never)
        .eq('id', id)

      if (error) {
        alert('발행 상태 변경 실패: ' + error.message)
        return
      }

      loadFieldNews()
    } catch (error: any) {
      alert('오류: ' + error.message)
    }
  }

  const deleteNews = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('field_news')
        .delete()
        .eq('id', id)

      if (error) {
        alert('삭제 실패: ' + error.message)
        return
      }

      loadFieldNews()
    } catch (error: any) {
      alert('오류: ' + error.message)
    }
  }

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>
  }

  if (fieldNews.length === 0) {
    return (
      <div className={styles.empty}>
        <p>등록된 현장 소식이 없습니다.</p>
        <Link href="/admin/field-news/write" className={styles.emptyButton}>
          첫 현장 소식 작성하기
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {fieldNews.map((news) => (
        <div key={news.id} className={styles.card}>
          {news.images && news.images.length > 0 && (
            <div className={styles.imageContainer}>
              <SafeImage
                src={news.images[0]}
                alt={news.title}
                width={200}
                height={150}
                className={styles.image}
              />
            </div>
          )}
          <div className={styles.content}>
            <div className={styles.header}>
              <h3 className={styles.title}>{news.title}</h3>
              <div className={styles.badges}>
                {news.is_published ? (
                  <span className={styles.publishedBadge}>발행됨</span>
                ) : (
                  <span className={styles.draftBadge}>임시저장</span>
                )}
              </div>
            </div>
            {news.location && (
              <p className={styles.location}>📍 {news.location}</p>
            )}
            {news.installation_date && (
              <p className={styles.date}>
                📅 {format(new Date(news.installation_date), 'yyyy년 M월 d일', { locale: ko })}
              </p>
            )}
            <p className={styles.description}>
              {news.content.replace(/<[^>]*>/g, '').substring(0, 150)}
              {news.content.length > 150 ? '...' : ''}
            </p>
            <div className={styles.meta}>
              <span>👁️ {news.views}회 조회</span>
              {news.published_at && (
                <span>
                  발행일: {format(new Date(news.published_at), 'yyyy.MM.dd', { locale: ko })}
                </span>
              )}
            </div>
            <div className={styles.actions}>
              <Link href={`/admin/field-news/${news.id}/edit`} className={styles.editButton}>
                수정
              </Link>
              <Button
                onClick={() => togglePublish(news.id, news.is_published)}
                variant={news.is_published ? 'outline' : 'default'}
                size="sm"
              >
                {news.is_published ? '발행 취소' : '발행하기'}
              </Button>
              <Button
                onClick={() => deleteNews(news.id)}
                variant="destructive"
                size="sm"
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

