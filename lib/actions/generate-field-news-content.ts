'use server'

import { StructuredFieldData } from '@/lib/utils/field-news-content'

/**
 * AI를 사용하여 현장소식 블로그 글 생성
 */
export async function generateFieldNewsBlogContent(
  rawText: string,
  fields: StructuredFieldData,
  images: string[] = []
): Promise<{ success: boolean; content?: string; error?: string }> {
  const geminiApiKey = process.env.GEMINI_API_KEY

  if (!geminiApiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY가 설정되지 않았습니다.',
    }
  }

  try {
    // Gemini API에 전달할 프롬프트 작성
    const prompt = `당신은 넥소(NEXO) 전자칠판 전문 설치 블로그 작가입니다. 넥소 제품에 대한 깊은 전문 지식을 바탕으로 구체적이고 전문적이며 친절하고 친화적인 블로그 글을 작성해주세요.

**넥소(NEXO) 전자칠판 전문 지식:**

넥소는 K-AI 시대를 선도하는 혁신적인 All-in-One 전자칠판 솔루션입니다.

**핵심 특징:**
1. **All-in-One 솔루션**: 별도의 PC, 마이크, 카메라 연결 없이 넥소 하나로 모든 환경 완성
   - 고성능 옥타코어 컴퓨터 내장
   - 4K UHD 초고화질 패널 (3840 x 2160P, 450nits)
   - 4,800만 화소 AI 카메라 (120도 시야각 FOV)
   - 8개 어레이 고성능 마이크 및 스피커

2. **아날로그의 필기감, 디지털의 강력함**
   - 제로갭 본딩(Zero-Gap Bonding): 패널과 유리 사이 간격 제거로 실제 종이에 쓰는 듯한 정밀한 터치감 (응답속도 2ms 미만)
   - 무반사(Anti-glare) 처리와 경도 9H 고강도 강화유리로 시력 보호 및 스크래치 방지
   - 50포인트 멀티 터치로 여러 명이 동시에 판서 가능

3. **강력한 무선 미러링**
   - 최대 9개 기기 동시 연결 (노트북, 태블릿, 스마트폰 등)
   - 양방향 제어로 미러링된 화면을 전자칠판에서 직접 제어 가능
   - Windows, Mac, Android, iOS 등 모든 OS 지원, QR 코드 스캔 한 번으로 연결

4. **AI 및 소프트웨어**
   - OpenAI ChatGPT 탑재로 실시간 피드백과 개인 맞춤형 학습 지원
   - UMIND 판서 소프트웨어: 수학(함수/그래프), 과학(실험 도구) 등 교육 특화 도구 제공
   - 무한 판서 캔버스 기본 제공

5. **시장 리더십**
   - 전국 학원 납품 1위
   - 메가스터디, EBS, 종로학원, 대성학원 등 수많은 교육 전문가들이 선택한 검증된 솔루션
   - 여성기업 및 중소벤처기업부 인증 중소기업
   - 관공서, 기업, 대학교에 압도적인 설치 실적 보유

**입력된 초안 텍스트:**
${rawText}

**파싱된 정보:**
${fields.storeName ? `- 상점명: ${fields.storeName}` : ''}
${fields.location ? `- 지역: ${fields.location}` : ''}
${fields.model ? `- 모델: ${fields.model}` : ''}
${fields.additionalCables ? `- 추가 케이블: ${fields.additionalCables}` : ''}
${fields.stand ? `- 스탠드: ${fields.stand}` : ''}
${fields.wallMount ? `- 벽걸이: ${fields.wallMount}` : ''}
${fields.payment ? `- 결제: ${fields.payment}` : ''}
${fields.notes ? `- 특이사항: ${fields.notes}` : ''}
${fields.installationDate ? `- 설치일: ${fields.installationDate}` : ''}

**작성 요구사항:**
1. 위의 넥소 전문 지식을 활용하여 구체적이고 전문적인 내용을 작성하세요. 예를 들어:
   - 모델명이 언급되면 해당 모델의 특징(크기, 해상도 등)을 자연스럽게 설명
   - 설치 환경에 따라 제로갭 본딩의 필기감, 무선 미러링의 편리함 등을 구체적으로 언급
   - 교육 현장이라면 UMIND 판서 소프트웨어의 교육 특화 기능을 자연스럽게 소개
   - AI 카메라나 고성능 마이크 등이 현장에서 어떻게 활용되는지 구체적으로 설명

2. 입력된 초안 텍스트의 내용을 바탕으로 자연스럽고 전문적인 블로그 글을 작성하세요.

3. 단순 나열이 아닌, 실제로 현장에 다녀온 것처럼 생생하고 자연스러운 문체로 작성하세요.

4. 설치 과정, 현장 분위기, 고객 만족도, 넥소 제품의 장점이 현장에서 어떻게 발휘되는지 등을 구체적으로 서술하세요.

5. 전문적이면서도 친절하고 친화적인 톤을 유지하세요. 고객이 느낄 수 있는 만족감과 편의성을 자연스럽게 표현하세요.

6. HTML 형식으로 작성하되, 모든 텍스트는 가운데 정렬(center)로 작성하세요.

7. 이미지가 ${images.length}개 제공됩니다. 반드시 모든 이미지를 [이미지1], [이미지2], [이미지3]... 형식으로 적절한 위치에 배치해주세요. 모든 이미지를 사용해야 합니다.

8. 문단을 적절히 나누고, 제목, 본문, 마무리 등 블로그 글의 구조를 갖추세요.

9. 각 문단은 <p style="text-align: center;"> 태그로 감싸서 가운데 정렬하세요.

10. 절대로 "[블로그 이름]"이나 "[블로그명]" 같은 플레이스홀더를 사용하지 마세요. 인사말은 "안녕하세요!" 또는 "여러분 안녕하세요!"로 시작하세요.

**작성 형식:**
- 헤더: 상점명과 지역 정보를 자연스럽게 소개하며, 넥소 전자칠판 설치의 의미를 간단히 언급 (이미지 1-2개 삽입)
- 본문: 설치 과정과 현장 상황을 생생하게 서술하며, 넥소 제품의 특징이 현장에서 어떻게 활용되는지 구체적으로 설명 (이미지 2-3개 삽입)
- 설치 정보: 모델, 케이블, 스탠드, 벽걸이 등을 자연스럽게 언급하며, 각 구성품의 특징과 장점을 설명 (이미지 1-2개 삽입)
- 특이사항: 특이사항이 있으면 자연스럽게 서술하며, 넥소 제품이 해당 환경에서 어떤 이점을 제공하는지 설명 (이미지 1개 삽입)
- 마무리: 설치 완료와 고객 만족을 자연스럽게 마무리하며, 넥소 전자칠판이 앞으로 어떤 가치를 제공할지 기대감을 표현 (남은 이미지 모두 삽입)

**중요:**
- 총 ${images.length}개의 이미지가 있으므로, 반드시 [이미지1]부터 [이미지${images.length}]까지 모두 사용하세요.
- 이미지가 없는 섹션은 만들지 마세요.
- 텍스트와 이미지가 자연스럽게 조화를 이루도록 배치하세요.
- "[블로그 이름]", "[블로그명]", "[회사명]" 같은 플레이스홀더를 절대 사용하지 마세요.
- 넥소 제품의 전문 지식을 활용하되, 자연스럽고 과하지 않게 통합하세요.
- 구체적인 수치나 특징을 언급할 때는 정확하게 작성하세요 (예: "4K UHD 화질", "9개 기기 동시 연결", "2ms 응답속도" 등).

HTML 형식으로 작성해주세요.`

    // 재시도 로직 (최대 3회 시도)
    let lastError: any = null
    let response: Response | null = null
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(
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
            signal: AbortSignal.timeout(60000), // 60초 타임아웃
          }
        )

        if (response.ok) {
          break // 성공하면 루프 종료
        }

        // 429 오류인 경우 재시도 대기 시간 확인
        if (response.status === 429) {
          const errorText = await response.text()
          let retryDelay = 5000 // 기본 5초
          
          try {
            const errorData = JSON.parse(errorText)
            if (errorData.error?.details) {
              const retryInfo = errorData.error.details.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')
              if (retryInfo?.retryDelay) {
                retryDelay = Math.min(parseInt(retryInfo.retryDelay) * 1000 || 5000, 30000) // 최대 30초
              }
            }
          } catch {
            // JSON 파싱 실패 시 기본값 사용
          }
          
          if (attempt < 2) {
            console.log(`⏳ Rate limit 도달, ${retryDelay / 1000}초 후 재시도... (시도 ${attempt + 1}/3)`)
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            continue
          }
        }

        // 429가 아니거나 재시도 횟수 초과
        const errorText = await response.text()
        console.error('Gemini API 오류:', response.status, errorText)
        lastError = {
          status: response.status,
          message: errorText
        }
        break
      } catch (error: any) {
        // 네트워크 오류나 타임아웃
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
          if (attempt < 2) {
            console.log(`⏳ 타임아웃 발생, 재시도... (시도 ${attempt + 1}/3)`)
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue
          }
        }
        lastError = error
        break
      }
    }

    if (!response || !response.ok) {
      return {
        success: false,
        error: lastError?.status === 429 
          ? 'API 사용량이 일시적으로 초과되었습니다. 잠시 후 다시 시도해주세요.'
          : `AI 글 생성 실패: ${lastError?.status || '네트워크 오류'}`,
      }
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return {
        success: false,
        error: 'AI 응답 형식이 올바르지 않습니다.',
      }
    }

    let generatedContent = data.candidates[0].content.parts[0].text.trim()

    // 사용된 이미지 인덱스 추적
    const usedImageIndices = new Set<number>()
    
    // [이미지1], [이미지2] 형식으로 명시적으로 지정된 이미지 처리
    generatedContent = generatedContent.replace(/\[이미지(\d+)\]/gi, (match: string, num: string) => {
      const idx = parseInt(num, 10) - 1
      if (idx >= 0 && idx < images.length && !usedImageIndices.has(idx)) {
        usedImageIndices.add(idx)
        return `<div class="field-news-image-wrapper my-6" style="text-align: center;"><img src="${images[idx]}" alt="현장 사진 ${idx + 1}" class="field-news-image w-full rounded-lg shadow-md" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
      }
      return ''
    })

    // [이미지] 형식도 처리 (순서대로, 사용되지 않은 이미지부터)
    let autoImageIndex = 0
    generatedContent = generatedContent.replace(/\[이미지\]/gi, () => {
      // 사용되지 않은 이미지 찾기
      while (autoImageIndex < images.length && usedImageIndices.has(autoImageIndex)) {
        autoImageIndex++
      }
      
      if (autoImageIndex < images.length) {
        usedImageIndices.add(autoImageIndex)
        const imgTag = `<div class="field-news-image-wrapper my-6" style="text-align: center;"><img src="${images[autoImageIndex]}" alt="현장 사진 ${autoImageIndex + 1}" class="field-news-image w-full rounded-lg shadow-md" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
        autoImageIndex++
        return imgTag
      }
      return ''
    })

    // 사용되지 않은 이미지가 있으면 문단 사이에 자연스럽게 배치
    const unusedImages: number[] = []
    for (let i = 0; i < images.length; i++) {
      if (!usedImageIndices.has(i)) {
        unusedImages.push(i)
      }
    }

    if (unusedImages.length > 0) {
      // 문단을 찾아서 이미지를 삽입
      const paragraphs = generatedContent.split(/<\/p>/i)
      const imagesPerParagraph = Math.ceil(unusedImages.length / Math.max(paragraphs.length - 1, 1))
      
      let unusedIndex = 0
      const newParagraphs = paragraphs.map((para: string, idx: number) => {
        if (idx === paragraphs.length - 1) return para // 마지막은 그대로
        
        let result = para
        // 각 문단 뒤에 이미지 삽입
        for (let i = 0; i < imagesPerParagraph && unusedIndex < unusedImages.length; i++) {
          const imgIdx = unusedImages[unusedIndex]
          result += `<div class="field-news-image-wrapper my-6" style="text-align: center;"><img src="${images[imgIdx]}" alt="현장 사진 ${imgIdx + 1}" class="field-news-image w-full rounded-lg shadow-md" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
          unusedIndex++
        }
        return result + '</p>'
      })
      
      generatedContent = newParagraphs.join('')
      
      // 아직 남은 이미지가 있으면 마지막에 추가
      if (unusedIndex < unusedImages.length) {
        const remainingImages = unusedImages.slice(unusedIndex).map((imgIdx) => 
          `<div class="field-news-image-wrapper my-6" style="text-align: center;"><img src="${images[imgIdx]}" alt="현장 사진 ${imgIdx + 1}" class="field-news-image w-full rounded-lg shadow-md" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
        ).join('\n')
        generatedContent += '\n' + remainingImages
      }
    }

    // 모든 텍스트를 가운데 정렬로 변경
    generatedContent = generatedContent.replace(/<p([^>]*)>/gi, (match: string, attrs: string) => {
      if (!attrs.includes('text-align')) {
        return `<p${attrs} style="text-align: center;">`
      }
      return match
    })

    // 플레이스홀더 제거: [블로그 이름], [블로그명] 등을 제거
    generatedContent = generatedContent.replace(/\[블로그\s*(이름|명|이름\)|명\))\]/gi, '')
    generatedContent = generatedContent.replace(/\[회사명\]/gi, '')
    generatedContent = generatedContent.replace(/\[.*?\]/g, (match: string) => {
      // [이미지1] 같은 이미지 플레이스홀더는 이미 처리되었으므로 남은 것만 제거
      if (!match.includes('이미지')) {
        return ''
      }
      return match
    })

    return {
      success: true,
      content: generatedContent,
    }
  } catch (error: any) {
    console.error('AI 글 생성 오류:', error)
    return {
      success: false,
      error: error.message || 'AI 글 생성 중 오류가 발생했습니다.',
    }
  }
}
