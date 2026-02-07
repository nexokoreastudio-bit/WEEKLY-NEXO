import Link from 'next/link'
import { UserButton } from '@/components/auth/user-button'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 관리자 권한 확인
  let isAdmin = false
  if (user) {
    try {
      const { data: profileData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const profile = profileData as Pick<UserRow, 'role'> | null
      
      if (error) {
        console.error('사용자 프로필 조회 실패:', error)
      } else {
        isAdmin = profile?.role === 'admin'
        // 디버깅용 로그 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
          console.log('관리자 권한 확인:', { userId: user.id, role: profile?.role, isAdmin })
        }
      }
    } catch (error) {
      console.error('관리자 권한 확인 오류:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold font-serif text-nexo-navy">
              NEXO Daily
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              홈
            </Link>
            <Link
              href="/news"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              발행호 목록
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              커뮤니티
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              자료실
            </Link>
            <Link
              href="/field"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              현장 소식
            </Link>
            <Link
              href="/mypage"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              마이페이지
            </Link>
            {isAdmin && (
              <Link
                href="/admin/field-news"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                관리자
              </Link>
            )}
          </nav>
        </div>
        <UserButton />
      </div>
    </header>
  )
}

