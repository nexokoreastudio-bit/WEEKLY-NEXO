'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  type: string
  count: number
}

export function LeadStatsChart() {
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/stats/leads')
        if (response.ok) {
          const result = await response.json()
          const formattedData = [
            { type: '상담 신청', count: result.demo || 0 },
            { type: '견적 요청', count: result.quote || 0 },
          ]
          setData(formattedData)
        }
      } catch (error) {
        console.error('리드 통계 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        데이터를 불러오는 중...
      </div>
    )
  }

  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        데이터가 없습니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="count" fill="#00c4b4" />
      </BarChart>
    </ResponsiveContainer>
  )
}


