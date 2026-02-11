/**
 * 커뮤니티 게시판에 자동으로 생성된 댓글 삭제 스크립트 (JavaScript 버전)
 * 실행 방법: node scripts/delete-auto-comments.js
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

// 자동 댓글을 작성한 사용자 닉네임 목록 (create-natural-community-posts.ts에서 사용된 닉네임들)
const autoCommentAuthorNicknames = [
  '경험많은원장', '디지털원장', '바쁜학원장', '수학전문가', '활용고수',
  '초보사용자', '만족사용자', '신규사용자', '정책관심', '상담고민',
  '정보수집', '자료활용', '매일체크', '상담전문', '정보공유',
  '해결사', '기술지원', '전문가', '경험많음', '상담전문가',
  '디지털파워', '유연한상담', '비교전문', '친환경원장', '트렌드파악',
  '상황대응', '시각전문', '포인트마스터', '매일방문', '활동많음',
  '출석왕', '댓글러', '절약왕', '수학선생', '기하전문',
  '함수마스터', '실전활용', '시각학습', '수학애호가', '도형전문',
  '수업만족', '그래프전문', '정리왕', '시간절약', '신뢰구축',
  '효율추구', '질문많음', '노하우수집', '고민해결',
]

async function deleteAutoComments() {
  try {
    console.log('🔍 자동 댓글 삭제 시작...\n')

    // 1. 자동 댓글 작성자들의 사용자 ID 찾기
    const { data: autoCommentAuthors, error: userError } = await supabase
      .from('users')
      .select('id, nickname')
      .in('nickname', autoCommentAuthorNicknames)

    if (userError) {
      console.error('사용자 조회 실패:', userError.message)
      process.exit(1)
    }

    if (!autoCommentAuthors || autoCommentAuthors.length === 0) {
      console.log('자동 댓글 작성자를 찾을 수 없습니다.')
      console.log('이미 삭제되었거나 해당 사용자가 존재하지 않습니다.')
      return
    }

    const authorIds = autoCommentAuthors.map(u => u.id)
    console.log(`📋 자동 댓글 작성자 ${autoCommentAuthors.length}명 발견:`)
    autoCommentAuthors.forEach(u => {
      console.log(`  - ${u.nickname} (${u.id})`)
    })
    console.log()

    // 2. 해당 사용자들이 작성한 모든 댓글 조회
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, post_id, author_id, content, created_at')
      .in('author_id', authorIds)

    if (commentsError) {
      console.error('댓글 조회 실패:', commentsError.message)
      process.exit(1)
    }

    if (!comments || comments.length === 0) {
      console.log('삭제할 자동 댓글이 없습니다.')
      return
    }

    console.log(`📝 삭제할 댓글 ${comments.length}개 발견\n`)

    // 3. 댓글 삭제
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .in('author_id', authorIds)

    if (deleteError) {
      console.error('댓글 삭제 실패:', deleteError.message)
      process.exit(1)
    }

    console.log(`✅ ${comments.length}개의 자동 댓글이 삭제되었습니다.`)

    // 4. 게시글의 comments_count 업데이트 (트리거가 자동으로 처리하지만, 확인용)
    console.log('\n📊 게시글 댓글 수 동기화 중...')
    
    // 모든 게시글의 comments_count를 실제 댓글 수로 업데이트
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
