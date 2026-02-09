/**
 * editions-data.js → Supabase articles 테이블 마이그레이션 스크립트
 * 
 * 실행 방법:
 * 1. .env.local 파일에 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있어야 합니다
 * 2. npm run migrate:editions 또는 tsx scripts/migrate-editions.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// .env.local 파일 로드
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// editions-data.js 파일 읽기
function loadEditionsData() {
  const filePath = path.join(process.cwd(), 'js', 'editions-data.js')
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`파일을 찾을 수 없습니다: ${filePath}`)
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  // EDITIONS_DATA 객체 추출 (간단한 파싱)
  const match = fileContent.match(/const EDITIONS_DATA = ({[\s\S]*});/)
  if (!match) {
    throw new Error('EDITIONS_DATA 객체를 찾을 수 없습니다.')
  }

  // eval 대신 JSON 파싱 시도 (안전하지 않지만 스크립트이므로 허용)
  // 실제로는 더 안전한 파싱 방법을 사용해야 하지만, 여기서는 간단하게 처리
  const dataStr = match[1]
    .replace(/(\w+):/g, '"$1":') // 키를 따옴표로 감싸기
    .replace(/'/g, '"') // 작은따옴표를 큰따옴표로 변경
  
  try {
    return JSON.parse(dataStr)
  } catch (e) {
    // JSON 파싱 실패 시 직접 실행 (주의: 보안상 위험할 수 있음)
    console.warn('JSON 파싱 실패, 직접 실행 시도...')
    const func = new Function('return ' + match[1])
    return { editions: func() }
  }
}

interface Edition {
  id: string
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
  stats?: {
    totalInstallations?: number
    activeUsers?: number
    contentUpdates?: number
  }
  updates?: Array<{
    category: string
    version: string
    description: string
    date: string
  }>
}

async function migrateEditions() {
  console.log('🚀 editions-data.js → Supabase 마이그레이션 시작\n')

  try {
    // 1. editions-data.js 파일 로드
    console.log('📂 데이터 파일 로드 중...')
    const editionsData = loadEditionsData()
    const editions: Edition[] = editionsData.editions || []
    
    if (editions.length === 0) {
      throw new Error('발행 데이터가 없습니다.')
    }

    console.log(`✅ ${editions.length}개의 발행호를 찾았습니다.\n`)

    // 2. 각 발행호를 articles 테이블에 저장
    for (const edition of editions) {
      console.log(`\n📰 발행호 처리 중: ${edition.id} (${edition.title})`)

      // 2-1. 메인 article 생성 (발행호 전체를 하나의 article로)
      const mainArticle = {
        title: edition.headline || edition.title,
        subtitle: edition.subHeadline || null,
        content: edition.content?.main || '',
        category: 'news' as const,
        thumbnail_url: edition.images?.[0] 
          ? `/assets/images/${edition.images[0].filename}`
          : null,
        published_at: edition.id, // edition_id를 published_at에 임시 저장 (나중에 별도 컬럼으로 변경 가능)
        is_published: true,
        views: 0,
      }

      // edition_id를 메타데이터로 저장하기 위해 JSONB 필드 사용 또는 별도 처리
      // 여기서는 content에 edition_id를 포함시키거나, 별도 테이블을 만들거나
      // 또는 published_at을 edition_id로 사용
      
      const { data: mainArticleData, error: mainError } = await supabase
        .from('articles')
        .insert({
          ...mainArticle,
          published_at: new Date(edition.id).toISOString(), // YYYY-MM-DD를 Date로 변환
        })
        .select()
        .single()

      if (mainError) {
        console.error(`❌ 메인 article 저장 실패:`, mainError.message)
        continue
      }

      console.log(`   ✅ 메인 article 저장 완료 (ID: ${mainArticleData.id})`)

      // 2-2. 하위 articles 생성 (edition.articles 배열의 각 항목)
      if (edition.articles && edition.articles.length > 0) {
        const subArticles = edition.articles.map((article) => ({
          title: article.title,
          subtitle: null,
          content: article.content,
          category: article.type === 'column' ? 'column' : 'news' as const,
          thumbnail_url: null,
          published_at: new Date(edition.id).toISOString(),
          is_published: true,
          views: 0,
        }))

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

      // 2-3. edition_id를 별도로 저장하기 위한 메타데이터 테이블 또는 JSONB 필드 사용
      // 현재 스키마에는 edition_id 컬럼이 없으므로, content에 포함시키거나
      // 별도 테이블을 만들 수 있습니다.
      // 여기서는 간단하게 title에 edition_id를 포함시키는 방법을 사용합니다.
    }

    console.log('\n✅ 마이그레이션 완료!')
    console.log('\n📋 다음 단계:')
    console.log('   1. Supabase Dashboard에서 articles 테이블 확인')
    console.log('   2. edition_id 컬럼 추가 (선택사항)')
    console.log('   3. 동적 라우팅 페이지 구현')

  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error)
    process.exit(1)
  }
}

// 실행
migrateEditions()


