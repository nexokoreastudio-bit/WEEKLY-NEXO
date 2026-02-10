/**
 * Supabase Storage 버킷 확인 및 생성
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBuckets() {
  console.log('🔄 Supabase Storage 버킷 확인 중...\n')

  // 버킷 목록 조회
  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ 버킷 목록 조회 실패:', error.message)
    process.exit(1)
  }

  console.log(`📋 발견된 버킷: ${buckets.length}개\n`)
  
  buckets.forEach((bucket, index) => {
    console.log(`${index + 1}. ${bucket.name}`)
    console.log(`   - 공개 여부: ${bucket.public ? 'PUBLIC' : 'PRIVATE'}`)
    console.log(`   - 생성일: ${bucket.created_at}`)
    console.log('')
  })

  // insights 버킷 확인
  const insightsBucket = buckets.find(b => b.name === 'insights')
  
  if (!insightsBucket) {
    console.log('⚠️  "insights" 버킷이 없습니다.\n')
    console.log('💡 "insights" 버킷을 생성하시겠습니까?')
    console.log('   스크립트를 실행하면 자동으로 생성됩니다.\n')
    
    // insights 버킷 생성
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('insights', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })

    if (createError) {
      console.error('❌ 버킷 생성 실패:', createError.message)
      console.log('\n💡 Supabase 대시보드에서 수동으로 생성해주세요:')
      console.log('   1. Storage > Buckets 메뉴로 이동')
      console.log('   2. "New bucket" 클릭')
      console.log('   3. 이름: insights')
      console.log('   4. Public bucket 체크')
      console.log('   5. 생성')
    } else {
      console.log('✅ "insights" 버킷 생성 완료!')
    }
  } else {
    console.log('✅ "insights" 버킷이 이미 존재합니다.')
  }

  console.log('\n✨ 완료!')
}

checkBuckets()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
