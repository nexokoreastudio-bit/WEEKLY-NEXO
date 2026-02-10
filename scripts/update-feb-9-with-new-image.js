/**
 * 2월 9일 발행호에 새 이미지 적용
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

async function updateFeb9Image() {
  console.log('🔄 2월 9일 발행호 이미지 업데이트 시작...\n')

  const editionId = '2026-02-09'
  const newImageUrl = '/assets/images/feb-9-insight-image.png'

  console.log(`📅 2월 9일 발행호 업데이트:`)
  console.log(`   새 이미지: ${newImageUrl}\n`)

  // 2월 9일 Article 업데이트
  const { data: articles, error: articleError } = await supabase
    .from('articles')
    .select('id, title, thumbnail_url')
    .eq('edition_id', editionId)
    .order('id', { ascending: true })

  if (articleError) {
    console.error('❌ Article 조회 실패:', articleError.message)
  } else if (articles && articles.length > 0) {
    for (const article of articles) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          thumbnail_url: newImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id)

      if (updateError) {
        console.error(`❌ Article #${article.id} 업데이트 실패:`, updateError.message)
      } else {
        console.log(`✅ Article #${article.id} 업데이트 완료: ${article.title}`)
        console.log(`   변경: ${article.thumbnail_url || '(없음)'} → ${newImageUrl}`)
      }
    }
  } else {
    console.log('  (Article 없음)')
  }

  // 2월 9일 Insights 업데이트 (published_at이 2026-02-09이거나 edition_id가 2026-02-09인 것만)
  const { data: allInsights, error: insightError } = await supabase
    .from('insights')
    .select('id, title, thumbnail_url, published_at, edition_id, is_published')
    .or('published_at.gte.2026-02-09T00:00:00Z,published_at.lt.2026-02-10T00:00:00Z,edition_id.eq.2026-02-09')
    .eq('is_published', true)

  if (insightError) {
    console.error('❌ Insight 조회 실패:', insightError.message)
  } else {
    // 날짜 필터링: published_at이 정확히 2026-02-09이거나 edition_id가 2026-02-09인 것만
    const feb9Insights = allInsights?.filter(insight => {
      if (insight.edition_id === '2026-02-09') return true
      if (insight.published_at) {
        const publishedDate = new Date(insight.published_at)
        const year = publishedDate.getUTCFullYear()
        const month = publishedDate.getUTCMonth() + 1
        const day = publishedDate.getUTCDate()
        return year === 2026 && month === 2 && day === 9
      }
      return false
    }) || []

    if (feb9Insights.length > 0) {
      for (const insight of feb9Insights) {
        const { error: updateError } = await supabase
          .from('insights')
          .update({
            thumbnail_url: newImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', insight.id)

        if (updateError) {
          console.error(`❌ Insight #${insight.id} 업데이트 실패:`, updateError.message)
        } else {
          console.log(`✅ Insight #${insight.id} 업데이트 완료: ${insight.title}`)
          console.log(`   변경: ${insight.thumbnail_url || '(없음)'} → ${newImageUrl}`)
        }
      }
    } else {
      console.log('  (발행된 Insight 없음)')
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ 작업 완료!')
  console.log('💡 페이지를 새로고침하여 변경사항을 확인하세요.')
  console.log('='.repeat(60))
}

updateFeb9Image()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
