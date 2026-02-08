import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubscriberVerification } from '@/components/mypage/subscriber-verification'
import { DiscountBadge } from '@/components/mypage/discount-badge'
import { ReferralSection } from '@/components/mypage/referral-section'
import { DailyCheckin } from '@/components/mypage/daily-checkin'
import { Database } from '@/types/database'
import styles from './mypage.module.css'

type UserRow = Database['public']['Tables']['users']['Row']

export default async function MyPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 사용자 프로필 정보 가져오기
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('프로필 조회 실패:', profileError)
  }

  const userProfile: UserRow = (profile as UserRow | null) || ({
    id: user.id,
    email: user.email || null,
    nickname: null,
    subscriber_verified: false,
    purchase_serial_number: null,
    verified_at: null,
    point: 0,
    level: 'bronze' as const,
    academy_name: null,
    role: null,
    avatar_url: null,
    referrer_code: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as UserRow)

  return (
    <div className={styles.mypageContainer}>
      <div className={styles.mypageHeader}>
        <h1>👤 마이페이지</h1>
        <p className={styles.subtitle}>구독자 전용 페이지입니다</p>
      </div>

      {/* 구독자 인증 할인 배지 */}
      <DiscountBadge 
        isVerified={userProfile.subscriber_verified}
        verifiedAt={userProfile.verified_at}
      />

      {/* 구독자 인증 섹션 */}
      {!userProfile.subscriber_verified && (
        <SubscriberVerification userId={user.id} />
      )}

      {/* 일일 출석 */}
      <DailyCheckin />

      {/* 추천인 시스템 */}
      <ReferralSection userId={user.id} />

      {/* 사용자 정보 */}
      <div className={styles.section}>
        <h2>📋 내 정보</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>이메일</span>
            <span className={styles.infoValue}>{userProfile.email || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>닉네임</span>
            <span className={styles.infoValue}>{userProfile.nickname || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>학원명</span>
            <span className={styles.infoValue}>{userProfile.academy_name || '-'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>포인트</span>
            <span className={styles.infoValue}>{userProfile.point || 0}점</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>레벨</span>
            <span className={styles.infoValue}>
              {userProfile.level === 'gold' ? '🥇 골드' : 
               userProfile.level === 'silver' ? '🥈 실버' : 
               '🥉 브론즈'}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>가입일</span>
            <span className={styles.infoValue}>
              {userProfile.created_at 
                ? new Date(userProfile.created_at).toLocaleDateString('ko-KR')
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 구독자 인증 정보 (인증된 경우) */}
      {userProfile.subscriber_verified && (
        <div className={styles.section}>
          <h2>✅ 구독자 인증 정보</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>인증 상태</span>
              <span className={`${styles.infoValue} ${styles.verified}`}>
                ✅ 인증 완료
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>인증 일시</span>
              <span className={styles.infoValue}>
                {userProfile.verified_at
                  ? new Date(userProfile.verified_at).toLocaleString('ko-KR')
                  : '-'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>구매 시리얼 번호</span>
              <span className={styles.infoValue}>
                {userProfile.purchase_serial_number 
                  ? `${userProfile.purchase_serial_number.substring(0, 4)}-****-****`
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

