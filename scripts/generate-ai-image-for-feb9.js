/**
 * 2월 9일 인사이트에 AI 생성 이미지 적용
 * OpenAI DALL-E API 사용
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

if (!openaiApiKey) {
  console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다.')
  console.error('💡 .env.local 파일에 OPENAI_API_KEY를 추가해주세요.')
  console.error('💡 OpenAI API 키는 https://platform.openai.com/api-keys 에서 발급받을 수 있습니다.')
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
    '정시': ['regular admission', 'college application', 'entrance exam'],
    '정책': ['education policy', 'government policy', 'education reform'],
    '학습법': ['learning method', 'study technique', 'education'],
    '상담': ['counseling', 'consultation', 'education'],
    '학원': ['academy', 'tutoring', 'education'],
    '학생': ['student', 'learning', 'education'],
    '대학': ['university', 'college', 'education'],
    '수능': ['exam', 'test', 'education'],
    '서울대': ['Seoul National University', 'prestigious university', 'education'],
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
 * DALL-E를 사용하여 AI 이미지 생성
 */
async function generateAIImage(title, summary) {
  try {
    const keywords = extractKeywords(title, summary)
    
    // 프롬프트 생성: 교육 관련, 전문적이고 현대적인 이미지
    const prompt = `A professional, modern educational scene: ${keywords.join(', ')}. 
    Clean, bright classroom or study environment with students and teachers. 
    Modern technology, interactive displays, books, and learning materials. 
    Warm, inspiring atmosphere. High quality, photorealistic style. 
    Suitable for educational content and parent consultation materials.`
    
    console.log(`  🎨 AI 이미지 생성 중...`)
    console.log(`  프롬프트: ${prompt.substring(0, 100)}...`)
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`  ❌ OpenAI API 에러 (${response.status}):`, errorText)
      return null
    }

    const data = await response.json()
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('  ❌ 이미지 생성 실패: 응답 형식 오류')
      return null
    }

    const imageUrl = data.data[0].url
    console.log(`  ✅ 이미지 생성 완료: ${imageUrl.substring(0, 50)}...`)

    // 이미지 다운로드
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error(`  ❌ 이미지 다운로드 실패 (${imageResponse.status})`)
      return imageUrl // 원본 URL 반환
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)
    
    // Supabase Storage에 업로드
    const fileName = `insights/ai-generated-${Date.now()}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('insights')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('  ❌ Supabase Storage 업로드 실패:', uploadError.message)
      if (uploadError.message?.includes('Bucket not found')) {
        console.error('  💡 Supabase Storage에 "insights" 버킷이 없습니다.')
      }
      // Storage 업로드 실패 시 원본 URL 반환
      console.log('  ⚠️  원본 OpenAI URL 사용:', imageUrl)
      return imageUrl
    }

    const { data: urlData } = supabase.storage
      .from('insights')
      .getPublicUrl(fileName)

    console.log(`  ✅ Storage 업로드 완료: ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (error) {
    console.error('  ❌ AI 이미지 생성 중 오류:', error.message)
    return null
  }
}

async function generateAIImagesForFeb9() {
  console.log('🔄 2월 9일 인사이트에 AI 이미지 생성 및 적용 시작...\n')

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

    const imageUrl = await generateAIImage(insight.title, insight.summary || '')

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
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2초 대기
    }
  }

  // Article도 업데이트 (첫 번째 인사이트의 이미지 사용)
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

generateAIImagesForFeb9()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
