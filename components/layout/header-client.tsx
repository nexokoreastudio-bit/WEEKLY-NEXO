'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserButton } from '@/components/auth/user-button'
import { AdminMenu } from '@/components/admin/admin-menu'
import { SearchInput } from './search-input'

export function HeaderClient() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 사용자 권한 확인 (클라이언트 사이드에서 한 번만 실행)
        const { data: profileData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        
        const profile = profileData as { role: string | null } | null
        if (profile && profile.role === 'admin') {
          setIsAdmin(true)
        }
      }
      setLoading(false)
    }

    checkAdmin()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 헤더 */}
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-gray-900">
              NEXO Daily
            </span>
          </Link>

          {/* 검색바 */}
          <SearchInput />

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                홈
              </Link>
              <Link
                href="/news"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                발행호 목록
              </Link>
              <Link
                href="/community"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                커뮤니티
              </Link>
              <Link
                href="/reviews"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                고객 후기
              </Link>
              <Link
                href="/field"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                현장 소식
              </Link>
              <Link
                href="/location"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                오시는 길
              </Link>
              {!loading && isAdmin && (
                <div className="relative">
                  <AdminMenu />
                </div>
              )}
            </nav>
            <UserButton />
          </div>
        </div>

        {/* 하단 네비게이션 (모바일/태블릿) */}
        <div className="lg:hidden border-t border-gray-200">
          <nav className="flex items-center gap-1 overflow-x-auto py-2 px-2">
            <Link
              href="/"
              className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              홈
            </Link>
            <Link
              href="/news"
              className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              발행호 목록
            </Link>
            <Link
              href="/community"
              className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              커뮤니티
            </Link>
            <Link
              href="/reviews"
              className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              고객 후기
            </Link>
            <Link
              href="/field"
              className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              현장 소식
            </Link>
            <Link
              href="/benefits"
              className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              레벨별 혜택
            </Link>
            <Link
              href="/leads/demo"
              className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              상담 신청
            </Link>
            <Link
              href="/location"
              className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              오시는 길
            </Link>
            {!loading && isAdmin && (
              <div className="relative whitespace-nowrap">
                <AdminMenu />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

