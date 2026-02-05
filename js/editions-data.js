// 발행 이력 데이터 (CORS 문제 해결을 위해 JavaScript 파일로 변환)
// 참조: Nexo_Content_Hub 기획서, Nexo_web_bro_1 등 워크스페이스 자료 → REFERENCE_CONTENT_FOR_EDITIONS.md
//
// [스키마 확장] 호(edition)별 선택 필드 (없으면 해당 섹션 미표시 — RENEWAL_PLAN.md 하위호환)
// - articles: Array<{ type: 'column'|'news', title, author, content(HTML), tags: string[] }>
// - tools: Array<{ type: 'widget', name, title, icon } | { type: 'download', title, url, fileType }>
//
const EDITIONS_DATA = {
  "editions": [
    {
      "id": "2026-02-05",
      "date": "2026년 2월 5일 목요일",
      "volume": "VOL. 2026-02",
      "title": "전자칠판 활용편 — 아카데미 디자인 공모전 후원과 학원 수업·기술",
      "headline": "전자칠판 활용편 — 아카데미 디자인 공모전 후원과 학원 수업·기술",
      "subHeadline": "330만 원 상당 65인치 전자칠판을 공모전 상품으로 후원했습니다. 고경덕 상무·장형태 이사 칼럼과 학원 이슈·노하우를 담았습니다",
      "leadText": "아카데미 디자인 공모전 후원 — 330만 원 상당 65인치 전자칠판을 수상자 상품으로 지원",
      "content": {
        "main": "<p><strong>넥소(NEXO)가 아카데미 디자인 공모전을 후원했습니다.</strong> 330만 원 상당의 <strong>65인치 전자칠판</strong>을 공모전 수상자에게 전달하는 상품으로 지원하여, 교육 현장과 디자인 분야의 만남을 응원했습니다. 금상 트로피와 NEXO 브랜드가 함께한 이번 후원은 '함께 성장하는 교육 환경'을 지향하는 넥소의 방향과 맞닿아 있습니다.</p>\n\n<p>이번 호는 <strong>전자칠판 활용편</strong>으로 꾸몄습니다. 학원 현장에서 전자칠판을 어떻게 쓰면 좋을지, 기술적으로 어떤 점이 중요한지 넥소 내부 전문가 두 분의 칼럼과 함께 <strong>최근 학원 수업 이슈와 활용 노하우</strong>를 정리했습니다.</p>\n\n<h4>① 학원 수업, 전자칠판으로 이렇게</h4>\n<p>많은 학원에서 전자칠판을 '판서용'으로만 쓰고 계십니다. 하지만 <strong>화면 캡처 후 주석</strong>, <strong>무선 미러링으로 교재·영상 띄우기</strong>, <strong>분할 화면으로 설명과 정리 동시에</strong> 하는 식으로 활용 범위를 넓히면, 설명 시간은 줄이면서 학생 참여는 늘릴 수 있습니다. 고경덕 상무가 학원 수업에 쓸 수 있는 구체적인 포인트를 칼럼에서 소개합니다.</p>\n\n<h4>② 전자칠판, 기술적으로 보면</h4>\n<p>제로갭 본딩, 4K UHD, 무선 미러링, AI 카메라·마이크까지—선생님이 체감하는 '쉽고 선명하고 끊기지 않는' 수업 환경은 어떤 기술이 만드는 걸까요? 장형태 이사가 <strong>화질·터치감·연결·소리</strong> 등 기술적 측면을 쉽게 풀어 쓴 칼럼을 실었습니다.</p>\n\n<h4>③ 최근 학원 이슈·노하우</h4>\n<p>수업 시작 전 <strong>5분 타이머로 집중 분위기</strong> 만들기, 판서 내용을 <strong>QR로 찍어 곧바로 학생에게 전달</strong>하기, <strong>수학·과학 도구</strong>로 그래프·실험 화면을 바로 띄우는 요령 등 학원 현장에서 바로 쓸 수 있는 이슈와 노하우를 업데이트와 뉴스로 모았습니다. 쌤 도구함의 5분 타이머와 다운로드 자료도 함께 활용해 보시기 바랍니다.</p>",
        "features": [
          "아카데미 디자인 공모전 후원 (330만 원 상당 65인치 전자칠판)",
          "고경덕 상무 칼럼: 학원 수업 전자칠판 활용",
          "장형태 이사 칼럼: 전자칠판 기술적 이해",
          "학원 수업 이슈·노하우·5분 타이머·QR 공유"
        ]
      },
      "stats": {
        "totalInstallations": 15100,
        "activeUsers": 3100,
        "contentUpdates": 9
      },
      "updates": [
        {
          "category": "서비스",
          "version": "아카데미 디자인 공모전 후원",
          "description": "330만 원 상당 65인치 전자칠판을 공모전 수상자 상품으로 후원",
          "date": "2026-02-05"
        },
        {
          "category": "컨텐츠",
          "version": "전자칠판 활용편 특집",
          "description": "학원 수업 활용 칼럼(고경덕 상무), 기술 칼럼(장형태 이사) 및 학원 이슈·노하우 콘텐츠 업데이트",
          "date": "2026-02-05"
        },
        {
          "category": "소프트웨어",
          "version": "UMIND 수업 활용 팁",
          "description": "수업 전 5분 타이머·판서 QR 공유·수학/과학 도구 활용 등 학원 현장 노하우 반영",
          "date": "2026-02-05"
        },
        {
          "category": "컨텐츠",
          "version": "학원 수업 이슈 정리",
          "description": "집중도 향상, 자료 전달 속도, 디지털 교구 활용 등 최근 학원 수업 트렌드 정리",
          "date": "2026-02-05"
        }
      ],
      "achievements": [
        {
          "type": "partnership",
          "category": "협력",
          "title": "아카데미 디자인 공모전 후원",
          "description": "330만 원 상당 65인치 전자칠판을 공모전 수상자 상품으로 후원하여 교육·디자인 분야를 응원했습니다.",
          "date": "2026-02-05",
          "value": "65인치 전자칠판",
          "milestone": "공모전 후원"
        },
        {
          "type": "innovation",
          "category": "혁신",
          "title": "전자칠판 활용편 정기 편성",
          "description": "학원 수업 활용과 기술 해설을 한 호에 모아 선생님들이 쉽게 참고할 수 있도록 했습니다.",
          "date": "2026-02-05",
          "value": "활용편",
          "milestone": "콘텐츠 체계화"
        },
        {
          "type": "product",
          "category": "제품",
          "title": "학원 현장 노하우 연계",
          "description": "5분 타이머, QR 공유, 수학·과학 도구 등 UMIND 기능과 학원 수업 팁을 연계해 제공합니다.",
          "date": "2026-02-05",
          "value": "노하우 연계",
          "milestone": "활용도 제고"
        }
      ],
      "images": [
        {
          "filename": "academy-contest-nexo.png",
          "alt": "NEXO 아카데미 디자인 공모전 후원 — 330만 원 상당 65인치 전자칠판",
          "caption": "아카데미 디자인 공모전 후원 — 330만 원 상당 65인치 전자칠판을 상품으로 지원"
        }
      ],
      "articles": [
        {
          "type": "news",
          "title": "넥소, 아카데미 디자인 공모전에 330만 원 상당 65인치 전자칠판 후원",
          "author": "넥소 에디터",
          "content": "<p>넥소가 <strong>아카데미 디자인 공모전</strong>을 후원하며 330만 원 상당의 <strong>65인치 전자칠판</strong>을 수상자 상품으로 지원했습니다. 교육 현장과 디자인의 만남을 응원하는 후원으로, NEXO 브랜드와 트로피가 함께한 의미 있는 공모전이 되었습니다.</p>",
          "tags": ["공모전", "후원", "전자칠판", "65인치"]
        },
        {
          "type": "column",
          "title": "학원 수업, 전자칠판으로 이렇게 써보세요",
          "author": "고경덕 상무",
          "content": "<p>전자칠판을 '판서만 하는 칠판'으로 쓰시는 학원이 많습니다. 그대로도 좋지만, 한 단계만 더 쓰시면 수업 효율이 확 달라집니다.</p><p><strong>① 수업 시작 5분</strong> — 타이머를 켜두고 '이 시간만 집중' 구간을 정해 주세요. 아이들이 습관이 되면 수업 몰입도가 올라갑니다.</p><p><strong>② 교재·영상은 무선 미러링으로</strong> — 노트북이나 태블릿 화면을 전자칠판에 띄워서 교재와 영상을 보여 주시고, 그 위에 바로 필기하시면 됩니다. 선 잡고 연결하는 시간이 없어집니다.</p><p><strong>③ 판서는 QR로 바로 전달</strong> — 정리한 판서를 QR로 만들어 학생에게 보내 주시면, 복습과 숙제 확인이 훨씬 수월합니다.</p><p><strong>④ 수학·과학은 전용 도구 활용</strong> — 함수·그래프, 실험 도구를 전자칠판에서 바로 띄워 쓰시면 설명이 짧아지고 이해도는 좋아집니다.</p><p>우선 한 가지부터 시도해 보시고, 익숙해지면 하나씩 더 붙여 보시길 권합니다.</p>",
          "tags": ["학원 수업", "활용", "고경덕 상무"]
        },
        {
          "type": "column",
          "title": "전자칠판, 기술적으로 보면",
          "author": "장형태 이사",
          "content": "<p>선생님들이 '선명하고, 쓰기 편하고, 끊기지 않는다'고 하시는 부분은 결국 몇 가지 기술이 맞물려 나온 결과입니다.</p><p><strong>① 화질 — 4K UHD</strong> — 작은 글씨와 그래프까지 뒤줄에서도 잘 보이려면 해상도가 중요합니다. 4K 패널과 적절한 밝기(니트)로 밝은 교실에서도 가독성을 확보했습니다.</p><p><strong>② 터치감 — 제로갭 본딩</strong> — 패널과 유리 사이 간격을 없애서 펜이 화면에 '닿는' 느낌이 나도록 했습니다. 반응 속도도 2ms 미만으로 맞춰 끊김 없는 필기가 가능합니다.</p><p><strong>③ 연결 — 무선 미러링</strong> — 최대 9대 기기 동시 연결, QR 한 번에 연결, Windows·Mac·Android·iOS 모두 지원합니다. 케이블 없이 교재·영상을 칠판에 띄울 수 있습니다.</p><p><strong>④ 소리·참여 — AI 카메라·마이크</strong> — 원격·녹화 시 선명한 영상과 음성, 그리고 멀티 터치로 여러 명이 동시에 판서할 수 있게 했습니다. 기술이 수업 환경 하나하나에 녹아 있다고 보시면 됩니다.</p>",
          "tags": ["기술", "4K", "제로갭", "장형태 이사"]
        },
        {
          "type": "news",
          "title": "수업 전 5분, 타이머로 집중 분위기 만들기",
          "author": "넥소 에디터",
          "content": "<p>많은 학원에서 <strong>수업 시작 직후 5분</strong>을 '집중 구간'으로 정해 두고 타이머를 사용합니다. 전자칠판에 타이머를 띄워 두면 아이들이 '이 시간만큼은 집중'하는 습관이 생기고, 수업 몰입도가 올라간다는 후기가 많습니다. 쌤 도구함의 5분 타이머를 한 번 써 보시길 권합니다.</p>",
          "tags": ["학원", "집중", "타이머", "노하우"]
        },
        {
          "type": "news",
          "title": "판서 QR 공유로 복습·숙제 확인까지",
          "author": "넥소 에디터",
          "content": "<p>전자칠판의 <strong>판서 내용을 QR 코드로 생성</strong>해 학생에게 전달하는 활용이 늘고 있습니다. 수업 끝에 QR 한 번이면 정리본을 받을 수 있어 복습과 숙제 확인이 쉬워지고, 부재 학생에게도 같은 자료를 바로 전달할 수 있습니다.</p>",
          "tags": ["QR", "판서", "복습", "노하우"]
        }
      ],
      "tools": [
        {
          "type": "widget",
          "name": "timer",
          "title": "5분 집중 타이머",
          "icon": "⏰"
        },
        {
          "type": "download",
          "title": "수업 준비 체크리스트 (준비중)",
          "url": "#",
          "fileType": "PDF"
        },
        {
          "type": "download",
          "title": "상담 체크리스트 (준비중)",
          "url": "#",
          "fileType": "PDF"
        }
      ]
    },
    {
      "id": "2026-01-29",
      "date": "2026년 1월 29일 목요일",
      "volume": "VOL. 2026-01",
      "title": "K-AI 미래를 위한 새로운 표준, NEXO 스마트 디스플레이",
      "headline": "K-AI 미래를 위한 새로운 표준, NEXO 스마트 디스플레이",
      "subHeadline": "기업과 교육 환경의 수준을 높이는 혁신적인 All-in-One 솔루션",
      "content": {
        "main": "<p>넥소(NEXO) 스마트 디스플레이는 단순한 전자칠판을 넘어 <strong>K-AI 시대를 선도하는 혁신적인 All-in-One 솔루션</strong>입니다.</p>\n\n<p><strong>🤖 OpenAI ChatGPT 탑재</strong><br>실시간 피드백과 개인 맞춤형 학습을 지원하는 AI 파트너로 진화했습니다.</p>\n\n<p><strong>⚡ 고성능 옥타코어 칩셋 적용</strong><br>대용량 문서와 고화질 영상도 끊김 없이 구동되는 업계 최고 수준의 응답 속도를 구현했습니다.</p>\n\n<h4>① 복잡한 장비가 하나로, All-in-One 솔루션</h4>\n<p>별도의 PC나 마이크, 카메라 연결 없이 넥소 하나로 모든 환경이 완성됩니다.</p>\n<ul>\n<li><strong>PC:</strong> 고성능 옥타코어 컴퓨터 내장</li>\n<li><strong>Display:</strong> 4K UHD 초고화질 패널 (3840 x 2160P, 450nits)</li>\n<li><strong>Camera:</strong> 4,800만 화소 AI 카메라 (120도 시야각 FOV)</li>\n<li><strong>Sound:</strong> 8개 어레이 고성능 마이크 및 스피커</li>\n</ul>\n\n<h4>② 아날로그의 필기감, 디지털의 강력함</h4>\n<p><strong>제로갭 본딩(Zero-Gap Bonding)</strong><br>패널과 유리 사이의 간격을 없애 실제 종이에 쓰는 듯한 정밀한 터치감을 제공합니다 (응답속도 2ms 미만).</p>\n<p><strong>최상위 등급 강화유리</strong><br>무반사(Anti-glare) 처리와 경도 9H의 고강도 유리를 적용하여 시력을 보호하고 스크래치를 방지합니다.</p>\n<p><strong>50포인트 멀티 터치</strong><br>여러 명이 동시에 판서해도 끊김 없는 협업이 가능합니다.</p>\n\n<h4>③ 선 없는 자유, 강력한 무선 미러링</h4>\n<p><strong>9개 기기 동시 연결</strong><br>노트북, 태블릿, 스마트폰 등 최대 9대 디바이스를 동시에 미러링할 수 있습니다.</p>\n<p><strong>양방향 제어</strong><br>미러링된 화면을 전자칠판에서 직접 제어할 수 있어 발표 효율이 극대화됩니다.</p>\n<p><strong>모든 OS 지원</strong><br>Windows, Mac, Android, iOS 등 운영체제 구분 없이 QR 코드 스캔 한 번으로 연결됩니다.</p>\n\n<p><strong>🏆 전국 학원 납품 1위</strong><br>메가스터디, EBS, 종로학원, 대성학원 등 수많은 교육 전문가들이 선택한 검증된 솔루션입니다.</p>\n\n<p><strong>공인된 기술력</strong><br>여성기업 및 중소벤처기업부 인증 중소기업으로서 관공서, 기업, 대학교에 압도적인 설치 실적을 보유하고 있습니다.</p>",
        "features": [
          "All-in-One 솔루션 (PC + Display + Camera + Sound)",
          "제로갭 본딩 & 무반사 강화유리",
          "9개 기기 동시 무선 미러링",
          "OpenAI ChatGPT 탑재",
          "고성능 옥타코어 칩셋",
          "UMIND 판서 소프트웨어 고도화"
        ]
      },
      "stats": {
        "totalInstallations": 15000,
        "activeUsers": 3000,
        "contentUpdates": 5
      },
      "updates": [
        {
          "category": "소프트웨어",
          "version": "OpenAI ChatGPT 탑재",
          "description": "단순한 디스플레이를 넘어 실시간 피드백과 개인 맞춤형 학습을 지원하는 AI 파트너로 진화했습니다.",
          "date": "2026-01-29"
        },
        {
          "category": "하드웨어",
          "version": "고성능 옥타코어 칩셋 적용",
          "description": "대용량 문서와 고화질 영상도 끊김 없이 구동되는 업계 최고 수준의 응답 속도를 구현했습니다.",
          "date": "2026-01-29"
        },
        {
          "category": "소프트웨어",
          "version": "UMIND 판서 소프트웨어 고도화",
          "description": "수학(함수/그래프), 과학(실험 도구) 등 교육 특화 도구와 무한 판서 캔버스를 기본 제공합니다.",
          "date": "2026-01-29"
        }
      ],
      "achievements": [
        {
          "type": "growth",
          "category": "성장",
          "title": "전국 학원 납품 1위",
          "description": "메가스터디, EBS, 종로학원, 대성학원 등 수많은 교육 전문가들이 선택한 검증된 솔루션입니다.",
          "date": "2026-01-29",
          "value": "납품 1위",
          "milestone": "시장 리더십"
        },
        {
          "type": "partnership",
          "category": "협력",
          "title": "공인된 기술력",
          "description": "여성기업 및 중소벤처기업부 인증 중소기업으로서 관공서, 기업, 대학교에 압도적인 설치 실적을 보유하고 있습니다.",
          "date": "2026-01-29",
          "value": "인증 기업",
          "milestone": "신뢰성 확보"
        },
        {
          "type": "innovation",
          "category": "혁신",
          "title": "K-AI 미래를 위한 새로운 표준",
          "description": "OpenAI ChatGPT 탑재와 고성능 옥타코어 칩셋으로 AI 시대를 선도하는 혁신적인 All-in-One 솔루션을 제공합니다.",
          "date": "2026-01-29",
          "value": "K-AI 표준",
          "milestone": "기술 혁신"
        }
      ],
      "images": [
        {
          "filename": "2.png",
          "alt": "NEXO 스마트 디스플레이 - K-AI 미래를 위한 새로운 표준",
          "caption": "NEXO를 선택한 학원들"
        }
      ]
    }
  ]
};
