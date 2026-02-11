'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/app/actions/posts'
import styles from '../../app/community/community.module.css'

interface DeletePostButtonProps {
  postId: number
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      console.log('게시글 삭제 시도:', { postId })
      const result = await deletePost(postId)
      console.log('게시글 삭제 결과:', result)
      
      if (!result) {
        console.error('게시글 삭제 실패: 응답 없음')
        alert('게시글 삭제에 실패했습니다. (응답 없음)')
        setIsDeleting(false)
        setShowConfirm(false)
        return
      }
      
      if (!result.success) {
        console.error('게시글 삭제 실패:', result.error)
        alert(result.error || '게시글 삭제에 실패했습니다.')
        setIsDeleting(false)
        setShowConfirm(false)
        return
      }
      
      // 성공 시 리다이렉트
      console.log('게시글 삭제 성공, 리다이렉트')
      // 페이지 새로고침 후 리다이렉트
      window.location.href = '/community'
    } catch (error: any) {
      console.error('게시글 삭제 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'))
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className={styles.deleteConfirm}>
        <span className={styles.deleteConfirmText}>정말 삭제하시겠습니까?</span>
        <div className={styles.deleteConfirmButtons}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={styles.deleteConfirmButton}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            className={styles.cancelButton}
          >
            취소
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className={styles.deleteButton}
    >
      삭제
    </button>
  )
}
