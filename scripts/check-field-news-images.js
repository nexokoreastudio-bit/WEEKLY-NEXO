/**
 * 현장 소식의 이미지 포함 여부 확인 스크립트
 * 실행: node scripts/check-field-news-images.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkFieldNewsImages() {
  console.log('📸 현장 소식 이미지 확인 중...\n')

  const { data: fieldNews, error } = await supabase
    .from('field_news')
    .select('id, title, content, images, is_published')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ 조회 실패:', error.message)
    return
  }

  if (!fieldNews || fieldNews.length === 0) {
    console.log('현장 소식이 없습니다.')
    return
  }

  fieldNews.forEach((news) => {
    console.log(`\n📰 ID: ${news.id} | 제목: ${news.title.substring(0, 50)}...`)
    console.log(`   발행 여부: ${news.is_published ? '✅ 발행됨' : '❌ 임시저장'}`)
    
    // content에 이미지 태그가 있는지 확인
    const hasImgTag = news.content?.includes('<img')
    console.log(`   Content에 <img> 태그: ${hasImgTag ? '✅ 있음' : '❌ 없음'}`)
    
    if (hasImgTag) {
      // 이미지 src 추출
      const imgMatches = news.content.match(/<img[^>]+src=["']([^"']+)["']/gi)
      if (imgMatches) {
        console.log(`   발견된 이미지 태그 수: ${imgMatches.length}`)
        imgMatches.forEach((match, index) => {
          const srcMatch = match.match(/src=["']([^"']+)["']/i)
          if (srcMatch) {
            const src = srcMatch[1]
            const isBase64 = src.startsWith('data:image')
            const isStorageUrl = src.includes('supabase.co') || src.includes('storage')
            console.log(`   이미지 ${index + 1}: ${isBase64 ? '📦 base64' : isStorageUrl ? '☁️ Storage URL' : '🔗 외부 URL'}`)
            console.log(`      ${src.substring(0, 100)}${src.length > 100 ? '...' : ''}`)
          }
        })
      }
    }
    
    // images 배열 확인
    if (news.images && Array.isArray(news.images) && news.images.length > 0) {
      console.log(`   images 배열: ✅ ${news.images.length}개`)
      news.images.forEach((img, index) => {
        console.log(`      ${index + 1}. ${img.substring(0, 100)}${img.length > 100 ? '...' : ''}`)
      })
    } else {
      console.log(`   images 배열: ❌ 없음 또는 비어있음`)
    }
    
    // content 길이
    console.log(`   Content 길이: ${news.content?.length || 0}자`)
  })
}

checkFieldNewsImages()
  .then(() => {
    console.log('\n✅ 확인 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 오류:', error)
    process.exit(1)
  })
