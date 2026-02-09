'use client'

import { useState, useEffect } from 'react'
import { dailyCheckin, getTodayCheckinStatus, getCheckinStreak } from '@/app/actions/checkin'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle2, Flame } from 'lucide-react'

export function DailyCheckin() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    loadCheckinStatus()
  }, [])

  const loadCheckinStatus = async () => {
    try {
      const [statusResult, streakResult] = await Promise.all([
        getTodayCheckinStatus(),
        getCheckinStreak(),
      ])

      setCheckedIn(statusResult.checkedIn)
      setStreak(streakResult.streak || 0)
    } catch (error) {
      console.error('출석 상태 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async () => {
    if (checkedIn || checkingIn) return

    setCheckingIn(true)
    try {
      const result = await dailyCheckin()
      if (result.success) {
        setCheckedIn(true)
        setStreak(prev => prev + 1)
        alert(`출석 완료! +${result.pointsEarned}포인트가 적립되었습니다. 🎉`)
        // 상태 새로고침
        await loadCheckinStatus()
      } else {
        alert(result.error || '출석 처리에 실패했습니다.')
      }
    } catch (error: any) {
      alert(error.message || '출석 처리 중 오류가 발생했습니다.')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">출석 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          일일 출석
        </h3>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-orange-600 font-semibold">
            <Flame className="w-4 h-4" />
            {streak}일 연속
          </div>
        )}
      </div>

      <div className="space-y-4">
        {checkedIn ? (
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">오늘 출석 완료!</span>
            </div>
            <p className="text-sm text-gray-600">
              +5 포인트가 적립되었습니다. 내일 다시 출석해주세요!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>💡 출석 혜택:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>일일 출석: <strong className="text-orange-600">+5 포인트</strong></li>
                <li>연속 출석 시 추가 혜택 (준비 중)</li>
              </ul>
            </div>

            <Button
              onClick={handleCheckin}
              disabled={checkingIn}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
            >
              {checkingIn ? '처리 중...' : '✅ 오늘 출석하기 (+5P)'}
            </Button>
          </div>
        )}

        {streak > 0 && (
          <div className="text-center text-sm text-gray-600">
            🔥 {streak}일 연속 출석 중! 계속 화이팅!
          </div>
        )}
      </div>
    </div>
  )
}


