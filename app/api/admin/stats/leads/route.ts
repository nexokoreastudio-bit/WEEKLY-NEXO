import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']

export async function GET() {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 리드 통계
    const [demoResult, quoteResult] = await Promise.all([
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'demo'),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'quote'),
    ])

    return NextResponse.json({
      demo: demoResult.count || 0,
      quote: quoteResult.count || 0,
    })
  } catch (error: any) {
    console.error('리드 통계 데이터 조회 오류:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}


