/**
 * 커뮤니티 활성화를 위한 샘플 게시글 생성 스크립트
 * 실행 방법: npx tsx scripts/create-sample-posts.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 샘플 게시글 데이터
const samplePosts = [
  // 자유게시판 (4개)
  {
    board_type: 'free',
    title: '넥소 전자칠판 도입 후 학원 분위기가 완전히 바뀌었어요',
    content: `안녕하세요! 작년 말에 넥소 전자칠판을 도입한 학원장입니다.

처음에는 투자 비용이 부담스러웠는데, 지금 생각해보니 정말 잘한 결정이었어요.

학생들의 집중도가 확실히 높아졌고, 특히 수학 문제 풀이할 때 화면에 바로 그려가며 설명하니까 이해도가 훨씬 좋아졌어요.

학부모님들도 수업 모습을 보고 만족도가 높아지셨다고 하시더라구요.

혹시 도입을 고려 중이신 분들 계시면 강력 추천드립니다!`,
  },
  {
    board_type: 'free',
    title: '학원 운영하면서 느낀 점들',
    content: `학원을 운영한 지 벌써 5년이 넘었네요.

처음에는 정말 막막했는데, 요즘은 조금씩 여유가 생기면서 학원 운영의 재미를 느끼고 있어요.

특히 학생들이 성적이 오르거나 목표를 달성했을 때의 그 기쁨이 정말 크더라구요.

다만 여전히 어려운 점도 많아요. 학부모 상담이나 커리큘럼 구성 등은 항상 고민이 되는 부분이에요.

같은 학원장 분들과 정보 공유하면서 많이 배우고 있습니다.`,
  },
  {
    board_type: 'free',
    title: '신학기 준비 어떻게 하고 계신가요?',
    content: `벌써 2월이네요. 곧 신학기가 시작되는데 준비하시는 분들 많으실 것 같아요.

저희 학원에서는 신학기 맞이 이벤트를 준비하고 있어요. 신규 입학생들 대상으로 특별 할인도 하고요.

그리고 커리큘럼도 새롭게 업데이트했어요. 작년 수강생들의 피드백을 반영해서 더 실용적인 내용으로 구성했어요.

다른 학원장 분들은 어떤 준비를 하고 계신지 궁금하네요. 좋은 아이디어 있으시면 공유해주세요!`,
  },
  {
    board_type: 'free',
    title: '학생 관리 팁 공유합니다',
    content: `학원 운영하면서 학생 관리가 가장 어려운 부분 중 하나인 것 같아요.

저는 개별 상담을 정기적으로 하는 것을 추천드려요. 한 달에 한 번씩이라도 학생과 1:1로 대화하는 시간을 가지면 정말 도움이 많이 됩니다.

학생의 고민이나 목표를 직접 들어보고, 그에 맞는 학습 계획을 함께 세우는 거죠.

그리고 학부모님들과도 소통을 자주 하시는 게 좋아요. 학생의 학습 상황을 공유하고, 집에서도 도울 수 있는 방법을 함께 고민하시면 효과가 배가 되더라구요.

혹시 다른 좋은 방법들 있으시면 댓글로 알려주세요!`,
  },
  
  // Q&A (3개)
  {
    board_type: 'qna',
    title: '넥소 전자칠판 화면이 안 나올 때 어떻게 해결하나요?',
    content: `안녕하세요. 넥소 전자칠판을 사용 중인데 가끔 화면이 안 나올 때가 있어요.

케이블 연결은 확인했는데도 안 되더라구요. 혹시 해결 방법 아시는 분 계신가요?

재부팅을 하면 해결되는 경우도 있긴 한데, 수업 중에 그렇게 하기엔 시간이 아까워서요.

더 간단한 해결 방법이 있을까요?`,
  },
  {
    board_type: 'qna',
    title: '학원 등록금 정책 어떻게 하시나요?',
    content: `신규 학원을 운영하게 되었는데, 등록금 정책을 어떻게 정해야 할지 고민이에요.

지역 학원들의 평균 가격을 조사해봤는데, 가격대가 정말 다양하더라구요.

너무 비싸면 학생들이 오지 않고, 너무 싸면 운영이 어려울 것 같고...

경험이 있으신 분들 조언 부탁드립니다!`,
  },
  {
    board_type: 'qna',
    title: '온라인 수업과 오프라인 수업 병행 어떻게 하시나요?',
    content: `요즘 온라인 수업을 병행하는 학원들이 많더라구요.

저희 학원도 온라인 수업을 도입하려고 하는데, 어떤 플랫폼을 사용하는 게 좋을까요?

그리고 오프라인 수업과 온라인 수업의 커리큘럼을 어떻게 구성하시는지도 궁금해요.

온라인 수업 경험이 있으신 분들 조언 부탁드립니다!`,
  },
  
  // 팁 & 노하우 (3개)
  {
    board_type: 'tip',
    title: '학생 집중도 높이는 수업 팁',
    content: `수업 중 학생들의 집중도를 높이는 몇 가지 팁을 공유합니다.

1. **시각적 자료 활용**: 넥소 전자칠판을 활용해서 화면에 그림이나 그래프를 바로 그려가며 설명하면 집중도가 확실히 높아집니다.

2. **질문 유도**: 일방적으로 설명만 하지 말고, 중간중간 학생들에게 질문을 던져서 참여를 유도하세요.

3. **짧은 휴식**: 50분 수업이라면 중간에 2-3분 정도 짧은 휴식 시간을 주는 것도 좋아요.

4. **실생활 연계**: 배운 내용을 실생활과 연계해서 설명하면 이해도가 높아집니다.

이런 방법들을 적용하니 수업 분위기가 훨씬 좋아졌어요. 다른 좋은 팁 있으시면 공유해주세요!`,
  },
  {
    board_type: 'tip',
    title: '학부모 상담 시 유의사항',
    content: `학부모 상담은 학원 운영에서 정말 중요한 부분이에요. 몇 가지 팁을 공유합니다.

**상담 전 준비**
- 학생의 학습 현황, 성적 변화, 수업 태도 등을 미리 정리해두세요.
- 구체적인 데이터를 보여드리면 신뢰도가 높아집니다.

**상담 시 주의사항**
- 학생의 문제점만 지적하지 말고, 개선 방안도 함께 제시하세요.
- 학부모님의 의견도 경청하고, 함께 해결책을 모색하는 자세가 중요해요.

**상담 후**
- 상담 내용을 간단히 메모해두고, 다음 상담 때 참고하세요.
- 약속한 사항은 반드시 지키는 것이 신뢰를 쌓는 데 도움이 됩니다.

이런 점들을 신경 쓰니 학부모님들과의 관계가 훨씬 좋아졌어요.`,
  },
  {
    board_type: 'tip',
    title: '효과적인 숙제 관리 방법',
    content: `학생들의 숙제 관리는 정말 어려운 부분이에요. 저희 학원에서 효과가 좋았던 방법을 공유합니다.

**1. 숙제 체크 앱 활용**
- 숙제 제출 여부를 앱으로 관리하면 한눈에 파악하기 쉬워요.
- 미제출 학생에게 자동으로 알림이 가도록 설정할 수도 있어요.

**2. 숙제 난이도 조절**
- 너무 어렵거나 너무 쉬운 숙제는 오히려 역효과가 있어요.
- 학생 수준에 맞는 적절한 난이도의 숙제를 내는 게 중요해요.

**3. 피드백 제공**
- 숙제를 단순히 체크만 하지 말고, 틀린 문제에 대한 피드백을 제공하세요.
- 학생들이 왜 틀렸는지 이해할 수 있도록 설명해주면 학습 효과가 배가 됩니다.

**4. 보상 시스템**
- 숙제를 잘 해온 학생들에게는 작은 보상(스티커, 포인트 등)을 주는 것도 좋아요.
- 동기부여에 도움이 됩니다.

이런 방법들로 숙제 제출률이 크게 향상되었어요!`,
  },
]

async function createSamplePosts() {
  try {
    // 기존 사용자 중 하나를 찾거나, 관리자 계정 사용
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, nickname')
      .limit(1)

    if (userError || !users || users.length === 0) {
      console.error('사용자를 찾을 수 없습니다. 먼저 사용자를 생성해주세요.')
      process.exit(1)
    }

    const authorId = users[0].id
    console.log(`작성자: ${users[0].nickname || '익명'} (${authorId})`)

    // 각 게시글 생성
    const results = []
    for (const post of samplePosts) {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          board_type: post.board_type,
          title: post.title,
          content: post.content,
          author_id: authorId,
          likes_count: Math.floor(Math.random() * 10), // 0-9 랜덤 좋아요
          comments_count: Math.floor(Math.random() * 5), // 0-4 랜덤 댓글
        })
        .select()
        .single()

      if (error) {
        console.error(`게시글 생성 실패 (${post.title}):`, error.message)
        results.push({ success: false, title: post.title, error: error.message })
      } else {
        console.log(`✓ 생성 완료: ${post.title}`)
        results.push({ success: true, title: post.title, id: data.id })
      }

      // API 호출 제한을 피하기 위해 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // 결과 요약
    console.log('\n=== 생성 결과 ===')
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    console.log(`성공: ${successCount}개`)
    console.log(`실패: ${failCount}개`)

    if (failCount > 0) {
      console.log('\n실패한 게시글:')
      results.filter(r => !r.success).forEach(r => {
        console.log(`- ${r.title}: ${r.error}`)
      })
    }

    console.log('\n샘플 게시글 생성이 완료되었습니다!')
  } catch (error: any) {
    console.error('오류 발생:', error.message)
    process.exit(1)
  }
}

// 스크립트 실행
createSamplePosts()
