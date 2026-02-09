'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

/**
 * Unsplash API를 사용하여 인사이트와 관련된 이미지 검색 및 다운로드
 */
async function generateInsightImage(title: string, summary: string): Promise<string | null> {
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY
  
  if (!unsplashAccessKey) {
    console.warn('⚠️ UNSPLASH_ACCESS_KEY가 설정되지 않았습니다. 이미지 생성을 건너뜁니다.')
    console.warn('💡 .env.local 파일에 UNSPLASH_ACCESS_KEY를 추가해주세요.')
    return null
  }

  try {
    // 검색 키워드 생성 (제목에서 주요 키워드 추출)
    const keywords = extractKeywords(title, summary)
    const query = keywords.join(' ') || 'education learning'
    
    console.log(`🔍 Unsplash 이미지 검색 중: "${query}"`)
    
    // Unsplash API로 이미지 검색
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
      console.error(`❌ Unsplash API 에러 (${searchResponse.status}):`, errorText)
      return null
    }

    const searchData = await searchResponse.json()
    
    if (!searchData.results || searchData.results.length === 0) {
      console.warn('⚠️ Unsplash에서 관련 이미지를 찾을 수 없습니다.')
      return null
    }

    // 첫 번째 이미지 선택
    const imageUrl = searchData.results[0].urls.regular
    const imageId = searchData.results[0].id
    console.log(`📥 이미지 다운로드 중: ${imageId}`)

    // 이미지 다운로드
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error(`❌ 이미지 다운로드 실패 (${imageResponse.status})`)
      return null
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Supabase Storage에 업로드
    const supabase = await createClient()
    const fileName = `insights/${imageId}-${Date.now()}.jpg`
    
    // Node.js 환경에서는 Buffer를 사용
    const buffer = Buffer.from(imageBuffer)
    
    console.log(`📤 Supabase Storage에 업로드 중: ${fileName}`)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('insights')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ Supabase Storage 업로드 실패:', uploadError.message)
      if (uploadError.message?.includes('Bucket not found')) {
        console.error('💡 Supabase Storage에 "insights" 버킷이 없습니다. Supabase 대시보드에서 버킷을 생성해주세요.')
      }
      // Storage 업로드 실패 시 원본 URL 반환
      console.log('⚠️ 원본 Unsplash URL 사용:', imageUrl)
      return imageUrl
    }

    // 공개 URL 생성 (Supabase v2에서는 직접 publicUrl 속성 반환)
    const { data: urlData } = supabase.storage
      .from('insights')
      .getPublicUrl(fileName)

    console.log('✅ 이미지 업로드 완료:', urlData.publicUrl)
    return urlData.publicUrl
  } catch (error) {
    console.error('❌ 이미지 생성 중 오류:', error)
    if (error instanceof Error) {
      console.error('에러 상세:', error.message, error.stack)
    }
    return null
  }
}

/**
 * 제목과 요약에서 주요 키워드 추출
 */
function extractKeywords(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase()
  
  // 교육 관련 키워드 매핑
  const keywordMap: { [key: string]: string[] } = {
    '입시': ['university admission', 'college entrance', 'education'],
    '정책': ['education policy', 'government policy', 'education reform'],
    '학습법': ['learning method', 'study technique', 'education'],
    '상담': ['counseling', 'consultation', 'education'],
    '학원': ['academy', 'tutoring', 'education'],
    '학생': ['student', 'learning', 'education'],
    '대학': ['university', 'college', 'education'],
    '수능': ['exam', 'test', 'education'],
  }

  const keywords: string[] = []
  
  // 키워드 매핑에서 매칭되는 키워드 찾기
  for (const [korean, english] of Object.entries(keywordMap)) {
    if (text.includes(korean)) {
      keywords.push(...english)
    }
  }

  // 기본 키워드 추가
  if (keywords.length === 0) {
    keywords.push('education', 'learning', 'student')
  }

  return keywords.slice(0, 3) // 최대 3개 키워드만 사용
}

type InsightRow = Database['public']['Tables']['insights']['Row']
type InsightInsert = Database['public']['Tables']['insights']['Insert']
type InsightUpdate = Database['public']['Tables']['insights']['Update']

/**
 * 링크에서 제목 추출 (간단한 크롤링)
 */
async function fetchLinkTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Charset': 'UTF-8',
      },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 인코딩 처리: 여러 인코딩 시도
    const arrayBuffer = await response.arrayBuffer()
    
    // Content-Type에서 charset 확인
    const contentType = response.headers.get('content-type') || ''
    let charset = 'utf-8'
    
    const charsetMatch = contentType.match(/charset=([^;\s]+)/i)
    if (charsetMatch) {
      charset = charsetMatch[1].toLowerCase()
    }
    
    // 여러 인코딩 시도
    let html = ''
    const encodings = [charset, 'utf-8', 'euc-kr', 'iso-8859-1']
    
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: false })
        html = decoder.decode(arrayBuffer)
        // 한글이 제대로 디코딩되었는지 확인
        if (/[가-힣]/.test(html) || html.length > 100) {
          break
        }
      } catch (e) {
        continue
      }
    }
    
    // 제목 추출 (meta og:title 또는 <title> 태그)
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    if (ogTitleMatch) {
      // HTML 엔티티 디코딩 및 URL 디코딩
      let title = decodeHtmlEntities(ogTitleMatch[1])
      // URL 인코딩된 한글 디코딩 시도
      try {
        title = decodeURIComponent(title)
      } catch {
        // URL 디코딩 실패 시 원본 사용
      }
      return title.trim()
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      // HTML 엔티티 디코딩 및 URL 디코딩
      let title = decodeHtmlEntities(titleMatch[1])
      // URL 인코딩된 한글 디코딩 시도
      try {
        title = decodeURIComponent(title)
      } catch {
        // URL 디코딩 실패 시 원본 사용
      }
      return title.trim()
    }

    return url // 제목을 찾을 수 없으면 URL 반환
  } catch (error) {
    console.error('링크 제목 추출 실패:', error)
    return url
  }
}

/**
 * HTML 엔티티 디코딩
 */
function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&middot;': '·',
    '&bull;': '•',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': '\u2018', // '
    '&rsquo;': '\u2019', // '
    '&ldquo;': '\u201C', // "
    '&rdquo;': '\u201D', // "
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&deg;': '°',
    '&plusmn;': '±',
    '&times;': '×',
    '&divide;': '÷',
  }
  
  return text
    .replace(/&[#\w]+;/g, (entity) => {
      // 숫자 엔티티 처리 (&#1234;)
      const numMatch = entity.match(/&#(\d+);/)
      if (numMatch) {
        return String.fromCharCode(parseInt(numMatch[1], 10))
      }
      // 16진수 엔티티 처리 (&#x1F600;)
      const hexMatch = entity.match(/&#x([0-9a-fA-F]+);/i)
      if (hexMatch) {
        return String.fromCharCode(parseInt(hexMatch[1], 16))
      }
      // 일반 엔티티 처리
      return entities[entity.toLowerCase()] || entity
    })
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 링크에서 본문 내용 추출 (간단한 크롤링)
 */
async function fetchLinkContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Charset': 'UTF-8',
      },
      signal: AbortSignal.timeout(20000), // 20초 타임아웃
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 인코딩 처리
    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || ''
    let charset = 'utf-8'
    const charsetMatch = contentType.match(/charset=([^;\s]+)/i)
    if (charsetMatch) {
      charset = charsetMatch[1].toLowerCase()
    }
    
    // 여러 인코딩 시도
    let html = ''
    const encodings = [charset, 'utf-8', 'euc-kr', 'iso-8859-1']
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: false })
        html = decoder.decode(arrayBuffer)
        if (/[가-힣]/.test(html) || html.length > 100) {
          break
        }
      } catch (e) {
        continue
      }
    }
    
    // 본문 내용 추출 (여러 방법 시도)
    let content = ''
    
    // 1. meta description 시도
    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    if (metaDescMatch) {
      content = decodeHtmlEntities(metaDescMatch[1])
    }

    // 2. og:description 시도
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    if (ogDescMatch && ogDescMatch[1].length > content.length) {
      content = decodeHtmlEntities(ogDescMatch[1])
    }

    // 3. article 태그에서 텍스트 추출 (더 많은 내용)
    const articleMatch = html.match(/<article[^>]*>([\s\S]{0,3000})<\/article>/i)
    if (articleMatch) {
      let articleText = articleMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      articleText = decodeHtmlEntities(articleText)
      if (articleText.length > content.length) {
        content = articleText.substring(0, 2000) // 최대 2000자
      }
    }

    // 4. 본문 영역에서 텍스트 추출 (div.article, div.content 등)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]{0,5000})<\/body>/i)
    if (bodyMatch && content.length < 500) {
      const bodyText = bodyMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      const decodedBodyText = decodeHtmlEntities(bodyText)
      if (decodedBodyText.length > content.length) {
        content = decodedBodyText.substring(0, 2000)
      }
    }

    return content
  } catch (error) {
    console.error('링크 내용 추출 실패:', error)
    return ''
  }
}

/**
 * Gemini AI를 이용한 상담용 인사이트 글 생성
 */
async function generateInsightContent(url: string, title: string): Promise<{ summary: string; content: string }> {
  const geminiApiKey = process.env.GEMINI_API_KEY

  if (!geminiApiKey) {
    console.warn('⚠️ GEMINI_API_KEY가 설정되지 않았습니다. 템플릿 기반으로 생성합니다.')
    return generateTemplateContent(url, title)
  }

  try {
    // 링크 본문 내용 추출
    const linkContent = await fetchLinkContent(url)
    
    // 제목에서 HTML 엔티티 디코딩 (Gemini에 전달하기 전)
    const decodedTitle = decodeHtmlEntities(title)
    
    // Gemini API 호출
    const prompt = `당신은 "넥소에디터"라는 교육 전문 컬럼니스트입니다. 다음 뉴스 기사를 읽고, 학부모님 상담에 활용할 수 있는 전문적인 인사이트를 작성해주세요.

제목: ${decodedTitle}
URL: ${url}
${linkContent ? `기사 본문 내용:\n${linkContent.substring(0, 2500)}` : '본문 내용을 가져올 수 없었습니다.'}

작성 지침:
1. 넥소에디터의 관점에서 기사 본문을 분석하고, 교육 현장의 전문가로서의 생각과 인사이트를 제시하세요.
2. 단순 요약이 아닌, 기사 내용에 대한 깊이 있는 분석과 해석을 제공하세요.
3. 학부모님 상담 시 활용할 수 있도록 실용적이고 구체적인 조언을 포함하세요.
4. 입시 전략, 학습 방법, 정책 변화 등에 대한 전문적인 관점을 제시하세요.
5. 기사 본문의 구체적인 내용(수치, 사례, 배경 등)을 인용하며 분석하세요.
6. HTML 형식으로 작성하되, Tailwind CSS 클래스 사용 가능합니다.
7. 제목이나 본문에 HTML 엔티티(&middot;, &nbsp; 등)가 있으면 일반 문자로 변환하여 사용하세요.

작성 형식:
- summary: 기사 본문의 핵심 내용을 2-3줄로 요약 (넥소에디터의 관점 반영)
- content: 넥소에디터의 전문적인 분석과 인사이트를 담은 HTML 형식의 컬럼

응답 형식:
{
  "summary": "요약 내용 (2-3줄, 넥소에디터의 관점에서 기사 핵심 내용 요약)",
  "content": "HTML 형식의 넥소에디터 컬럼 (기사 본문 분석, 전문적 인사이트, 상담 활용 팁 포함)"
}`

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
        signal: AbortSignal.timeout(30000), // 30초 타임아웃
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API 에러:', response.status, errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`)
    }

    const data = await response.json()
    
    // API 응답 구조 확인
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text
      
      // JSON 형식으로 파싱 시도
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            summary: parsed.summary || `넥소에디터가 ${title}에 대해 분석합니다. 학부모님 상담 시 활용하실 수 있는 전문적인 인사이트를 제공합니다.`,
            content: parsed.content || generateTemplateContent(url, title).content
          }
        }
      } catch (parseError) {
        console.error('JSON 파싱 실패:', parseError)
        // JSON 파싱 실패해도 텍스트는 사용 가능
      }

      // JSON이 아닌 경우 텍스트를 그대로 사용
      const lines = generatedText.split('\n').filter((line: string) => line.trim())
      const summary = lines[0] || `넥소에디터가 ${title}에 대해 분석합니다. 학부모님 상담 시 활용하실 수 있는 전문적인 인사이트를 제공합니다.`
      const content = wrapInHtmlTemplate(generatedText, url, title)
      
      return { summary, content }
    }

    // API 응답이 예상과 다른 경우 템플릿 사용
    console.warn('⚠️ Gemini API 응답 형식이 예상과 다릅니다. 템플릿을 사용합니다.')
    return generateTemplateContent(url, title)
  } catch (error) {
    console.error('Gemini API 호출 실패:', error)
    // 에러 발생 시 템플릿 기반으로 생성
    return generateTemplateContent(url, title)
  }
}

/**
 * 템플릿 기반 콘텐츠 생성 (폴백)
 */
function generateTemplateContent(url: string, title: string): { summary: string; content: string } {
  const summary = `넥소에디터가 ${title}에 대해 분석합니다. 학부모님 상담 시 활용하실 수 있는 전문적인 인사이트를 제공합니다.`
  
  const content = wrapInHtmlTemplate(
    `넥소에디터의 관점에서 이 기사를 분석해보면, 학부모님 상담에 활용할 수 있는 중요한 정보들이 담겨 있습니다. 입시 전략, 학습 방법, 정책 변화 등에 대한 전문적인 인사이트를 바탕으로 학생들의 성장을 지원할 수 있습니다.`,
    url,
    title
  )

  return { summary, content }
}

/**
 * HTML 템플릿으로 감싸기
 */
function wrapInHtmlTemplate(text: string, url: string, title: string): string {
  return `
    <div class="insight-content">
      <div class="bg-gradient-to-r from-nexo-cyan/10 to-nexo-navy/10 p-4 rounded-lg mb-4 border-l-4 border-nexo-cyan">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg font-bold text-nexo-cyan">✍️</span>
          <span class="text-sm font-bold text-nexo-navy">넥소에디터의 관점</span>
        </div>
        <p class="text-sm text-gray-600">
          ${title}
        </p>
      </div>
      <div class="text-gray-700 mb-4 leading-relaxed prose prose-sm max-w-none">
        ${text.split('\n').map(p => p.trim() ? `<p class="mb-3">${p}</p>` : '').join('')}
      </div>
      <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
        <p class="text-sm font-semibold text-gray-700 mb-2">
          💼 상담 활용 가이드
        </p>
        <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>넥소에디터의 분석을 바탕으로 학부모님께 신뢰감 있는 상담을 제공하세요</li>
          <li>기사 내용을 인용하며 전문성을 어필하세요</li>
          <li>입시 전략 수립 시 실용적인 자료로 활용하세요</li>
        </ul>
      </div>
      <div class="mt-4 pt-4 border-t border-gray-200">
        <a href="${url}" target="_blank" rel="noopener noreferrer" 
           class="inline-flex items-center gap-2 text-sm text-nexo-cyan hover:text-nexo-navy font-medium">
          📰 원문 기사 보기 →
        </a>
      </div>
    </div>
  `
}

/**
 * 인사이트 링크 생성
 */
export async function createInsight(
  url: string,
  category: '입시' | '정책' | '학습법' | '상담팁' | '기타' = '기타',
  editionId?: string,
  publishDate?: string // YYYY-MM-DD 형식의 발행 날짜
) {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: '인증이 필요합니다.' }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
  if (profileData?.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다.' }
  }

  try {
    // 링크 제목 추출
    let title = await fetchLinkTitle(url)
    
    // 제목이 깨진 경우 감지 및 처리
    const koreanRegex = /[가-힣]/
    const brokenCharRegex = /[^\x00-\x7F\uAC00-\uD7A3\s\.,!?\-:()]/g
    
    if (title && title !== url) {
      // 깨진 문자 비율 계산
      const brokenChars = (title.match(brokenCharRegex) || []).length
      const totalChars = title.length
      
      // 한글이 없고 깨진 문자가 많으면 문제로 판단
      if (!koreanRegex.test(title) && brokenChars > 5 && totalChars > 10) {
        console.warn('⚠️ 제목 인코딩 문제 감지, 기본 제목 사용:', title.substring(0, 50))
        title = '교육 뉴스 기사'
      }
    }
    
    // 제목이 URL과 같거나 너무 짧은 경우
    if (title === url || !title || title.length < 3) {
      try {
        const urlObj = new URL(url)
        title = `${urlObj.hostname.replace('www.', '')} 기사`
      } catch {
        title = '링크 기사'
      }
    }

    // AI로 인사이트 내용 생성
    const { summary, content } = await generateInsightContent(url, title)

    // 관련 이미지 생성 (비동기로 실행, 실패해도 계속 진행)
    let imageUrl: string | null = null
    try {
      imageUrl = await generateInsightImage(title, summary)
      if (imageUrl) {
        console.log('✅ 인사이트 이미지 생성 완료:', imageUrl)
      }
    } catch (error) {
      console.warn('⚠️ 이미지 생성 실패 (계속 진행):', error)
    }

    // 발행 날짜 처리
    let publishedAt: string | null = null
    let isPublished = false
    
    if (publishDate) {
      // 발행 날짜가 선택된 경우
      const publishDateTime = new Date(publishDate + 'T00:00:00Z')
      const now = new Date()
      
      if (publishDateTime <= now) {
        // 과거 또는 오늘 날짜면 즉시 발행
        isPublished = true
        publishedAt = publishDateTime.toISOString()
      } else {
        // 미래 날짜면 예약 발행 (is_published는 false, published_at만 설정)
        publishedAt = publishDateTime.toISOString()
        isPublished = false
      }
    }

    // 데이터베이스에 저장
    const insertData: InsightInsert = {
      url,
      title,
      summary,
      content,
      category,
      edition_id: editionId || null,
      author_id: user.id,
      is_published: isPublished,
      published_at: publishedAt,
      thumbnail_url: imageUrl || null, // 이미지 URL 추가
    }

    const { data, error } = await (supabase
      .from('insights') as any)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('인사이트 생성 실패:', error)
      // 더 상세한 에러 메시지 제공
      if (error.code === '23505') {
        return { error: '이미 등록된 링크입니다.' }
      }
      if (error.code === '42P01') {
        return { error: 'insights 테이블이 존재하지 않습니다. SQL 스크립트를 실행하세요.' }
      }
      return { error: `인사이트 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}` }
    }

    // 캐시 무효화 (생성 후 즉시 반영)
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/') // 홈페이지 캐시 무효화
    revalidatePath('/news', 'layout') // 모든 발행호 페이지 캐시 무효화
    const typedData = data as InsightRow | null
    if (typedData?.edition_id) {
      revalidatePath(`/news/${typedData.edition_id}`) // 특정 발행호 페이지 캐시 무효화
    }

    return { data: typedData as InsightRow }
  } catch (error) {
    console.error('인사이트 생성 오류:', error)
    return { error: '인사이트 생성 중 오류가 발생했습니다.' }
  }
}

/**
 * 인사이트 목록 조회
 * published_at이 현재 시간 이하인 경우 자동으로 발행 처리
 * 
 * @param editionId - 특정 발행호 ID (undefined면 모든 인사이트, null이면 일반 인사이트만)
 * @param previewMode - 미리보기 모드 (모든 인사이트 조회)
 */
export async function getInsights(editionId?: string | null, previewMode: boolean = false) {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // 예약 발행된 인사이트 자동 발행 처리 (미리보기 모드가 아닐 때만)
    // 단, 사용자가 명시적으로 비발행 처리한 것은 제외 (published_at이 설정되어 있고 is_published가 false인 경우만 자동 발행)
    if (!previewMode) {
      const updateData: InsightUpdate = { is_published: true }
      const { error: autoPublishError } = await (supabase
        .from('insights') as any)
        .update(updateData)
        .eq('is_published', false)
        .lte('published_at', now)
        .not('published_at', 'is', null)

      if (autoPublishError) {
        console.error('자동 발행 처리 실패:', autoPublishError)
      }
    }

    // insights 테이블이 존재하지 않을 수 있으므로 안전하게 처리
    let query = (supabase
      .from('insights') as any)
      .select('*')
      .order('published_at', { ascending: false, nullsLast: true })
      .order('created_at', { ascending: false })

    if (!previewMode) {
      // 일반 모드: 발행된 인사이트만 조회 (is_published = true인 것만)
      // 비발행 처리된 인사이트는 표시되지 않음
      query = query.eq('is_published', true)
      
      // published_at이 현재 시간 이하인 인사이트만 조회 (예약 발행된 인사이트는 발행 시간이 되기 전까지 표시되지 않음)
      // published_at이 null인 경우는 즉시 발행된 것으로 간주하여 표시
      // Supabase PostgREST의 or() 메서드는 괄호로 그룹화된 조건을 사용
      query = query.or(`published_at.is.null,published_at.lte.${now}`)
    }
    // 미리보기 모드: 모든 인사이트 조회 (발행 여부 무관, published_at이 미래인 경우도 포함)
    // 미리보기 모드: 모든 인사이트 조회 (발행 여부 무관, published_at이 미래인 경우도 포함)

    if (editionId !== undefined) {
      if (editionId) {
        // 특정 editionId가 주어진 경우: 해당 edition_id에만 연결된 인사이트만 조회
        // 일반 인사이트(edition_id = null)는 제외하여 다른 발행호에 표시되지 않도록 함
        query = query.eq('edition_id', editionId)
      } else {
        // editionId가 명시적으로 null로 전달된 경우: 일반 인사이트만
        query = query.is('edition_id', null)
      }
    }
    // editionId가 undefined인 경우: 모든 발행된 인사이트 조회 (edition_id 필터 없음)

    const { data, error } = await query

    // 타입 캐스팅
    const typedData = data as InsightRow[] | null

    // 디버깅: 개발 환경에서 상세 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getInsights] editionId: ${editionId || 'null'}`)
      console.log(`[getInsights] 쿼리 결과:`, { 
        count: typedData?.length || 0, 
        error: error?.message,
        insights: typedData?.map((i: InsightRow) => ({ id: i.id, title: i.title, edition_id: i.edition_id, is_published: i.is_published }))
      })
    }

    if (error) {
      // 테이블이 없거나 권한 문제인 경우 빈 배열 반환
      if (error.code === '42P01' || error.code === 'PGRST116') {
        // 테이블이 존재하지 않음
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ insights 테이블이 존재하지 않습니다. SQL 스크립트를 실행하세요.')
        }
        return []
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('인사이트 조회 실패:', error)
      }
      return []
    }

    return (typedData || []) as InsightRow[]
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('인사이트 조회 중 예외 발생:', error)
    }
    return []
  }
}

/**
 * 인사이트 수정
 */
export async function updateInsight(
  id: number,
  updates: {
    title?: string
    summary?: string | null
    category?: '입시' | '정책' | '학습법' | '상담팁' | '기타'
    published_at?: string | null // 발행 날짜 (ISO 문자열)
    edition_id?: string | null // 발행호 ID
  }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '인증이 필요합니다.' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
  if (profileData?.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다.' }
  }

  // 발행 날짜 업데이트 시 is_published 상태도 자동 조정
  let updateData: InsightUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  // published_at이 업데이트되는 경우
  if (updates.published_at !== undefined) {
    const now = new Date()
    const publishDateTime = updates.published_at ? new Date(updates.published_at) : null
    
    if (publishDateTime && publishDateTime <= now) {
      // 과거 또는 오늘 날짜면 즉시 발행
      updateData.is_published = true
    } else if (publishDateTime && publishDateTime > now) {
      // 미래 날짜면 예약 발행 (is_published는 false 유지)
      updateData.is_published = false
    } else if (!publishDateTime) {
      // 날짜가 비워지면 수동 발행 대기 (is_published는 false)
      updateData.is_published = false
    }
  }

  const { data, error } = await (supabase
    .from('insights') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('인사이트 수정 실패:', error)
    return { error: '수정에 실패했습니다.' }
  }

  // 캐시 무효화 (수정 후 즉시 반영)
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/') // 홈페이지 캐시 무효화
  revalidatePath('/news', 'layout') // 모든 발행호 페이지 캐시 무효화
  const typedData = data as InsightRow | null
  if (typedData?.edition_id) {
    revalidatePath(`/news/${typedData.edition_id}`) // 특정 발행호 페이지 캐시 무효화
  }

  return { data: typedData as InsightRow }
}

/**
 * 날짜별 일괄 발행
 */
export async function bulkPublishInsightsByDate(date: string, publish: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '인증이 필요합니다.' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
  if (profileData?.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다.' }
  }

  // 날짜 범위 설정 (해당 날짜의 00:00:00 ~ 23:59:59)
  const startDate = new Date(date + 'T00:00:00Z').toISOString()
  const endDate = new Date(date + 'T23:59:59Z').toISOString()

  const updateData: InsightUpdate = {
    is_published: publish,
    updated_at: new Date().toISOString(),
  }

  // published_at이 해당 날짜 범위 내에 있는 인사이트 업데이트
  const { data, error } = await (supabase
    .from('insights') as any)
    .update(updateData)
    .gte('published_at', startDate)
    .lte('published_at', endDate)
    .select()

  if (error) {
    console.error('일괄 발행 실패:', error)
    return { error: '일괄 발행에 실패했습니다.' }
  }

  // 캐시 무효화
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/') // 홈페이지 캐시 무효화
  revalidatePath('/news', 'layout') // 모든 발행호 페이지 캐시 무효화
  revalidatePath('/admin/insights') // 관리자 페이지 캐시 무효화

  const typedData = data as InsightRow[] | null
  return { data: typedData as InsightRow[], count: typedData?.length || 0 }
}

/**
 * 인사이트 발행/비발행 토글
 */
export async function toggleInsightPublish(id: number, isPublished: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '인증이 필요합니다.' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
  if (profileData?.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다.' }
  }

  const updateData: InsightUpdate = {
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  }

  // 디버깅: 개발 환경에서 로그 출력
  if (process.env.NODE_ENV === 'development') {
    console.log(`[toggleInsightPublish] id: ${id}, isPublished: ${isPublished}`)
  }

  const { data, error } = await (supabase
    .from('insights') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('인사이트 발행 상태 변경 실패:', error)
    return { error: '업데이트 실패' }
  }

  // 디버깅: 업데이트 결과 확인
  const typedData = data as InsightRow | null
  if (process.env.NODE_ENV === 'development') {
    console.log(`[toggleInsightPublish] 업데이트 완료:`, { 
      id: typedData?.id, 
      is_published: typedData?.is_published,
      edition_id: typedData?.edition_id 
    })
  }

  // 캐시 무효화 (발행 상태 변경 후 즉시 반영)
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/') // 홈페이지 캐시 무효화
  revalidatePath('/news', 'layout') // 모든 발행호 페이지 캐시 무효화
  if (typedData?.edition_id) {
    revalidatePath(`/news/${typedData.edition_id}`) // 특정 발행호 페이지 캐시 무효화
  }

  return { data: data as InsightRow }
}

