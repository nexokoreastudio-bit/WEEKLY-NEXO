/**
 * 커뮤니티 게시판에 자동으로 생성된 댓글 삭제 스크립트 (내용 패턴 기반)
 * 실행 방법: node scripts/delete-auto-comments-by-content.js
 * 
 * create-natural-community-posts.ts에서 생성된 댓글의 내용 패턴을 기반으로 삭제합니다.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// .env.local 파일에서 환경 변수 읽기
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 자동 댓글의 내용 패턴 (create-natural-community-posts.ts에서 사용된 댓글 내용의 일부)
const autoCommentPatterns = [
  '게시글 쓰면 20포인트',
  '댓글 쓰면 5포인트',
  '매일 출석 체크하면',
  '넥소 데일리 매일 발행호',
  '여기 자료실에',
  '전자칠판 화면으로 보여주면',
  '학부모님들도 "와, 이런 자료가 있구나"',
  '인쇄해서 드리는 것도 좋지만, 전자칠판으로',
  '전자칠판 화면이 크니까',
  '인쇄 비용도 아끼고, 환경도 보호하고',
  '학부모님들도 요즘 디지털에 익숙하시니까',
  '저는 중요한 자료는 인쇄해서 드리고',
  '전자칠판 화면으로 보여주면 학부모님들도 집중을 잘 하시더라고요',
  '저도 사용한 지 3개월 됐는데',
  '화면 분할 기능 활용하시면',
  '처음에는 어려울 줄 알았는데 생각보다 쉬워요',
  '학생들 반응이 정말 좋더라고요',
  '저희 학원도 전자칠판 도입한 지 얼마 안 됐는데',
  '정책이 자주 바뀌니까',
  '여기 자료실에 최신 정책 정리된 거 있어서',
  '학부모님들께 설명드릴 때마다',
  '입시 자료실에 있는 최신 정책 가이드',
  '학부모님들께 설명드릴 때 여기 자료 인쇄해서 드리는데',
  '여기 커뮤니티에서 다른 학원장님들 얘기 들어보는 것도',
  '좋은 팁 감사합니다! 저도 수학 문제 풀이할 때',
  '기하 문제 풀 때 도형 그리는 게',
  '함수 그래프 그릴 때 특히 유용하더라고요',
  '학생들이 직접 풀어보게 하고',
  '수학 문제 풀이할 때 전자칠판이 정말 유용해요',
  '기하 문제 풀 때 도형을 그려가면서 설명하니까',
  '저도 같은 방법 쓰고 있어요!',
  '저도 비슷하게 정리하고 있어요!',
  '연도별로 폴더 나누는 게',
  '전자칠판 화면에 바로 띄워서 보여주니까',
  '상담 시간이 확실히 단축되더라고요',
  '학부모님들도 "이런 자료가 있구나" 하시면서',
  '자료 정리하는 게 생각보다 시간이 많이 걸리는데',
  '저도 여기서 많은 도움 받고 있어요!',
  'Q&A 게시판에서 질문하면 친절하게 답변해주시더라고요',
  '팁 게시판에서 활용법 확인하는 게',
  '혼자 고민하지 말고 여기서 물어보는 게',
]

async function deleteAutoComments() {
  try {
    console.log('🔍 자동 댓글 삭제 시작 (내용 패턴 기반)...\n')

    // 1. 모든 댓글 조회
    const { data: allComments, error: commentsError } = await supabase
      .from('comments')
      .select('id, post_id, author_id, content, created_at')

    if (commentsError) {
      console.error('댓글 조회 실패:', commentsError.message)
      process.exit(1)
    }

    if (!allComments || allComments.length === 0) {
      console.log('댓글이 없습니다.')
      return
    }

    console.log(`📝 총 ${allComments.length}개의 댓글 확인\n`)

    // 2. 자동 댓글 패턴과 매칭되는 댓글 찾기
    const autoComments = allComments.filter(comment => {
      return autoCommentPatterns.some(pattern => 
        comment.content.includes(pattern)
      )
    })

    if (autoComments.length === 0) {
      console.log('삭제할 자동 댓글이 없습니다.')
      return
    }

    console.log(`🎯 자동 댓글 ${autoComments.length}개 발견:\n`)
    autoComments.forEach((comment, index) => {
      console.log(`[${index + 1}] 댓글 ID: ${comment.id}`)
      console.log(`    게시글 ID: ${comment.post_id}`)
      console.log(`    내용: ${comment.content.substring(0, 80)}...`)
      console.log()
    })

    // 3. 확인 후 삭제
    const commentIds = autoComments.map(c => c.id)
    
    console.log(`⚠️  ${commentIds.length}개의 댓글을 삭제합니다...\n`)

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .in('id', commentIds)

    if (deleteError) {
      console.error('댓글 삭제 실패:', deleteError.message)
      process.exit(1)
    }

    console.log(`✅ ${commentIds.length}개의 자동 댓글이 삭제되었습니다.`)

    // 4. 게시글의 comments_count 업데이트
    console.log('\n📊 게시글 댓글 수 동기화 중...')
    
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')

    if (postsError) {
      console.error('게시글 조회 실패:', postsError.message)
    } else if (posts) {
      let updatedCount = 0
      for (const post of posts) {
        const { count: actualCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)

        await supabase
          .from('posts')
          .update({ comments_count: actualCount || 0 })
          .eq('id', post.id)

        updatedCount++
      }
      console.log(`✅ ${updatedCount}개 게시글의 댓글 수가 동기화되었습니다.`)
    }

    console.log('\n✨ 자동 댓글 삭제가 완료되었습니다!')
  } catch (error) {
    console.error('오류 발생:', error.message)
    process.exit(1)
  }
}

// 스크립트 실행
deleteAutoComments()
