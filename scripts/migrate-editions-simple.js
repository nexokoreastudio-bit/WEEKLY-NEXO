/**
 * 간단한 버전의 마이그레이션 스크립트 (CommonJS)
 * Node.js에서 직접 실행 가능
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

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

// editions-data.js 파일 로드
function loadEditionsData() {
  const filePath = path.join(process.cwd(), 'js', 'editions-data.js')
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`파일을 찾을 수 없습니다: ${filePath}`)
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const match = fileContent.match(/const EDITIONS_DATA\s*=\s*({[\s\S]*});/)
  
  if (!match) {
    throw new Error('EDITIONS_DATA 객체를 찾을 수 없습니다.')
  }

  const dataStr = match[1]
  const context = { EDITIONS_DATA: null }
  vm.createContext(context)
  
  const code = `EDITIONS_DATA = ${dataStr}`
  vm.runInContext(code, context)
  
  return context.EDITIONS_DATA
}

async function migrateEditions() {
  console.log('🚀 editions-data.js → Supabase 마이그레이션 시작\n')
  console.log('='.repeat(60))

  try {
    console.log('\n📂 1단계: 데이터 파일 로드 중...')
    const editionsData = loadEditionsData()
    const editions = editionsData.editions || []
    
    if (editions.length === 0) {
      throw new Error('발행 데이터가 없습니다.')
    }

    console.log(`✅ ${editions.length}개의 발행호를 찾았습니다:`)
    editions.forEach((ed, idx) => {
      console.log(`   ${idx + 1}. ${ed.id} - ${ed.title}`)
    })

    console.log('\n📊 2단계: 기존 데이터 확인 중...')
    const { data: existingArticles } = await supabase
      .from('articles')
      .select('edition_id')
      .not('edition_id', 'is', null)

    const existingEditionIds = new Set(
      existingArticles?.map(a => a.edition_id) || []
    )

    console.log(`   기존 발행호: ${existingEditionIds.size}개`)

    console.log('\n📰 3단계: 발행호 데이터 마이그레이션 중...\n')
    
    let successCount = 0
    let skipCount = 0

    for (const edition of editions) {
      const editionId = edition.id

      if (existingEditionIds.has(editionId)) {
        console.log(`⏭️  [${editionId}] 이미 존재함 - 건너뜀`)
        skipCount++
        continue
      }

      console.log(`\n📰 [${editionId}] ${edition.title}`)
      console.log(`   날짜: ${edition.date}`)
      console.log(`   호수: ${edition.volume}`)

      try {
        // 메인 article 생성
        const mainArticle = {
          title: edition.headline || edition.title,
          subtitle: edition.subHeadline || null,
          content: edition.content?.main || '',
          category: 'news',
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

        // 하위 articles 생성
        if (edition.articles && edition.articles.length > 0) {
          const subArticles = edition.articles.map((article) => ({
            title: article.title,
            subtitle: null,
            content: article.content,
            category: article.type === 'column' ? 'column' : 'news',
            thumbnail_url: null,
            edition_id: editionId,
            published_at: new Date(editionId).toISOString(),
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

        successCount++

      } catch (error) {
        console.error(`   ❌ [${editionId}] 처리 실패:`, error.message)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 마이그레이션 결과 요약')
    console.log('='.repeat(60))
    console.log(`✅ 성공: ${successCount}개`)
    console.log(`⏭️  건너뜀: ${skipCount}개`)
    console.log(`📝 총 처리: ${editions.length}개`)

    console.log('\n✅ 마이그레이션 완료!')

  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

migrateEditions().catch(console.error)


