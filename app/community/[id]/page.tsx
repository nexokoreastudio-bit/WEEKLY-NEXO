import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPostById } from '@/lib/supabase/posts'
import { deletePost } from '@/app/actions/posts'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, MessageSquare, HelpCircle, Lightbulb, ShoppingBag } from 'lucide-react'
import { HtmlContent } from '@/components/html-content'
import { DeletePostButton } from '@/components/community/delete-post-button'
import { Database } from '@/types/database'
import { JsonLd } from '@/components/seo/json-ld'
import styles from '../community.module.css'

const BOARD_TYPE_INFO = {
  free: { label: '자유게시판', icon: MessageSquare },
  qna: { label: 'Q&A', icon: HelpCircle },
  tip: { label: '팁 & 노하우', icon: Lightbulb },
  market: { label: '중고장터', icon: ShoppingBag },
} as const

interface PageProps {
  params: {
    id: string
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const postId = parseInt(params.id)

  if (isNaN(postId)) {
    notFound()
  }

  const post = await getPostById(postId)

  if (!post) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthor = user?.id === post.author_id

  // 관리자 권한 확인
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
    isAdmin = profileData?.role === 'admin'
  }

  const canDelete = isAuthor || isAdmin
  const boardInfo = post.board_type && post.board_type in BOARD_TYPE_INFO 
    ? BOARD_TYPE_INFO[post.board_type as keyof typeof BOARD_TYPE_INFO] 
    : null

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  const currentUrl = `${baseUrl}/community/${post.id}`
  
  // 게시판 타입에 따른 구조화된 데이터
  const getJsonLdData = () => {
    if (post.board_type === 'qna') {
      // Q&A 게시판은 FAQPage 스키마 사용
      return {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: {
          '@type': 'Question',
          name: post.title,
          text: post.content.replace(/<[^>]*>/g, '').substring(0, 200),
          dateCreated: post.created_at,
          author: {
            '@type': 'Person',
            name: post.author?.nickname || '익명',
          },
        },
      }
    } else {
      // 일반 게시판은 Article 스키마 사용
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.content.replace(/<[^>]*>/g, '').substring(0, 200),
        datePublished: post.created_at,
        dateModified: post.updated_at,
        author: {
          '@type': 'Person',
          name: post.author?.nickname || '익명',
        },
        publisher: {
          '@type': 'Organization',
          name: 'NEXO Daily',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': currentUrl,
        },
      }
    }
  }

  return (
    <>
      <JsonLd data={getJsonLdData()} />
      <div className={styles.container}>
        <Link href="/community" className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} />
          목록으로
        </Link>

        <article className={styles.postDetail}>
        <div className={styles.postDetailHeader}>
          <div className={styles.postDetailMeta}>
            {boardInfo && (
              <span className={styles.boardType}>
                {boardInfo.label}
              </span>
            )}
            <span className={styles.author}>
              {post.author?.nickname || '익명'}
            </span>
            <span className={styles.date}>
              {format(new Date(post.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
            </span>
            {post.updated_at !== post.created_at && (
              <span className={styles.updated}>
                (수정됨: {format(new Date(post.updated_at), 'yyyy.MM.dd HH:mm', { locale: ko })})
              </span>
            )}
          </div>
        </div>

        <h1 className={styles.postDetailTitle}>{post.title}</h1>

        {post.images && post.images.length > 0 && (
          <div className={styles.postImages}>
            {post.images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`첨부 이미지 ${index + 1}`}
                className={styles.postImage}
              />
            ))}
          </div>
        )}

        <div className={styles.postDetailContent}>
          <HtmlContent html={post.content} />
        </div>

        <div className={styles.postDetailFooter}>
          <div className={styles.postStats}>
            <span>👍 {post.likes_count}</span>
            <span>💬 {post.comments_count}</span>
          </div>

          {canDelete && (
            <div className={styles.postActions}>
              {isAuthor && (
                <Link href={`/community/${post.id}/edit`} className={styles.editButton}>
                  수정
                </Link>
              )}
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>
      </article>

      {/* 댓글 섹션 (향후 구현) */}
      <div className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>💬 댓글 ({post.comments_count})</h2>
        <p className={styles.commentsComingSoon}>댓글 기능은 곧 추가될 예정입니다.</p>
      </div>
    </div>
    </>
  )
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const postId = parseInt(params.id)
  
  if (isNaN(postId)) {
    return {
      title: '게시글을 찾을 수 없습니다',
      description: '요청하신 게시글을 찾을 수 없습니다.',
    }
  }

  const post = await getPostById(postId)
  
  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다',
      description: '요청하신 게시글을 찾을 수 없습니다.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  const currentUrl = `${baseUrl}/community/${post.id}`
  const boardInfo = post.board_type && post.board_type in BOARD_TYPE_INFO 
    ? BOARD_TYPE_INFO[post.board_type as keyof typeof BOARD_TYPE_INFO] 
    : null
  
  const title = `${post.title} | ${boardInfo?.label || '커뮤니티'} - NEXO Daily`
  const description = post.content.replace(/<[^>]*>/g, '').substring(0, 160) || '넥소 커뮤니티 게시글'
  const imageUrl = post.images && post.images.length > 0 
    ? (post.images[0].startsWith('http') ? post.images[0] : `${baseUrl}${post.images[0]}`)
    : `${baseUrl}/assets/images/og-image.png`

  return {
    title,
    description,
    keywords: [
      '넥소 커뮤니티',
      boardInfo?.label || '커뮤니티',
      '전자칠판',
      '학원 운영',
      '교육 정보',
    ],
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: 'NEXO Daily',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: currentUrl,
    },
  }
}


