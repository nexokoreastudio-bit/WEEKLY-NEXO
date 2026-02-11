/**
 * 댓글 확인 스크립트 - 자동 댓글 식별을 위해 모든 댓글 조회
 * 실행 방법: node scripts/check-comments.js
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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkComments() {
  try {
    console.log('🔍 댓글 확인 중...\n')

    // 모든 댓글 조회 (작성자 정보 포함)
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        author_id,
        content,
        created_at,
        users!comments_author_id_fkey (
          id,
          nickname,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (commentsError) {
      console.error('댓글 조회 실패:', commentsError.message)
      process.exit(1)
    }

    if (!comments || comments.length === 0) {
      console.log('댓글이 없습니다.')
      return
    }

    console.log(`📝 총 ${comments.length}개의 댓글 발견\n`)
    console.log('댓글 목록:')
    console.log('='.repeat(80))

    comments.forEach((comment, index) => {
      const user = comment.users
      console.log(`\n[${index + 1}] 댓글 ID: ${comment.id}`)
      console.log(`    게시글 ID: ${comment.post_id}`)
      console.log(`    작성자: ${user?.nickname || '익명'} (${user?.email || 'N/A'})`)
      console.log(`    작성일: ${comment.created_at}`)
      console.log(`    내용: ${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log(`\n총 ${comments.length}개의 댓글이 있습니다.`)
  } catch (error) {
    console.error('오류 발생:', error.message)
    process.exit(1)
  }
}

checkComments()
