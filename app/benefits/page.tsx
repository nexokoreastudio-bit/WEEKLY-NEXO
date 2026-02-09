import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lock, TrendingUp, Gift, Star, Crown } from 'lucide-react'

type UserRow = Database['public']['Tables']['users']['Row']

export const metadata = {
  title: '레벨별 혜택 안내 | NEXO Daily',
  description: '브론즈, 실버, 골드 레벨별 혜택과 포인트 적립 방법을 확인하세요.',
}

export default async function BenefitsPage() {
  const supabase = await createClient()
  
  // 현재 사용자 정보 가져오기 (선택사항)
  let currentUser: UserRow | null = null
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      currentUser = profile as UserRow
    }
  }

  const levels = [
    {
      id: 'bronze',
      name: '브론즈',
      icon: '🥉',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      pointRange: '0 ~ 499',
      description: 'NEXO Daily의 기본 회원입니다',
      minPoints: 0,
      maxPoints: 499,
      benefits: [
        { text: '일일 뉴스레터 무료 열람', available: true },
        { text: '기본 자료 다운로드', available: true },
        { text: '커뮤니티 게시글 작성', available: true },
        { text: '댓글 작성 및 소통', available: true },
        { text: '일일 출석 포인트 적립', available: true },
        { text: '프리미엄 자료 다운로드', available: false },
        { text: '골드 전용 게시판 접근', available: false },
        { text: '우선 상담 서비스', available: false },
      ],
    },
    {
      id: 'silver',
      name: '실버',
      icon: '🥈',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      pointRange: '500 ~ 999',
      description: '활발한 활동으로 실버 등급을 달성하셨습니다',
      minPoints: 500,
      maxPoints: 999,
      benefits: [
        { text: '브론즈 레벨 모든 혜택', available: true },
        { text: '프리미엄 자료 일부 다운로드', available: true },
        { text: '우선 고객 지원', available: true },
        { text: '이벤트 우선 참여', available: true },
        { text: '골드 전용 게시판 접근', available: false },
        { text: '프리미엄 자료 전체 다운로드', available: false },
        { text: '우선 상담 서비스', available: false },
      ],
    },
    {
      id: 'gold',
      name: '골드',
      icon: '🥇',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pointRange: '1,000+',
      description: '최고 등급! 모든 프리미엄 혜택을 누리세요',
      minPoints: 1000,
      maxPoints: Infinity,
      benefits: [
        { text: '실버 레벨 모든 혜택', available: true },
        { text: '프리미엄 자료 전체 다운로드', available: true },
        { text: '골드 전용 게시판 접근', available: true },
        { text: '우선 상담 서비스', available: true },
        { text: '전자칠판 구매 특별 할인', available: true },
        { text: '신규 콘텐츠 우선 공개', available: true },
        { text: '전문가 상담 예약 우선권', available: true },
        { text: '이벤트 특별 혜택', available: true },
      ],
    },
  ]

  const pointActions = [
    {
      action: '일일 출석',
      points: '+5P',
      description: '매일 첫 방문 시 자동 적립',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      action: '뉴스레터 읽기',
      points: '+10P',
      description: '발행호를 끝까지 읽으면 적립',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      action: '게시글 작성',
      points: '+20P',
      description: '커뮤니티에 게시글 작성',
      icon: <Gift className="w-5 h-5" />,
    },
    {
      action: '댓글 작성',
      points: '+5P',
      description: '게시글에 댓글 작성',
      icon: <Star className="w-5 h-5" />,
    },
    {
      action: '추천인 가입',
      points: '+100P',
      description: '내 추천인 코드로 가입 시',
      icon: <Crown className="w-5 h-5" />,
    },
    {
      action: '자료 다운로드 후기',
      points: '+30P',
      description: '다운로드한 자료에 후기 작성',
      icon: <Gift className="w-5 h-5" />,
    },
  ]

  const currentLevel = currentUser?.level || 'bronze'
  const currentPoints = currentUser?.point || 0

  // 다음 레벨까지 필요한 포인트 계산
  const getNextLevelInfo = () => {
    if (currentLevel === 'bronze') {
      const target = levels.find(l => l.id === 'silver')?.minPoints || 500
      const needed = Math.max(0, target - currentPoints)
      return { level: '실버', needed, current: currentPoints, target }
    } else if (currentLevel === 'silver') {
      const target = levels.find(l => l.id === 'gold')?.minPoints || 1000
      const needed = Math.max(0, target - currentPoints)
      return { level: '골드', needed, current: currentPoints, target }
    }
    return null
  }

  const nextLevelInfo = getNextLevelInfo()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎁 레벨별 혜택 안내
          </h1>
          <p className="text-lg text-gray-600">
            활동 포인트에 따라 레벨이 올라가며 더 많은 혜택을 받을 수 있습니다
          </p>
        </div>

        {/* 현재 레벨 표시 (로그인한 경우) */}
        {currentUser && (
          <Card className="mb-8 border-2 border-nexo-cyan">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">
                  {currentLevel === 'gold' ? '🥇' : currentLevel === 'silver' ? '🥈' : '🥉'}
                </span>
                내 현재 레벨: {currentLevel === 'gold' ? '골드' : currentLevel === 'silver' ? '실버' : '브론즈'}
              </CardTitle>
              <CardDescription>
                현재 포인트: <strong className="text-nexo-cyan">{currentPoints.toLocaleString()}P</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextLevelInfo ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>다음 레벨까지</span>
                      <span className="font-semibold">{nextLevelInfo.needed}P 필요</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-nexo-navy to-nexo-cyan h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((nextLevelInfo.current / nextLevelInfo.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {nextLevelInfo.current}P / {nextLevelInfo.target}P
                    </p>
                  </div>
                  <Link href="/mypage">
                    <Button className="w-full">마이페이지에서 상세 보기</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-lg font-semibold text-yellow-600">
                    🎉 최고 등급 골드 회원입니다!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    모든 프리미엄 혜택을 누리고 계십니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 레벨별 혜택 카드 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {levels.map((level) => {
            const isCurrentLevel = currentUser?.level === level.id
            return (
              <Card
                key={level.id}
                className={`relative ${isCurrentLevel ? 'ring-2 ring-nexo-cyan shadow-lg' : ''}`}
              >
                {isCurrentLevel && (
                  <Badge className="absolute -top-3 right-4 bg-nexo-cyan text-white">
                    현재 레벨
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{level.icon}</span>
                    <div>
                      <CardTitle className="text-2xl">{level.name}</CardTitle>
                      <CardDescription>{level.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${level.color} w-fit`}>
                    {level.pointRange} 포인트
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {level.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {benefit.available ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            benefit.available
                              ? 'text-gray-700'
                              : 'text-gray-400 line-through'
                          }
                        >
                          {benefit.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 포인트 적립 방법 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-nexo-cyan" />
              포인트 적립 방법
            </CardTitle>
            <CardDescription>
              다양한 활동을 통해 포인트를 적립하고 레벨을 올려보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pointActions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-nexo-cyan transition-colors"
                >
                  <div className="text-nexo-cyan">{action.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{action.action}</span>
                      <Badge className="bg-nexo-cyan text-white">{action.points}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 레벨 업 가이드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              레벨 업 가이드
            </CardTitle>
            <CardDescription>
              빠르게 레벨을 올리는 팁을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-semibold mb-1">매일 출석하기</h4>
                  <p className="text-sm text-gray-600">
                    매일 첫 방문 시 자동으로 5포인트가 적립됩니다. 꾸준히 출석하면 한 달에 150포인트를 획득할 수 있습니다!
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-green-50 rounded-lg">
                <div className="text-2xl">📰</div>
                <div>
                  <h4 className="font-semibold mb-1">뉴스레터 읽기</h4>
                  <p className="text-sm text-gray-600">
                    매일 발행되는 뉴스레터를 끝까지 읽으면 10포인트가 적립됩니다. 유익한 정보도 얻고 포인트도 챙기세요!
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl">👥</div>
                <div>
                  <h4 className="font-semibold mb-1">커뮤니티 활동</h4>
                  <p className="text-sm text-gray-600">
                    게시글 작성(+20P), 댓글 작성(+5P)을 통해 활발하게 소통하세요. 다른 회원들과 정보를 공유하면 더 많은 포인트를 얻을 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl">🎁</div>
                <div>
                  <h4 className="font-semibold mb-1">추천인 초대</h4>
                  <p className="text-sm text-gray-600">
                    친구나 동료에게 내 추천인 코드를 공유하세요. 추천인이 가입하면 양쪽 모두 100포인트를 받습니다!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA 버튼 */}
        <div className="mt-12 text-center">
          {currentUser ? (
            <Link href="/mypage">
              <Button size="lg" className="bg-nexo-navy hover:bg-nexo-navy/90">
                마이페이지에서 내 포인트 확인하기
              </Button>
            </Link>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                로그인하면 내 레벨과 포인트를 확인할 수 있습니다
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" className="bg-nexo-navy hover:bg-nexo-navy/90">
                    회원가입
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

