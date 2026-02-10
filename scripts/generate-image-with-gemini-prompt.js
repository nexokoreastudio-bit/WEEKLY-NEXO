/**
 * Gemini API를 사용하여 이미지 생성 프롬프트를 개선하고
 * Unsplash API로 관련 이미지를 검색하여 적용
 * 2월 9일 인사이트용
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const geminiApiKey = process.env.GEMINI_API_KEY
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

if (!geminiApiKey) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.')
  process.exit(1)
}

if (!unsplashAccessKey) {
  console.error('❌ UNSPLASH_ACCESS_KEY가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Gemini를 사용하여 이미지 검색을 위한 최적의 키워드 생성
 */
async function generateImageKeywordsWithGemini(title, summary) {
  try {
    const prompt = `다음 교육 뉴스 기사의 제목과 요약을 읽고, 관련 이미지를 검색하기 위한 영어 키워드 3-5개를 추천해주세요.

제목: ${title}
요약: ${summary || '없음'}

요구사항:
1. 교육, 학습, 입시, 학원 관련 이미지를 찾을 수 있는 키워드여야 합니다
2. 영어로 작성해주세요
3. 구체적이고 검색하기 좋은 키워드여야 합니다
4. 키워드는 쉼표로 구분하여 나열해주세요
5. 예시: "university admission, college entrance exam, student studying, education consultation, academic success"

응답 형식:
키워드만 쉼표로 구분하여 나열해주세요. 다른 설명은 필요 없습니다.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`  ❌ Gemini API 에러 (${response.status}):`, errorText)
      return null
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const keywordsText = data.candidates[0].content.parts[0].text.trim()
      // 키워드 추출 (쉼표로 구분)
      const keywords = keywordsText
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 5) // 최대 5개
      
      return keywords.length > 0 ? keywords : null
    }

    return null
  } catch (error) {
    console.error('  ❌ Gemini 키워드 생성 실패:', error.message)
    return null
  }
}

/**
 * Unsplash에서 이미지 검색 및 다운로드
 */
async function searchAndDownloadImage(keywords) {
  try {
    const query = keywords.join(' ')
    console.log(`  🔍 Unsplash 검색: "${query}"`)
    
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

    // 첫 번째 이미지 선택
    const imageUrl = searchData.results[0].urls.regular
    const imageId = searchData.results[0].id
    console.log(`  📥 이미지 다운로드 중: ${imageId}`)

    // 이미지 다운로드
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error(`  ❌ 이미지 다운로드 실패 (${imageResponse.status})`)
      return null
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)
    
    // Supabase Storage에 업로드
    const fileName = `insights/gemini-${imageId}-${Date.now()}.jpg`
    
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

    console.log(`  ✅ Storage 업로드 완료: ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (error) {
    console.error('  ❌ 이미지 검색/다운로드 실패:', error.message)
    return null
  }
}

/**
 * Gemini로 키워드 생성 후 Unsplash에서 이미지 검색
 */
async function generateImageWithGeminiPrompt(title, summary) {
  console.log(`  🤖 Gemini로 키워드 생성 중...`)
  
  const keywords = await generateImageKeywordsWithGemini(title, summary)
  
  if (!keywords || keywords.length === 0) {
    console.log('  ⚠️  키워드 생성 실패, 기본 키워드 사용')
    return await searchAndDownloadImage(['education', 'learning', 'student'])
  }

  console.log(`  ✅ 생성된 키워드: ${keywords.join(', ')}`)
  
  return await searchAndDownloadImage(keywords)
}

async function generateImagesForFeb9() {
  console.log('🔄 Gemini API를 활용한 이미지 생성 시작...\n')
  console.log('📋 Gemini로 키워드를 생성하고, Unsplash에서 관련 이미지를 검색합니다.\n')

  const editionId = '2026-02-09'

  // 2월 9일 Insights 조회
  const { data: allInsights, error: insightError } = await supabase
    .from('insights')
    .select('id, title, summary, thumbnail_url, published_at, edition_id, is_published')
    .or('published_at.gte.2026-02-09T00:00:00Z,published_at.lt.2026-02-10T00:00:00Z,edition_id.eq.2026-02-09')
    .eq('is_published', true)

  if (insightError) {
    console.error('❌ Insight 조회 실패:', insightError.message)
    process.exit(1)
  }

  // 날짜 필터링
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

  if (feb9Insights.length === 0) {
    console.log('⚠️  2월 9일자 발행된 인사이트가 없습니다.')
    return
  }

  console.log(`📋 발견된 인사이트: ${feb9Insights.length}개\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < feb9Insights.length; i++) {
    const insight = feb9Insights[i]
    console.log(`[${i + 1}/${feb9Insights.length}] 인사이트 #${insight.id}: ${insight.title}`)
    
    if (!insight.title) {
      console.log('  ⏭️  제목이 없어 건너뜁니다.\n')
      failCount++
      continue
    }

    const imageUrl = await generateImageWithGeminiPrompt(insight.title, insight.summary || '')

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

    // API 제한을 고려하여 지연
    if (i < feb9Insights.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
    }
  }

  // Article도 업데이트
  if (successCount > 0 && feb9Insights.length > 0) {
    const firstInsight = feb9Insights[0]
    if (firstInsight.thumbnail_url) {
      console.log('📰 Article 이미지도 업데이트 중...\n')
      
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title')
        .eq('edition_id', editionId)
        .order('id', { ascending: true })
        .limit(1)

      if (articles && articles.length > 0) {
        const { error: articleUpdateError } = await supabase
          .from('articles')
          .update({
            thumbnail_url: firstInsight.thumbnail_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', articles[0].id)

        if (articleUpdateError) {
          console.error(`❌ Article 업데이트 실패: ${articleUpdateError.message}`)
        } else {
          console.log(`✅ Article #${articles[0].id} 업데이트 완료`)
        }
      }
    }
  }

  console.log('='.repeat(60))
  console.log(`✅ 성공: ${successCount}개`)
  if (failCount > 0) {
    console.log(`❌ 실패: ${failCount}개`)
  }
  console.log('='.repeat(60))
  console.log('\n✨ 작업 완료!')
  console.log('💡 페이지를 새로고침하여 변경사항을 확인하세요.')
}

generateImagesForFeb9()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
