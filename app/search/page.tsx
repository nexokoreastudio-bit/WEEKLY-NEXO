import Link from 'next/link'
import { getInsights } from '@/lib/actions/insights'
import { getAllEditionsWithInfo } from '@/lib/supabase/articles'
import { getPostsByBoardType } from '@/lib/supabase/posts'
import { SafeImage } from '@/components/safe-image'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Calendar, MessageSquare, HelpCircle, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  searchParams: { q?: string }
}

// 날짜 포맷팅 함수
function formatEditionDate(editionId: string | null): string {
  if (!editionId) return '최신호'
  
  try {
    const datePart = editionId.replace(/-insight-\d+$/, '')
    const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!dateMatch) {
      return editionId
    }
    
    const year = parseInt(dateMatch[1], 10)
    const month = parseInt(dateMatch[2], 10)
    const day = parseInt(dateMatch[3], 10)
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return editionId
    }
    
    const date = new Date(Date.UTC(year, month - 1, day))
    const weekday = date.getUTCDay()
    
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    
    return `${year}년 ${months[month - 1]} ${day}일 ${weekdays[weekday]}`
  } catch {
    return editionId
  }
}

// 검색 함수
function searchInText(text: string, query: string): boolean {
  if (!text || !query) return false
  return text.toLowerCase().includes(query.toLowerCase())
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams?.q || ''
  
  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔍 검색</h1>
          <p className="text-gray-600 mb-8">검색어를 입력해주세요.</p>
        </div>
      </div>
    )
  }

  // 모든 데이터 가져오기
  const [allInsights, allEditions, allPosts] = await Promise.all([
    getInsights(),
    getAllEditionsWithInfo(),
    getPostsByBoardType(null, 100, 0) // 최대 100개까지 검색
  ])

  // 인사이트 검색
  const matchedInsights = allInsights.filter(insight => 
    searchInText(insight.title, query) || 
    searchInText(insight.summary || '', query) ||
    searchInText(insight.content || '', query)
  )

  // 발행호 검색
  const matchedEditions = allEditions.filter(edition =>
    searchInText(edition.title, query) ||
    searchInText(edition.subtitle || '', query)
  )

  // 커뮤니티 게시글 검색
  const matchedPosts = allPosts.filter(post =>
    searchInText(post.title, query) ||
    searchInText(post.content, query)
  )

  const totalResults = matchedInsights.length + matchedEditions.length + matchedPosts.length

  const boardTypeLabels: Record<string, { label: string; icon: any }> = {
    free: { label: '자유게시판', icon: MessageSquare },
    qna: { label: 'Q&A', icon: HelpCircle },
    tip: { label: '팁 & 노하우', icon: Lightbulb },
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 검색 결과</h1>
        <p className="text-gray-600 mb-8">
          &quot;<span className="font-semibold text-nexo-navy">{query}</span>&quot;에 대한 검색 결과 {totalResults}개
        </p>

        {totalResults === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg mb-2">검색 결과가 없습니다.</p>
            <p className="text-gray-400 text-sm">다른 검색어로 시도해보세요.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 인사이트 결과 */}
            {matchedInsights.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  💡 인사이트 ({matchedInsights.length})
                </h2>
                <div className="space-y-4">
                  {matchedInsights.map((insight) => (
                    <Link
                      key={insight.id}
                      href={`/news${insight.edition_id ? `/${insight.edition_id}` : ''}#insight-${insight.id}`}
                      className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {insight.thumbnail_url && (
                          <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg bg-gray-100">
                            <SafeImage
                              src={insight.thumbnail_url}
                              alt={insight.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {insight.title}
                          </h3>
                          {insight.summary && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {insight.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(new Date(insight.created_at), 'yyyy년 M월 d일', { locale: ko })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 발행호 결과 */}
            {matchedEditions.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  📰 발행호 ({matchedEditions.length})
                </h2>
                <div className="space-y-4">
                  {matchedEditions.map((edition) => (
                    <Link
                      key={edition.edition_id}
                      href={`/news/${edition.edition_id}`}
                      className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {edition.thumbnail_url && (
                          <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg bg-gray-100">
                            <SafeImage
                              src={edition.thumbnail_url}
                              alt={edition.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 font-normal rounded-none mb-2">
                            {formatEditionDate(edition.edition_id)}
                          </Badge>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {edition.title}
                          </h3>
                          {edition.subtitle && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {edition.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 커뮤니티 게시글 결과 */}
            {matchedPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  💬 커뮤니티 ({matchedPosts.length})
                </h2>
                <div className="space-y-4">
                  {matchedPosts.map((post) => {
                    const boardInfo = post.board_type ? boardTypeLabels[post.board_type] : null
                    const BoardIcon = boardInfo?.icon || MessageSquare
                    
                    return (
                      <Link
                        key={post.id}
                        href={`/community/${post.id}`}
                        className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            {boardInfo && (
                              <>
                                <BoardIcon className="w-4 h-4 text-gray-400" />
                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 font-normal rounded-none">
                                  {boardInfo.label}
                                </Badge>
                              </>
                            )}
                            <span className="text-sm text-gray-500">
                              {post.author?.nickname || '익명'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(post.created_at), 'yyyy.MM.dd', { locale: ko })}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                          {post.content.replace(/<[^>]*>/g, '').length > 150 ? '...' : ''}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>👍 {post.likes_count}</span>
                          <span>💬 {post.comments_count}</span>
                          {post.images && post.images.length > 0 && (
                            <span>📷 {post.images.length}</span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
