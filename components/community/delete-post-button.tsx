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
      const result = await deletePost(postId)
      
      // redirect가 발생하면 result가 undefined일 수 있음
      if (result && !result.success) {
        alert(result.error || '게시글 삭제에 실패했습니다.')
        setIsDeleting(false)
        setShowConfirm(false)
        return
      }
      
      // 성공 시 (redirect가 발생하거나 result.success가 true인 경우)
      // redirect가 발생하면 예외가 throw되므로 여기까지 오지 않음
      // 하지만 안전하게 리다이렉트 처리
      router.push('/community')
      router.refresh()
    } catch (error: any) {
      // Next.js redirect는 특별한 예외를 throw하므로 이를 처리
      if (error?.message?.includes('NEXT_REDIRECT')) {
        // redirect가 발생한 경우 정상 처리
        router.push('/community')
        router.refresh()
        return
      }
      
      console.error('게시글 삭제 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
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
