import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPostById } from '@/lib/supabase/posts'
import { deletePost } from '@/app/actions/posts'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, MessageSquare, HelpCircle, Lightbulb, ShoppingBag } from 'lucide-react'
import { HtmlContent } from '@/components/html-content'
import { DeletePostButton } from '@/components/community/delete-post-button'
import styles from '../community.module.css'

const BOARD_TYPE_INFO = {
  free: { label: '자유게시판', icon: MessageSquare },
  qna: { label: 'Q&A', icon: HelpCircle },
  tip: { label: '팁 & 노하우', icon: Lightbulb },
  market: { label: '중고장터', icon: ShoppingBag },
} as const

interface PageProps {
  params: {
    id: string
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const postId = parseInt(params.id)

  if (isNaN(postId)) {
    notFound()
  }

  const post = await getPostById(postId)

  if (!post) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthor = user?.id === post.author_id

  // 관리자 권한 확인
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const canDelete = isAuthor || isAdmin
  const boardInfo = post.board_type ? BOARD_TYPE_INFO[post.board_type] : null

  return (
    <div className={styles.container}>
      <Link href="/community" className={styles.backLink}>
        <ArrowLeft className={styles.backIcon} />
        목록으로
      </Link>

      <article className={styles.postDetail}>
        <div className={styles.postDetailHeader}>
          <div className={styles.postDetailMeta}>
            {boardInfo && (
              <span className={styles.boardType}>
                {boardInfo.label}
              </span>
            )}
            <span className={styles.author}>
              {post.author?.nickname || '익명'}
            </span>
            <span className={styles.date}>
              {format(new Date(post.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
            </span>
            {post.updated_at !== post.created_at && (
              <span className={styles.updated}>
                (수정됨: {format(new Date(post.updated_at), 'yyyy.MM.dd HH:mm', { locale: ko })})
              </span>
            )}
          </div>
        </div>

        <h1 className={styles.postDetailTitle}>{post.title}</h1>

        {post.images && post.images.length > 0 && (
          <div className={styles.postImages}>
            {post.images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`첨부 이미지 ${index + 1}`}
                className={styles.postImage}
              />
            ))}
          </div>
        )}

        <div className={styles.postDetailContent}>
          <HtmlContent html={post.content} />
        </div>

        <div className={styles.postDetailFooter}>
          <div className={styles.postStats}>
            <span>👍 {post.likes_count}</span>
            <span>💬 {post.comments_count}</span>
          </div>

          {canDelete && (
            <div className={styles.postActions}>
              {isAuthor && (
                <Link href={`/community/${post.id}/edit`} className={styles.editButton}>
                  수정
                </Link>
              )}
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>
      </article>

      {/* 댓글 섹션 (향후 구현) */}
      <div className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>💬 댓글 ({post.comments_count})</h2>
        <p className={styles.commentsComingSoon}>댓글 기능은 곧 추가될 예정입니다.</p>
      </div>
    </div>
  )
}


