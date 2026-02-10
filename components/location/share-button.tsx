'use client'

import { useState } from 'react'
import styles from '@/app/location/location.module.css'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  const shareText = `🚗 검단 지식산업센터 제조동 527호 오시는 길 안내

주차장 입구가 제조동 / 기숙사동 두 곳입니다.

반드시 제조동 입구로 진입해주세요.

차량으로 램프를 타고 5층까지 올라오실 수 있습니다.

5층 도착 후 제조동 527호로 오시면 됩니다.

📍 주소: 인천 서구 검단지식산업센터 제조동 527호
(사진 안내 참고)

🔗 상세 안내: ${typeof window !== 'undefined' ? window.location.href : 'https://daily-nexo.netlify.app/location'}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '검단 지식산업센터 제조동 527호 오시는 길',
          text: shareText,
          url: typeof window !== 'undefined' ? window.location.href : 'https://daily-nexo.netlify.app/location',
        })
      } catch (err) {
        // 사용자가 공유를 취소한 경우 무시
        if ((err as Error).name !== 'AbortError') {
          console.error('공유 실패:', err)
        }
      }
    } else {
      // 공유 API가 없으면 클립보드에 복사
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('복사 실패:', err)
        alert('안내 문구를 복사할 수 없습니다. 수동으로 복사해주세요.')
      }
    }
  }

  return (
    <button onClick={handleShare} className={styles.shareButton}>
      {copied ? '✅ 복사되었습니다!' : '📱 카톡/문자로 공유하기'}
    </button>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('복사 실패:', err)
      alert('안내 문구를 복사할 수 없습니다.')
    }
  }

  return (
    <button onClick={handleCopy} className={styles.copyButton}>
      {copied ? '✅ 복사되었습니다!' : '📋 복사하기'}
    </button>
  )
}
