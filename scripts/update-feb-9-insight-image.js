/**
 * 2월 9일 인사이트에 이미지 추가 스크립트
 * 
 * 사용법:
 * node scripts/update-feb-9-insight-image.js
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

async function updateFeb9InsightImage() {
  console.log('🔄 2월 9일 인사이트 이미지 업데이트 시작...\n')

  const imageUrl = '/assets/images/아이와 엄마가 함께 공부하는 사진.png'
  
  // 먼저 해당 날짜의 인사이트 조회
  const { data: insights, error: fetchError } = await supabase
    .from('insights')
    .select('id, title, thumbnail_url, published_at, edition_id, is_published')
    .or('published_at.gte.2026-02-09T00:00:00Z,published_at.lt.2026-02-10T00:00:00Z,edition_id.eq.2026-02-09')
    .eq('is_published', true)

  if (fetchError) {
    console.error('❌ 인사이트 조회 실패:', fetchError.message)
    process.exit(1)
  }

  if (!insights || insights.length === 0) {
    console.log('⚠️  2월 9일자 발행된 인사이트가 없습니다.')
    console.log('💡 인사이트를 먼저 생성하거나 발행해주세요.')
    return
  }

  console.log(`📋 발견된 인사이트: ${insights.length}개\n`)
  insights.forEach((insight, index) => {
    console.log(`${index + 1}. ${insight.title}`)
    console.log(`   - ID: ${insight.id}`)
    console.log(`   - 현재 이미지: ${insight.thumbnail_url || '(없음)'}`)
    console.log(`   - 발행일: ${insight.published_at || 'N/A'}`)
    console.log(`   - 발행호 ID: ${insight.edition_id || 'N/A'}\n`)
  })

  // 이미지가 이미 설정된 인사이트 필터링
  const needsUpdate = insights.filter(i => i.thumbnail_url !== imageUrl)
  
  if (needsUpdate.length === 0) {
    console.log('✅ 모든 인사이트에 이미 이미지가 설정되어 있습니다.')
    return
  }

  console.log(`\n🔄 ${needsUpdate.length}개의 인사이트에 이미지 추가 중...\n`)

  // 각 인사이트 업데이트
  let successCount = 0
  let failCount = 0

  for (const insight of needsUpdate) {
    const { error: updateError } = await supabase
      .from('insights')
      .update({
        thumbnail_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', insight.id)

    if (updateError) {
      console.error(`❌ 인사이트 #${insight.id} 업데이트 실패:`, updateError.message)
      failCount++
    } else {
      console.log(`✅ 인사이트 #${insight.id} 업데이트 완료: ${insight.title}`)
      successCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ 성공: ${successCount}개`)
  if (failCount > 0) {
    console.log(`❌ 실패: ${failCount}개`)
  }
  console.log('='.repeat(50))

  // 최종 확인
  console.log('\n📋 업데이트된 인사이트 확인:')
  const { data: updatedInsights } = await supabase
    .from('insights')
    .select('id, title, thumbnail_url, published_at, edition_id')
    .or('published_at.gte.2026-02-09T00:00:00Z,published_at.lt.2026-02-10T00:00:00Z,edition_id.eq.2026-02-09')
    .eq('is_published', true)
    .eq('thumbnail_url', imageUrl)

  if (updatedInsights && updatedInsights.length > 0) {
    updatedInsights.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight.title} - 이미지: ${insight.thumbnail_url}`)
    })
  }

  console.log('\n✨ 작업 완료!')
}

updateFeb9InsightImage()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
