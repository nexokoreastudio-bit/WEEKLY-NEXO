'use client'

import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

interface DataPoint {
  name: string
  value: number
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export function ReviewRatingChart() {
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/stats/review-ratings')
        if (response.ok) {
          const result = await response.json()
          const formattedData = Object.entries(result.data || {}).map(
            ([rating, count]) => ({
              name: `${rating}점`,
              value: count as number,
            })
          )
          setData(formattedData)
        }
      } catch (error) {
        console.error('후기 평점 데이터 로드 실패:', error)
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

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        데이터가 없습니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${((percent || 0) * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}


