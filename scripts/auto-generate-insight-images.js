/**
 * 기존 인사이트들에 대해 자동으로 이미지 생성 및 업데이트
 * 
 * 사용법:
 * node scripts/auto-generate-insight-images.js [옵션]
 * 
 * 옵션:
 *   --all: 모든 인사이트 (이미지가 있는 것도 포함)
 *   --missing-only: 이미지가 없는 인사이트만 (기본값)
 *   --unsplash-only: Unsplash URL만 교체
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

if (!unsplashAccessKey) {
  console.error('❌ UNSPLASH_ACCESS_KEY가 설정되지 않았습니다.')
  console.error('💡 .env.local 파일에 UNSPLASH_ACCESS_KEY를 추가해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * 키워드 추출 함수
 */
function extractKeywords(title, summary) {
  const text = `${title} ${summary || ''}`.toLowerCase()
  
  const keywordMap = {
    '입시': ['university admission', 'college entrance', 'education'],
    '정책': ['education policy', 'government policy', 'education reform'],
    '학습법': ['learning method', 'study technique', 'education'],
    '상담': ['counseling', 'consultation', 'education'],
    '학원': ['academy', 'tutoring', 'education'],
    '학생': ['student', 'learning', 'education'],
    '대학': ['university', 'college', 'education'],
    '수능': ['exam', 'test', 'education'],
  }

  const keywords = []
  
  for (const [korean, english] of Object.entries(keywordMap)) {
    if (text.includes(korean)) {
      keywords.push(...english)
    }
  }

  if (keywords.length === 0) {
    keywords.push('education', 'learning', 'student')
  }

  return keywords.slice(0, 3)
}

/**
 * Unsplash에서 이미지 검색 및 다운로드
 */
async function generateInsightImage(title, summary) {
  try {
    const keywords = extractKeywords(title, summary)
    const query = keywords.join(' ') || 'education learning'
    
    console.log(`  🔍 검색 키워드: "${query}"`)
    
    const searchResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashAccessKey}`,
        },
      }
    )

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error(`  ❌ Unsplash API 에러 (${searchResponse.status}):`, errorText)
      return null
    }

    const searchData = await searchResponse.json()
    
    if (!searchData.results || searchData.results.length === 0) {
      console.warn('  ⚠️  관련 이미지를 찾을 수 없습니다.')
      return null
    }

    const imageUrl = searchData.results[0].urls.regular
    const imageId = searchData.results[0].id
    
    // 이미지 다운로드
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error(`  ❌ 이미지 다운로드 실패 (${imageResponse.status})`)
      return null
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)
    
    // Supabase Storage에 업로드
    const fileName = `insights/${imageId}-${Date.now()}.jpg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('insights')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('  ❌ Supabase Storage 업로드 실패:', uploadError.message)
      if (uploadError.message?.includes('Bucket not found')) {
        console.error('  💡 Supabase Storage에 "insights" 버킷이 없습니다.')
      }
      // Storage 업로드 실패 시 원본 URL 반환
      console.log('  ⚠️  원본 Unsplash URL 사용:', imageUrl)
      return imageUrl
    }

    const { data: urlData } = supabase.storage
      .from('insights')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error('  ❌ 이미지 생성 중 오류:', error.message)
    return null
  }
}

async function autoGenerateImages() {
  const args = process.argv.slice(2)
  const allMode = args.includes('--all')
  const unsplashOnly = args.includes('--unsplash-only')
  
  console.log('🔄 인사이트 이미지 자동 생성 시작...\n')
  
  if (allMode) {
    console.log('📋 모드: 모든 인사이트 (이미지가 있는 것도 포함)\n')
  } else if (unsplashOnly) {
    console.log('📋 모드: Unsplash URL만 교체\n')
  } else {
    console.log('📋 모드: 이미지가 없는 인사이트만 (기본값)\n')
  }

  // 인사이트 조회
  let query = supabase
    .from('insights')
    .select('id, title, summary, thumbnail_url, is_published')
    .order('created_at', { ascending: false })

  if (!allMode && !unsplashOnly) {
    // 이미지가 없는 것만
    query = query.is('thumbnail_url', null)
  }

  const { data: insights, error } = await query

  if (error) {
    console.error('❌ 인사이트 조회 실패:', error.message)
    process.exit(1)
  }

  if (!insights || insights.length === 0) {
    console.log('✅ 처리할 인사이트가 없습니다.')
    return
  }

  // 필터링
  let targetInsights = insights
  if (unsplashOnly) {
    targetInsights = insights.filter(i => 
      i.thumbnail_url && i.thumbnail_url.includes('unsplash.com')
    )
  } else if (!allMode) {
    targetInsights = insights.filter(i => !i.thumbnail_url)
  }

  console.log(`📊 총 ${insights.length}개 인사이트 중 ${targetInsights.length}개 처리 예정\n`)

  if (targetInsights.length === 0) {
    console.log('✅ 처리할 인사이트가 없습니다.')
    return
  }

  let successCount = 0
  let failCount = 0
  let skipCount = 0

  for (let i = 0; i < targetInsights.length; i++) {
    const insight = targetInsights[i]
    console.log(`[${i + 1}/${targetInsights.length}] 인사이트 #${insight.id}: ${insight.title}`)
    
    if (!insight.title || (!insight.summary && !insight.title)) {
      console.log('  ⏭️  제목이나 요약이 없어 건너뜁니다.\n')
      skipCount++
      continue
    }

    const imageUrl = await generateInsightImage(insight.title, insight.summary || '')

    if (!imageUrl) {
      console.log('  ❌ 이미지 생성 실패\n')
      failCount++
      continue
    }

    // 데이터베이스 업데이트
    const { error: updateError } = await supabase
      .from('insights')
      .update({
        thumbnail_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', insight.id)

    if (updateError) {
      console.error(`  ❌ 업데이트 실패: ${updateError.message}\n`)
      failCount++
      continue
    }

    console.log(`  ✅ 완료: ${imageUrl}\n`)
    successCount++

    // API 제한을 고려하여 약간의 지연
    if (i < targetInsights.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log('='.repeat(60))
  console.log(`✅ 성공: ${successCount}개`)
  if (failCount > 0) {
    console.log(`❌ 실패: ${failCount}개`)
  }
  if (skipCount > 0) {
    console.log(`⏭️  건너뜀: ${skipCount}개`)
  }
  console.log('='.repeat(60))
  console.log('\n✨ 작업 완료!')
}

autoGenerateImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
