/**
 * 예약 발행된 article 확인 스크립트
 * node scripts/check-scheduled-articles.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  console.error('   .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkScheduledArticles() {
  console.log('🔍 예약 발행된 article 확인 중...\n')

  const now = new Date().toISOString()
  console.log(`현재 시간: ${now}\n`)

  // 예약 발행된 article 조회
  const { data: scheduledArticles, error } = await supabase
    .from('articles')
    .select('id, edition_id, title, published_at, is_published, created_at')
    .eq('is_published', false)
    .not('published_at', 'is', null)
    .not('edition_id', 'is', null)
    .order('published_at', { ascending: true })

  if (error) {
    console.error('❌ 조회 실패:', error)
    process.exit(1)
  }

  if (!scheduledArticles || scheduledArticles.length === 0) {
    console.log('✅ 예약 발행된 article이 없습니다.\n')
    return
  }

  console.log(`📋 예약 발행된 article ${scheduledArticles.length}개 발견:\n`)

  scheduledArticles.forEach((article, index) => {
    const publishedAt = new Date(article.published_at)
    const nowDate = new Date(now)
    const isPast = publishedAt <= nowDate
    const status = isPast ? '🟢 발행 가능' : '🟡 대기 중'

    console.log(`${index + 1}. ${status}`)
    console.log(`   Edition ID: ${article.edition_id}`)
    console.log(`   제목: ${article.title}`)
    console.log(`   발행 예정일: ${article.published_at}`)
    console.log(`   생성일: ${article.created_at}`)
    console.log(`   현재 상태: is_published = ${article.is_published}`)
    console.log('')
  })

  // 발행 가능한 article 확인
  const publishableArticles = scheduledArticles.filter(
    article => new Date(article.published_at) <= new Date(now)
  )

  if (publishableArticles.length > 0) {
    console.log(`\n⚠️  발행 가능한 article ${publishableArticles.length}개 발견:`)
    publishableArticles.forEach(article => {
      console.log(`   - ${article.edition_id}: ${article.title}`)
    })
    console.log('\n💡 이 article들은 자동 발행되어야 하지만 아직 발행되지 않았습니다.')
    console.log('   메인 페이지를 새로고침하면 자동으로 발행됩니다.')
  } else {
    console.log('\n✅ 모든 예약 발행 article이 아직 발행 시간이 되지 않았습니다.')
  }
}

checkScheduledArticles()
  .then(() => {
    console.log('\n✅ 확인 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
