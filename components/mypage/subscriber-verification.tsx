'use client'

import { useState, useEffect } from 'react'
import { requestSubscriberVerification, getSubscriberStatus } from '@/app/actions/subscriber'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Send, RefreshCw } from 'lucide-react'

interface SubscriberVerificationProps {
  userId: string
}

/**
 * 구독자 인증 컴포넌트
 * 관리자에게 구독자 인증 요청을 보냅니다
 */
export function SubscriberVerification({ userId }: SubscriberVerificationProps) {
  const [status, setStatus] = useState<{
    verified: boolean
    requestPending: boolean
    requestedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadStatus = async () => {
    try {
      const result = await getSubscriberStatus(userId)
      const newStatus = {
        verified: result.verified || false,
        requestPending: result.requestPending || false,
        requestedAt: result.requestedAt || null,
      }
      
      setStatus(prevStatus => {
        const wasVerified = prevStatus?.verified || false
        
        // 인증 완료 시 자동 새로고침
        if (newStatus.verified && !wasVerified) {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
        
        return newStatus
      })
    } catch (error) {
      console.error('구독자 상태 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // 요청 대기 중일 때 주기적으로 상태 확인
  useEffect(() => {
    if (!status?.requestPending || status?.verified) {
      return
    }

    const intervalId = setInterval(() => {
      loadStatus()
    }, 30000) // 30초마다 확인

    return () => {
      clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.requestPending, status?.verified])

  const handleRequest = async () => {
    if (!confirm('구독자 인증을 요청하시겠습니까? 관리자 승인 후 10% 할인 혜택이 적용됩니다.')) {
      return
    }

    setRequesting(true)
    setMessage(null)

    try {
      const result = await requestSubscriberVerification(userId)
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: '✅ 구독자 인증 요청이 접수되었습니다. 관리자 승인을 기다려주세요.' 
        })
        // 상태 새로고침
        await loadStatus()
      } else {
        setMessage({ type: 'error', text: result.error || '인증 요청에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '오류가 발생했습니다. 다시 시도해주세요.' })
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
        <p className="text-sm text-gray-600">구독자 인증 정보를 불러오는 중...</p>
      </div>
    )
  }

  // 이미 인증된 경우
  if (status?.verified) {
    return (
      <div className="bg-white border-2 border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">
            구독자 인증 완료
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          ✅ 구독자 인증이 완료되었습니다. <strong className="text-nexo-cyan">10% 할인</strong> 혜택이 적용됩니다.
        </p>
      </div>
    )
  }

  // 요청 대기 중인 경우
  if (status?.requestPending) {
    const requestedDate = status.requestedAt 
      ? new Date(status.requestedAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

    return (
      <div className="bg-white border-2 border-orange-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">
            구독자 인증 요청 대기 중
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          구독자 인증 요청이 접수되었습니다. 관리자 승인을 기다려주세요.
        </p>
        {requestedDate && (
          <p className="text-xs text-gray-500">
            요청일시: {requestedDate}
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={loadStatus}
            disabled={loading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                확인 중...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                상태 새로고침
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 승인 완료 시 자동으로 업데이트됩니다. (30초마다 자동 확인)
        </p>
      </div>
    )
  }

  // 요청 가능한 경우
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🔐 구독자 인증
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        구독자 인증을 요청하시면 관리자가 확인 후 승인해드립니다.
        인증 완료 시 <strong className="text-nexo-cyan">10% 할인</strong> 혜택이 적용됩니다.
      </p>

      {message && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <Button
        onClick={handleRequest}
        disabled={requesting}
        className="w-full bg-nexo-navy hover:bg-nexo-cyan text-white"
      >
        {requesting ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            요청 중...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            구독자 인증 요청하기
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 요청 후 관리자가 확인하여 승인해드립니다.
      </p>
    </div>
  )
}


