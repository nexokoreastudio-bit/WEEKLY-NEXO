/**
 * 2월 9일과 10일 발행호에 서로 다른 이미지 할당
 * 
 * 사용법:
 * node scripts/update-feb-9-10-different-images.js
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

async function updateDifferentImages() {
  console.log('🔄 2월 9일과 10일 발행호에 서로 다른 이미지 할당 시작...\n')

  // 2월 9일: nexo-classroom.png 사용
  // 2월 10일: 아이와 엄마가 함께 공부하는 사진.png 사용 (현재 사용 중)
  const feb9Image = '/assets/images/nexo-classroom.png'
  const feb10Image = '/assets/images/아이와 엄마가 함께 공부하는 사진.png'

  console.log('📅 2월 9일 발행호 업데이트:')
  console.log(`   이미지: ${feb9Image}\n`)

  // 2월 9일 Article 업데이트
  const { data: feb9Articles, error: feb9ArticleError } = await supabase
    .from('articles')
    .select('id, title, thumbnail_url')
    .eq('edition_id', '2026-02-09')
    .order('id', { ascending: true })

  if (feb9ArticleError) {
    console.error('❌ 2월 9일 article 조회 실패:', feb9ArticleError.message)
  } else if (feb9Articles && feb9Articles.length > 0) {
    for (const article of feb9Articles) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          thumbnail_url: feb9Image,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id)

      if (updateError) {
        console.error(`❌ Article #${article.id} 업데이트 실패:`, updateError.message)
      } else {
        console.log(`✅ Article #${article.id} 업데이트 완료: ${article.title}`)
        console.log(`   변경: ${article.thumbnail_url || '(없음)'} → ${feb9Image}`)
      }
    }
  } else {
    console.log('  (Article 없음)')
  }

  // 2월 9일 Insights 업데이트 (published_at이 2026-02-09이거나 edition_id가 2026-02-09인 것만)
  const { data: allFeb9Insights, error: feb9InsightError } = await supabase
    .from('insights')
    .select('id, title, thumbnail_url, published_at, edition_id, is_published')
    .or('published_at.gte.2026-02-09T00:00:00Z,published_at.lt.2026-02-10T00:00:00Z,edition_id.eq.2026-02-09')
    .eq('is_published', true)
  
  // 날짜 필터링: published_at이 정확히 2026-02-09이거나 edition_id가 2026-02-09인 것만
  const feb9Insights = allFeb9Insights?.filter(insight => {
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

  if (feb9InsightError) {
    console.error('❌ 2월 9일 insight 조회 실패:', feb9InsightError.message)
  } else if (feb9Insights && feb9Insights.length > 0) {
    for (const insight of feb9Insights) {
      const { error: updateError } = await supabase
        .from('insights')
        .update({
          thumbnail_url: feb9Image,
          updated_at: new Date().toISOString()
        })
        .eq('id', insight.id)

      if (updateError) {
        console.error(`❌ Insight #${insight.id} 업데이트 실패:`, updateError.message)
      } else {
        console.log(`✅ Insight #${insight.id} 업데이트 완료: ${insight.title}`)
        console.log(`   변경: ${insight.thumbnail_url || '(없음)'} → ${feb9Image}`)
      }
    }
  } else {
    console.log('  (발행된 Insight 없음)')
  }

  console.log('\n📅 2월 10일 발행호 업데이트:')
  console.log(`   이미지: ${feb10Image}\n`)

  // 2월 10일 Article 업데이트 (없을 수 있음)
  const { data: feb10Articles, error: feb10ArticleError } = await supabase
    .from('articles')
    .select('id, title, thumbnail_url')
    .eq('edition_id', '2026-02-10')
    .order('id', { ascending: true })

  if (feb10ArticleError) {
    console.error('❌ 2월 10일 article 조회 실패:', feb10ArticleError.message)
  } else if (feb10Articles && feb10Articles.length > 0) {
    for (const article of feb10Articles) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          thumbnail_url: feb10Image,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id)

      if (updateError) {
        console.error(`❌ Article #${article.id} 업데이트 실패:`, updateError.message)
      } else {
        console.log(`✅ Article #${article.id} 업데이트 완료: ${article.title}`)
        console.log(`   변경: ${article.thumbnail_url || '(없음)'} → ${feb10Image}`)
      }
    }
  } else {
    console.log('  (Article 없음)')
  }

  // 2월 10일 Insights 업데이트 (published_at이 2026-02-10이거나 edition_id가 2026-02-10인 것만)
  const { data: allFeb10Insights, error: feb10InsightError } = await supabase
    .from('insights')
    .select('id, title, thumbnail_url, published_at, edition_id, is_published')
    .or('published_at.gte.2026-02-10T00:00:00Z,published_at.lt.2026-02-11T00:00:00Z,edition_id.eq.2026-02-10')
    .eq('is_published', true)
  
  // 날짜 필터링: published_at이 정확히 2026-02-10이거나 edition_id가 2026-02-10인 것만
  const feb10Insights = allFeb10Insights?.filter(insight => {
    if (insight.edition_id === '2026-02-10') return true
    if (insight.published_at) {
      const publishedDate = new Date(insight.published_at)
      const year = publishedDate.getUTCFullYear()
      const month = publishedDate.getUTCMonth() + 1
      const day = publishedDate.getUTCDate()
      return year === 2026 && month === 2 && day === 10
    }
    return false
  }) || []

  if (feb10InsightError) {
    console.error('❌ 2월 10일 insight 조회 실패:', feb10InsightError.message)
  } else if (feb10Insights && feb10Insights.length > 0) {
    for (const insight of feb10Insights) {
      // 이미 올바른 이미지가 설정되어 있으면 건너뛰기
      if (insight.thumbnail_url === feb10Image) {
        console.log(`⏭️  Insight #${insight.id} 이미 올바른 이미지 사용 중: ${insight.title}`)
        continue
      }

      const { error: updateError } = await supabase
        .from('insights')
        .update({
          thumbnail_url: feb10Image,
          updated_at: new Date().toISOString()
        })
        .eq('id', insight.id)

      if (updateError) {
        console.error(`❌ Insight #${insight.id} 업데이트 실패:`, updateError.message)
      } else {
        console.log(`✅ Insight #${insight.id} 업데이트 완료: ${insight.title}`)
        console.log(`   변경: ${insight.thumbnail_url || '(없음)'} → ${feb10Image}`)
      }
    }
  } else {
    console.log('  (발행된 Insight 없음)')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ 작업 완료!')
  console.log('💡 페이지를 새로고침하여 변경사항을 확인하세요.')
  console.log('='.repeat(60))
}

updateDifferentImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
