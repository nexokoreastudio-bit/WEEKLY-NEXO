/**
 * 2월 9일 발행호 article의 이미지를 일반 이미지로 변경
 * 
 * 사용법:
 * node scripts/update-feb-9-article-image.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateFeb9ArticleImage() {
  console.log('🔄 2월 9일 발행호 article 이미지 업데이트 시작...\n')

  const editionId = '2026-02-09'
  const newImageUrl = '/assets/images/아이와 엄마가 함께 공부하는 사진.png'
  
  // 먼저 해당 발행호의 article 조회
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, thumbnail_url, edition_id, is_published')
    .eq('edition_id', editionId)
    .order('id', { ascending: true })

  if (fetchError) {
    console.error('❌ article 조회 실패:', fetchError.message)
    process.exit(1)
  }

  if (!articles || articles.length === 0) {
    console.log(`⚠️  ${editionId} 발행호의 article이 없습니다.`)
    return
  }

  console.log(`📋 발견된 article: ${articles.length}개\n`)
  articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`)
    console.log(`   - ID: ${article.id}`)
    console.log(`   - 현재 이미지: ${article.thumbnail_url || '(없음)'}`)
    console.log(`   - 발행 상태: ${article.is_published ? '발행' : '비발행'}`)
    console.log('')
  })

  // 이미지가 null이거나 넥소 로고 이미지인 article 필터링
  const logoImages = [
    '/assets/images/nexo_logo_black.png',
    '/assets/images/nexo_logo.png',
    'nexo_logo',
    'NEXO'
  ]
  
  const needsUpdate = articles.filter(article => {
    // null이거나 로고 이미지인 경우 업데이트
    if (!article.thumbnail_url) return true
    return logoImages.some(logo => 
      article.thumbnail_url.toLowerCase().includes(logo.toLowerCase())
    )
  })
  
  if (needsUpdate.length === 0) {
    console.log('✅ 모든 article이 이미 일반 이미지를 사용하고 있습니다.')
    return
  }

  console.log(`\n🔄 ${needsUpdate.length}개의 article에 이미지 설정 중...\n`)

  // 각 article 업데이트
  let successCount = 0
  let failCount = 0

  for (const article of needsUpdate) {
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        thumbnail_url: newImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id)

    if (updateError) {
      console.error(`❌ article #${article.id} 업데이트 실패:`, updateError.message)
      failCount++
    } else {
      console.log(`✅ article #${article.id} 업데이트 완료: ${article.title}`)
      console.log(`   변경 전: ${article.thumbnail_url || '(없음)'}`)
      console.log(`   변경 후: ${newImageUrl}\n`)
      successCount++
    }
  }

  console.log('='.repeat(50))
  console.log(`✅ 성공: ${successCount}개`)
  if (failCount > 0) {
    console.log(`❌ 실패: ${failCount}개`)
  }
  console.log('='.repeat(50))

  // 최종 확인
  console.log('\n📋 업데이트된 article 확인:')
  const { data: updatedArticles } = await supabase
    .from('articles')
    .select('id, title, thumbnail_url, edition_id, is_published')
    .eq('edition_id', editionId)
    .order('id', { ascending: true })

  if (updatedArticles && updatedArticles.length > 0) {
    updatedArticles.forEach((article, index) => {
      console.log(`${index + 1}. [${article.is_published ? '발행' : '비발행'}] ${article.title}`)
      console.log(`   - 이미지: ${article.thumbnail_url || '(없음)'}`)
    })
  }

  console.log('\n✨ 작업 완료!')
  console.log('💡 페이지를 새로고침하여 변경사항을 확인하세요.')
}

updateFeb9ArticleImage()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
