/**
 * editions-data.js → Supabase articles 테이블 마이그레이션 스크립트 (개선 버전)
 * 
 * 실행 방법:
 * 1. 먼저 SQL 스크립트 실행: scripts/add-edition-id-column.sql
 * 2. npm install tsx (또는 ts-node)
 * 3. npx tsx scripts/migrate-editions-improved.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// .env.local 파일 로드
const envPath = path.join(process.cwd(), '.env.local')

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath })
  if (result.error) {
    console.warn('⚠️  .env.local 파일 로드 실패:', result.error.message)
  }
} else {
  console.warn('⚠️  .env.local 파일을 찾을 수 없습니다.')
}

// 환경 변수 확인
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ 환경 변수가 설정되지 않았습니다.')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
  console.error('\n   .env.local 파일을 확인하거나 환경 변수를 직접 설정하세요.')
  console.error('   파일 경로:', envPath)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// editions-data.js 파일을 동적으로 로드
function loadEditionsData() {
  const filePath = path.join(process.cwd(), 'js', 'editions-data.js')
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`파일을 찾을 수 없습니다: ${filePath}`)
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  // EDITIONS_DATA 객체 추출 (더 유연한 정규식)
  // 여러 줄에 걸쳐 있을 수 있으므로 [\s\S]*? 사용
  const match = fileContent.match(/const EDITIONS_DATA\s*=\s*({[\s\S]*});/)
  if (!match) {
    throw new Error('EDITIONS_DATA 객체를 찾을 수 없습니다.')
  }

  const dataStr = match[1]
  console.log(`   데이터 문자열 길이: ${dataStr.length} 문자`)
  
  try {
    // VM 모듈 사용 (가장 안전한 방법)
    const vm = require('vm')
    const context = { EDITIONS_DATA: null }
    vm.createContext(context)
    
    // EDITIONS_DATA만 추출하여 실행
    const code = `EDITIONS_DATA = ${dataStr}`
    vm.runInContext(code, context)
    
    if (!context.EDITIONS_DATA) {
      throw new Error('EDITIONS_DATA를 추출할 수 없습니다.')
    }
    
      console.log(`   ✅ VM 모듈로 데이터 로드 성공`)
      const loadedData = context.EDITIONS_DATA as { editions?: Edition[] }
      console.log(`   editions 개수: ${loadedData.editions?.length || 0}`)
      
      return loadedData
  } catch (vmError: any) {
    console.error('   ⚠️  VM 모듈 실행 실패:', vmError.message)
    // 대안: 임시 파일로 저장 후 require
    try {
      console.log('   임시 파일 방식으로 시도...')
      const tempPath = path.join(process.cwd(), 'temp-editions-data.js')
      const requireCode = `module.exports = ${dataStr};`
      fs.writeFileSync(tempPath, requireCode)
      
      // require 캐시 클리어
      delete require.cache[require.resolve(tempPath)]
      const data = require(tempPath)
      fs.unlinkSync(tempPath) // 임시 파일 삭제
      
      console.log(`   ✅ 임시 파일 방식으로 데이터 로드 성공`)
      return data
    } catch (requireError: any) {
      throw new Error(`데이터 파싱 실패: ${requireError.message}`)
    }
  }
}

interface Edition {
  id: string // edition_id (예: "2026-02-05")
  date: string
  volume: string
  title: string
  headline: string
  subHeadline?: string
  leadText?: string
  content: {
    main: string
    features?: string[]
  }
  images?: Array<{
    filename: string
    alt?: string
    caption?: string
  }>
  articles?: Array<{
    type: 'news' | 'column'
    title: string
    author: string
    content: string
    tags?: string[]
  }>
}

async function migrateEditions() {
  console.log('🚀 editions-data.js → Supabase 마이그레이션 시작\n')
  console.log('='.repeat(60))

  try {
    // 1. editions-data.js 파일 로드
    console.log('\n📂 1단계: 데이터 파일 로드 중...')
    const editionsData = loadEditionsData()
    
    if (!editionsData || typeof editionsData !== 'object') {
      throw new Error('데이터를 올바르게 로드할 수 없습니다.')
    }
    
    const editions: Edition[] = editionsData.editions || []
    
    if (editions.length === 0) {
      throw new Error('발행 데이터가 없습니다.')
    }

    console.log(`✅ ${editions.length}개의 발행호를 찾았습니다:`)
    editions.forEach((ed, idx) => {
      console.log(`   ${idx + 1}. ${ed.id} - ${ed.title}`)
    })

    // 2. 기존 데이터 확인 (중복 방지)
    console.log('\n📊 2단계: 기존 데이터 확인 중...')
    const { data: existingArticles } = await supabase
      .from('articles')
      .select('edition_id')
      .not('edition_id', 'is', null)

    const existingEditionIds = new Set(
      existingArticles?.map(a => a.edition_id) || []
    )

    console.log(`   기존 발행호: ${existingEditionIds.size}개`)

    // 3. 각 발행호를 articles 테이블에 저장
    console.log('\n📰 3단계: 발행호 데이터 마이그레이션 중...\n')
    
    let successCount = 0
    let skipCount = 0

    for (const edition of editions) {
      const editionId = edition.id

      // 중복 체크
      if (existingEditionIds.has(editionId)) {
        console.log(`⏭️  [${editionId}] 이미 존재함 - 건너뜀`)
        skipCount++
        continue
      }

      console.log(`\n📰 [${editionId}] ${edition.title}`)
      console.log(`   날짜: ${edition.date}`)
      console.log(`   호수: ${edition.volume}`)

      try {
        // 3-1. 메인 article 생성 (발행호 전체)
        const mainArticle = {
          title: edition.headline || edition.title,
          subtitle: edition.subHeadline || null,
          content: edition.content?.main || '',
          category: 'news' as const,
          thumbnail_url: edition.images?.[0] 
            ? `/assets/images/${edition.images[0].filename}`
            : null,
          edition_id: editionId,
          published_at: new Date(editionId).toISOString(),
          is_published: true,
          views: 0,
        }

        const { data: mainArticleData, error: mainError } = await supabase
          .from('articles')
          .insert(mainArticle)
          .select()
          .single()

        if (mainError) {
          console.error(`   ❌ 메인 article 저장 실패:`, mainError.message)
          continue
        }

        console.log(`   ✅ 메인 article 저장 완료 (ID: ${mainArticleData.id})`)

        // 3-2. 하위 articles 생성 (edition.articles 배열)
        if (edition.articles && edition.articles.length > 0) {
          const subArticles = edition.articles.map((article) => {
            const category: 'column' | 'news' = article.type === 'column' ? 'column' : 'news'
            return {
              title: article.title,
              subtitle: null,
              content: article.content,
              category,
              thumbnail_url: null,
              edition_id: editionId, // 같은 발행호로 연결
              published_at: new Date(editionId).toISOString(),
              is_published: true,
              views: 0,
            }
          })

          const { data: subArticlesData, error: subError } = await supabase
            .from('articles')
            .insert(subArticles)
            .select()

          if (subError) {
            console.error(`   ⚠️  하위 articles 저장 실패:`, subError.message)
          } else {
            console.log(`   ✅ ${subArticlesData.length}개의 하위 article 저장 완료`)
          }
        }

        successCount++

      } catch (error: any) {
        console.error(`   ❌ [${editionId}] 처리 실패:`, error.message)
      }
    }

    // 4. 결과 요약
    console.log('\n' + '='.repeat(60))
    console.log('📊 마이그레이션 결과 요약')
    console.log('='.repeat(60))
    console.log(`✅ 성공: ${successCount}개`)
    console.log(`⏭️  건너뜀: ${skipCount}개`)
    console.log(`📝 총 처리: ${editions.length}개`)

    console.log('\n✅ 마이그레이션 완료!')
    console.log('\n📋 다음 단계:')
    console.log('   1. Supabase Dashboard > Table Editor에서 articles 테이블 확인')
    console.log('   2. edition_id 컬럼이 제대로 추가되었는지 확인')
    console.log('   3. 동적 라우팅 페이지 구현: app/news/[editionId]/page.tsx')

  } catch (error: any) {
    console.error('\n❌ 마이그레이션 실패:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// 실행
migrateEditions().catch(console.error)

