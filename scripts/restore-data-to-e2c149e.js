/**
 * 데이터베이스를 커밋 e2c149e 상태로 되돌리는 스크립트
 * 
 * 이 스크립트는 e2c149e 이후의 데이터 변경사항을 되돌립니다:
 * - 2월 7일, 8일 발행물이 삭제되었다면 복원 (실제로 삭제되었는지 확인 필요)
 * - 다른 데이터 변경사항 확인 및 복원
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function restoreDataToE2c149e() {
  console.log('🔄 데이터베이스를 커밋 e2c149e 상태로 되돌리는 중...\n')

  try {
    // 1. 현재 데이터 상태 확인
    console.log('📊 현재 데이터 상태 확인 중...\n')
    
    // 2월 7일, 8일 데이터 확인
    const { data: feb7Articles } = await supabase
      .from('articles')
      .select('id, edition_id, title')
      .in('edition_id', ['2026-02-07', '2026-02-08'])

    const { data: feb7Insights } = await supabase
      .from('insights')
      .select('id, title, published_at, edition_id')
      .or('published_at.gte.2026-02-07T00:00:00Z,published_at.lt.2026-02-09T00:00:00Z,edition_id.in.(2026-02-07,2026-02-08)')

    console.log(`📰 2월 7일, 8일 Articles: ${feb7Articles?.length || 0}개`)
    if (feb7Articles && feb7Articles.length > 0) {
      feb7Articles.forEach(article => {
        console.log(`   - ${article.edition_id}: ${article.title}`)
      })
    }

    console.log(`💡 2월 7일, 8일 Insights: ${feb7Insights?.length || 0}개`)
    if (feb7Insights && feb7Insights.length > 0) {
      feb7Insights.forEach(insight => {
        console.log(`   - #${insight.id}: ${insight.title} (${insight.published_at || insight.edition_id})`)
      })
    }

    // 2. e2c149e 커밋 시점의 상태로 되돌리기
    // 주의: 실제로 삭제된 데이터가 있다면 복원할 수 없습니다.
    // 이 스크립트는 현재 상태를 확인하고, 필요시 수동으로 복원해야 합니다.
    
    console.log('\n============================================================')
    console.log('ℹ️  참고사항:')
    console.log('============================================================')
    console.log('1. Git은 코드만 관리하며 데이터베이스는 관리하지 않습니다.')
    console.log('2. 삭제된 데이터는 자동으로 복원할 수 없습니다.')
    console.log('3. 데이터베이스 백업이 있다면 복원하세요.')
    console.log('4. Supabase Dashboard > Database > Backups에서 백업을 확인하세요.')
    console.log('\n현재 상태:')
    console.log(`- 2월 7일, 8일 Articles: ${feb7Articles?.length || 0}개 존재`)
    console.log(`- 2월 7일, 8일 Insights: ${feb7Insights?.length || 0}개 존재`)
    
    if ((feb7Articles && feb7Articles.length > 0) || (feb7Insights && feb7Insights.length > 0)) {
      console.log('\n✅ 2월 7일, 8일 데이터가 아직 존재합니다.')
      console.log('   데이터 삭제는 실행되지 않았거나 이미 복원되었습니다.')
    } else {
      console.log('\n⚠️  2월 7일, 8일 데이터가 없습니다.')
      console.log('   삭제 스크립트가 실행되었거나 원래 없었을 수 있습니다.')
      console.log('   필요시 Supabase 백업에서 복원하세요.')
    }

    console.log('\n============================================================')
    console.log('✅ 데이터 상태 확인 완료')
    console.log('============================================================')

  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

restoreDataToE2c149e()
