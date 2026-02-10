/**
 * 2월 10일 발행호의 article과 insight 데이터 확인
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFeb10Data() {
  const editionId = '2026-02-10'
  
  console.log('='.repeat(60))
  console.log(`📋 ${editionId} 발행호 데이터 확인\n`)
  
  // Articles 확인
  console.log('📰 Articles:')
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, thumbnail_url, edition_id, is_published')
    .eq('edition_id', editionId)
    .order('id', { ascending: true })
  
  if (articles && articles.length > 0) {
    articles.forEach((article, index) => {
      console.log(`  ${index + 1}. [${article.is_published ? '발행' : '비발행'}] ${article.title}`)
      console.log(`     ID: ${article.id}`)
      console.log(`     이미지: ${article.thumbnail_url || '(없음)'}`)
      console.log('')
    })
  } else {
    console.log('  (없음)\n')
  }
  
  // Insights 확인
  console.log('💡 Insights:')
  const { data: insights } = await supabase
    .from('insights')
    .select('id, title, thumbnail_url, published_at, edition_id, is_published')
    .or(`published_at.gte.2026-02-10T00:00:00Z,published_at.lt.2026-02-11T00:00:00Z,edition_id.eq.${editionId}`)
    .order('published_at', { ascending: false })
  
  if (insights && insights.length > 0) {
    insights.forEach((insight, index) => {
      console.log(`  ${index + 1}. [${insight.is_published ? '발행' : '비발행'}] ${insight.title}`)
      console.log(`     ID: ${insight.id}`)
      console.log(`     이미지: ${insight.thumbnail_url || '(없음)'}`)
      console.log(`     발행일: ${insight.published_at || 'N/A'}`)
      console.log(`     발행호 ID: ${insight.edition_id || 'N/A'}`)
      console.log('')
    })
  } else {
    console.log('  (없음)\n')
  }
  
  console.log('='.repeat(60))
}

checkFeb10Data()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류:', error)
    process.exit(1)
  })
