'use client'

import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchInput() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hidden lg:flex flex-1 max-w-md mx-8">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder="찾으시는 콘텐츠를 검색해보세요."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 h-10 border-gray-300 rounded-none focus:border-nexo-navy focus:ring-nexo-navy"
        />
      </div>
    </form>
  )
}
