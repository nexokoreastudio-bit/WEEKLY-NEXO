/**
 * 2026학년도 입시 정책 자료를 자료실에 추가하는 스크립트
 * 
 * 실행 방법:
 * 1. 입시 정책 파일을 준비 (PDF, Excel, 한글 등)
 * 2. 파일을 Supabase Storage의 'resources' 버킷에 업로드
 * 3. 이 스크립트를 실행하여 DB에 자료 정보 등록
 * 
 * 또는 관리자 페이지(/admin/resources/write)에서 직접 등록 가능
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 입시 정책 자료 정보
const admissionPolicyResources = [
  {
    title: '2026학년도 대학입시 정책 가이드',
    description: `2026학년도 대학입시 전반에 대한 정책을 정리한 가이드입니다.

주요 내용:
- 2026학년도 입시 일정 및 주요 변경사항
- 수시/정시 모집 요강 핵심 정리
- 학생부 종합전형 평가 기준
- 논술 및 면접 준비 가이드
- 주요 대학별 입시 전형 안내

학원장님들이 학부모 상담 시 활용하실 수 있는 실용적인 자료입니다.`,
    file_url: '', // Supabase Storage URL을 여기에 입력하세요
    file_type: 'pdf' as const,
    access_level: 'bronze' as const, // 브론즈 레벨부터 접근 가능
    download_cost: 0, // 무료
  },
  {
    title: '2026학년도 입시 정책 변경사항 요약표',
    description: `2026학년도 입시 정책의 주요 변경사항을 한눈에 볼 수 있는 요약표입니다.

Excel 형식으로 제공되어 학원 운영 자료로 바로 활용하실 수 있습니다.

포함 내용:
- 전년 대비 주요 변경사항 비교
- 대학별 전형 방법 변경 내역
- 학생부 반영 비율 변화
- 수능 최저학력기준 변경사항`,
    file_url: '', // Supabase Storage URL을 여기에 입력하세요
    file_type: 'xlsx' as const,
    access_level: 'bronze' as const,
    download_cost: 0, // 무료
  },
  {
    title: '학부모 상담용 입시 정책 설명 자료',
    description: `학부모님들께 입시 정책을 설명하실 때 사용하실 수 있는 상담 자료입니다.

한글 문서 형식으로 제공되며, 학원 상황에 맞게 수정하여 사용하실 수 있습니다.

포함 내용:
- 입시 정책 핵심 포인트 정리
- 학부모 FAQ 및 답변 예시
- 학생별 맞춤 상담 가이드
- 입시 일정 체크리스트`,
    file_url: '', // Supabase Storage URL을 여기에 입력하세요
    file_type: 'hwp' as const,
    access_level: 'bronze' as const,
    download_cost: 0, // 무료
  },
]

async function addAdmissionPolicyResources() {
  console.log('📚 2026학년도 입시 정책 자료 추가 시작...\n')

  try {
    for (const resource of admissionPolicyResources) {
      // file_url이 비어있으면 스킵
      if (!resource.file_url) {
        console.log(`⏭️  건너뛰기: "${resource.title}" (파일 URL이 없습니다)`)
        console.log(`   💡 파일을 Supabase Storage에 업로드한 후 file_url을 입력하세요.\n`)
        continue
      }

      // 기존 자료 확인 (제목으로)
      const { data: existing } = await supabase
        .from('resources')
        .select('id, title')
        .eq('title', resource.title)
        .single()

      if (existing) {
        console.log(`⚠️  이미 존재: "${resource.title}" (ID: ${existing.id})`)
        continue
      }

      // 자료 등록
      const { data, error } = await supabase
        .from('resources')
        .insert({
          title: resource.title,
          description: resource.description,
          file_url: resource.file_url,
          file_type: resource.file_type,
          access_level: resource.access_level,
          download_cost: resource.download_cost,
          downloads_count: 0,
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ 등록 실패: "${resource.title}"`, error.message)
        continue
      }

      console.log(`✅ 등록 완료: "${resource.title}" (ID: ${data.id})`)
    }

    console.log('\n✅ 완료!')
    console.log('\n📝 다음 단계:')
    console.log('   1. 입시 정책 파일을 준비하세요')
    console.log('   2. Supabase Storage의 "resources" 버킷에 파일을 업로드하세요')
    console.log('   3. 업로드된 파일의 공개 URL을 스크립트의 file_url에 입력하세요')
    console.log('   4. 또는 관리자 페이지(/admin/resources/write)에서 직접 등록하세요\n')

  } catch (error: any) {
    console.error('❌ 오류 발생:', error)
  }
}

// 실행
addAdmissionPolicyResources()
