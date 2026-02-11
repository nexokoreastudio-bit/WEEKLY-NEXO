/**
 * Supabase Storage 'resources' 버킷 생성 스크립트
 * 자료실 기능을 위한 파일 저장소 버킷을 생성합니다.
 * 
 * 실행 방법:
 * node scripts/create-resources-bucket.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createResourcesBucket() {
  console.log('🔄 Supabase Storage "resources" 버킷 확인 및 생성 중...\n')

  // 버킷 목록 조회
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('❌ 버킷 목록 조회 실패:', listError.message)
    process.exit(1)
  }

  // resources 버킷 확인
  const resourcesBucket = buckets.find(bucket => bucket.name === 'resources')

  if (resourcesBucket) {
    console.log('✅ "resources" 버킷이 이미 존재합니다.')
    console.log(`   - 이름: ${resourcesBucket.name}`)
    console.log(`   - 공개 여부: ${resourcesBucket.public ? 'PUBLIC' : 'PRIVATE'}`)
    console.log(`   - 생성일: ${resourcesBucket.created_at}`)
    console.log('\n💡 버킷이 이미 존재하므로 생성하지 않습니다.')
    console.log('   필요시 Supabase Dashboard에서 설정을 확인하세요.')
    return
  }

  console.log('⚠️  "resources" 버킷이 없습니다.')
  console.log('📦 "resources" 버킷을 생성합니다...\n')

  // resources 버킷 생성
  const { data: newBucket, error: createError } = await supabase.storage.createBucket('resources', {
    public: true, // 공개 버킷으로 설정 (모든 사용자가 파일 읽기 가능)
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'application/pdf', // PDF
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel (.xlsx)
      'application/x-hwp', // 한글 (.hwp)
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word (.docx)
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint (.pptx)
    ]
  })

  if (createError) {
    console.error('❌ 버킷 생성 실패:', createError.message)
    console.log('\n💡 Supabase 대시보드에서 수동으로 생성해주세요:')
    console.log('   1. Storage > Buckets 메뉴로 이동')
    console.log('   2. "+ New bucket" 버튼 클릭')
    console.log('   3. 이름: resources')
    console.log('   4. Public bucket: ✅ 체크')
    console.log('   5. File size limit: 50 MB (선택사항)')
    console.log('   6. Allowed MIME types: PDF, Excel, 한글, Word, PowerPoint (선택사항)')
    console.log('   7. "Create bucket" 클릭')
    process.exit(1)
  }

  console.log('✅ "resources" 버킷 생성 완료!')
  console.log(`   - 이름: ${newBucket.name}`)
  console.log(`   - 공개 여부: ${newBucket.public ? 'PUBLIC' : 'PRIVATE'}`)
  console.log('\n📝 다음 단계:')
  console.log('   1. Supabase Dashboard > Storage > resources 버킷으로 이동')
  console.log('   2. "Policies" 탭에서 접근 정책 설정')
  console.log('      - 모든 사용자 읽기 권한 (SELECT)')
  console.log('      - 관리자 업로드 권한 (INSERT)')
  console.log('   3. 또는 scripts/setup-resources-storage-policy.sql 파일 참고')
  console.log('\n✨ 완료!')
}

createResourcesBucket()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
