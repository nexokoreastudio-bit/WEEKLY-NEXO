'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getCommentsByPostId, createComment, deleteComment, type CommentWithAuthor } from '@/app/actions/comments'
import { useRouter } from 'next/navigation'
import styles from '@/app/community/community.module.css'

interface CommentsSectionProps {
  postId: number
  userId: string | null
  initialCommentsCount: number
  isAdmin?: boolean
}

export function CommentsSection({ postId, userId, initialCommentsCount, isAdmin = false }: CommentsSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    setIsLoading(true)
    const loadedComments = await getCommentsByPostId(postId)
    setComments(loadedComments)
    setCommentsCount(loadedComments.length)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      }
      return
    }

    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    const result = await createComment(postId, content, userId)
    
    if (result.success) {
      setContent('')
      await loadComments()
      router.refresh()
    } else {
      alert(result.error || '댓글 작성에 실패했습니다.')
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
      return
    }

    setDeletingIds((prev) => new Set(prev).add(commentId))
    const result = await deleteComment(commentId, postId)
    
    if (result.success) {
      await loadComments()
      router.refresh()
    } else {
      alert(result.error || '댓글 삭제에 실패했습니다.')
    }
    
    setDeletingIds((prev) => {
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
  }

  return (
    <div className={styles.commentsSection}>
      <h2 className={styles.commentsTitle}>
        <MessageSquare className="inline w-5 h-5 mr-2" />
        댓글 ({commentsCount})
      </h2>

      {/* 댓글 작성 폼 */}
      {userId ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="min-h-[100px] mb-3"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? '작성 중...' : '댓글 작성'}
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.commentLoginPrompt}>
          <p>댓글을 작성하려면 로그인이 필요합니다.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
          >
            로그인
          </Button>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className={styles.commentsList}>
        {isLoading ? (
          <p className={styles.commentsLoading}>댓글을 불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p className={styles.commentsEmpty}>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
        ) : (
          comments.map((comment) => {
            const isAuthor = userId === comment.author_id
            const canDelete = isAuthor || isAdmin

            return (
              <div key={comment.id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAuthor}>
                    {comment.author?.avatar_url ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.nickname || '익명'}
                        className={styles.commentAvatar}
                      />
                    ) : (
                      <div className={styles.commentAvatarPlaceholder}>
                        {(comment.author?.nickname || '익명')[0]}
                      </div>
                    )}
                    <span className={styles.commentAuthorName}>
                      {comment.author?.nickname || '익명'}
                    </span>
                    <span className={styles.commentDate}>
                      {format(new Date(comment.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                    </span>
                  </div>
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingIds.has(comment.id)}
                      className={styles.commentDeleteButton}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className={styles.commentContent}>
                  {comment.content.split('\n').map((line, idx) => (
                    <p key={idx}>{line || '\u00A0'}</p>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
