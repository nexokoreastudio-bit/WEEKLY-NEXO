# 새로운 발행분 추가 가이드

매주 목요일 새로운 전자신문을 발행하기 위한 단계별 가이드입니다.

## 📝 단계별 가이드

### 1단계: `js/editions-data.js` 파일 열기

프로젝트 루트의 `js/editions-data.js` 파일을 엽니다.

### 2단계: 새로운 발행분 데이터 추가

`EDITIONS_DATA.editions` 배열의 **맨 앞**에 새로운 발행분을 추가합니다.

```javascript
const EDITIONS_DATA = {
  "editions": [
    {
      // ⬇️ 여기에 새로운 발행분을 추가하세요 (맨 위에!)
      "id": "2026-02-12",  // YYYY-MM-DD 형식 (목요일 날짜)
      "date": "2026년 2월 12일 목요일",
      "volume": "VOL. 2026-02",
      "title": "이번 주 주요 제목",
      "headline": "메인 헤드라인",
      "subHeadline": "서브 헤드라인 (선택사항)",
      "updates": [
        {
          "category": "소프트웨어",  // 또는 "하드웨어", "서비스", "컨텐츠"
          "version": "UMIND v2.3.0",
          "description": "업데이트 내용 설명",
          "date": "2026-02-10"
        },
        // 더 많은 업데이트 추가 가능
      ],
      "content": {
        "main": "이번 주 주요 내용을 여기에 작성하세요. 넥소의 최신 소식, 제품 업데이트, 이벤트 등을 포함할 수 있습니다.",
        "features": [
          "주요 기능 1",
          "주요 기능 2",
          "주요 기능 3"
        ]
      },
      "stats": {
        "totalInstallations": 170,  // 총 설치 대수
        "activeUsers": 1400,        // 활성 사용자 수
        "contentUpdates": 55         // 컨텐츠 업데이트 횟수
      },
      "achievements": [
        {
          "type": "innovation",  // "innovation", "product", "growth", "partnership"
          "category": "혁신",
          "title": "업적 제목",
          "description": "업적에 대한 상세 설명",
          "date": "2026-02-10",
          "value": "값 또는 숫자",
          "milestone": "이정표"
        },
        // 더 많은 업적 추가 가능 (보통 2-3개)
      ],
      "images": [
        {
          "filename": "2.png",  // assets/images/ 폴더의 파일명
          "alt": "이미지 설명",
          "caption": "이미지 캡션 (선택사항)"
        },
        // 최대 3개까지 추가 가능 (첫 번째는 Hero 이미지, 나머지는 Features 섹션에 표시)
      ]
    },
    // 기존 발행분들은 그대로 유지
    {
      "id": "2026-02-05",
      // ...
    }
  ]
};
```

### 3단계: 필수 필드 확인

다음 필드들은 반드시 포함해야 합니다:

- ✅ `id`: YYYY-MM-DD 형식 (예: "2026-02-12")
- ✅ `date`: 발행일 표시 형식 (예: "2026년 2월 12일 목요일")
- ✅ `volume`: 호수 (예: "VOL. 2026-02")
- ✅ `title`: 제목
- ✅ `headline`: 메인 헤드라인
- ✅ `updates`: 업데이트 배열 (최소 1개)
- ✅ `content`: 콘텐츠 객체
- ✅ `stats`: 통계 객체
- ✅ `achievements`: 업적 배열 (최소 1개)
- ✅ `images`: 이미지 배열 (최대 3개, 선택사항)

### 4단계: 파일 저장 및 확인

1. 파일을 저장합니다.
2. 브라우저에서 `index.html`을 새로고침합니다.
3. 발행일 선택 드롭다운에서 새로 추가한 발행분이 맨 위에 표시되는지 확인합니다.

## 🖼️ 이미지 사용 규칙

- **최대 3개**: 각 발행분에는 최대 3개의 이미지만 사용할 수 있습니다.
- **첫 번째 이미지**: Hero 섹션(상단 큰 이미지)에 표시됩니다.
- **나머지 이미지**: Features 섹션에 표시됩니다 (최대 2개).
- **이미지 형식**: `assets/images/` 폴더에 있는 파일명을 사용하세요.
- **선택사항**: 이미지가 없어도 발행분을 만들 수 있습니다.

### 이미지 배열 예시

```javascript
"images": [
  {
    "filename": "2.png",           // assets/images/2.png
    "alt": "NEXO Smart Display",   // 대체 텍스트
    "caption": "NEXO Smart Display" // 이미지 캡션 (선택사항)
  },
  {
    "filename": "7.png",
    "alt": "UMIND 소프트웨어",
    "caption": "UMIND v2.3.0"
  },
  {
    "filename": "10.png",
    "alt": "AI 기능",
    "caption": "AI 기반 판서"
  }
]
```

## 📋 업데이트 카테고리 종류

- `"소프트웨어"`: UMIND 업데이트, 기능 추가 등
- `"하드웨어"`: 신제품 출시, 하드웨어 업그레이드 등
- `"서비스"`: 새로운 서비스, 프로모션, 이벤트 등
- `"컨텐츠"`: 콘텐츠 업데이트, 자료 추가 등

## 🏆 업적 타입 종류

- `"innovation"`: 혁신적인 기술, 기능 개발
- `"product"`: 신제품 출시, 제품 업그레이드
- `"growth"`: 성장 지표 달성 (설치 대수, 사용자 수 등)
- `"partnership"`: 파트너십, 협력, 제휴

## 💡 Cursor AI 활용 팁

Cursor Chat(Ctrl+L)에서 다음과 같이 요청하면 자동으로 추가해드립니다:

```
이번 주 목요일(2026-02-12) 발행분을 추가해줘.
제목: "넥소 전자칠판, 새로운 기능 출시"
메인 헤드라인: "AI 기반 스마트 판서 기능 강화"
업데이트:
- 소프트웨어: UMIND v2.3.0, 새로운 판서 도구 추가
- 하드웨어: NX-S Series 성능 개선
통계: 설치 170대, 사용자 1400명, 업데이트 55회
업적: 
- UMIND v2.3.0 출시 (혁신)
- 설치 대수 170대 달성 (성장)
```

## ⚠️ 주의사항

1. **배열 순서**: 새로운 발행분은 항상 배열의 **맨 앞**에 추가해야 합니다. (최신순 정렬)
2. **날짜 형식**: `id`는 반드시 YYYY-MM-DD 형식을 사용하세요.
3. **목요일 확인**: 발행일은 항상 목요일이어야 합니다.
4. **JSON 문법**: 쉼표(`,`)와 중괄호(`{}`)를 정확히 사용하세요.
5. **브라우저 캐시**: 변경 후 브라우저를 새로고침(Cmd+Shift+R 또는 Ctrl+Shift+R)하세요.

## 📅 예시: 2026년 2월 12일 발행분 추가

```javascript
{
  "id": "2026-02-12",
  "date": "2026년 2월 12일 목요일",
  "volume": "VOL. 2026-02",
  "title": "넥소 전자칠판, 새로운 기능 출시",
  "headline": "AI 기반 스마트 판서 기능 강화",
  "subHeadline": "더욱 똑똑해진 판서 도구로 교육의 질을 높입니다",
  "updates": [
    {
      "category": "소프트웨어",
      "version": "UMIND v2.3.0",
      "description": "AI 기반 손글씨 인식 정확도 향상 및 새로운 판서 도구 추가",
      "date": "2026-02-10"
    },
    {
      "category": "하드웨어",
      "version": "NX-S Series",
      "description": "터치 반응 속도 20% 개선 및 배터리 수명 연장",
      "date": "2026-02-08"
    }
  ],
  "content": {
    "main": "넥소는 UMIND v2.3.0을 출시하여 AI 기반 손글씨 인식 정확도를 크게 향상시켰습니다. 새로운 판서 도구를 통해 선생님들이 더욱 직관적이고 효율적으로 수업을 진행할 수 있게 되었습니다.",
    "features": [
      "AI 손글씨 인식 정확도 향상",
      "새로운 판서 도구 추가",
      "터치 반응 속도 개선"
    ]
  },
  "stats": {
    "totalInstallations": 170,
    "activeUsers": 1400,
    "contentUpdates": 55
  },
      "achievements": [
        {
          "type": "innovation",
          "category": "혁신",
          "title": "UMIND v2.3.0 AI 판서 기능 강화",
          "description": "AI 기반 손글씨 인식 정확도를 95% 이상으로 향상시켜 더욱 정확한 판서 경험을 제공합니다.",
          "date": "2026-02-10",
          "value": "v2.3.0",
          "milestone": "AI 기술 혁신"
        },
        {
          "type": "growth",
          "category": "성장",
          "title": "설치 대수 170대 달성",
          "description": "전국 교육기관 및 기업에 넥소 전자칠판이 170대 설치되어 스마트 교육 환경 구축에 기여하고 있습니다.",
          "date": "2026-02-12",
          "value": "170대",
          "milestone": "성장 이정표"
        }
      ],
      "images": [
        {
          "filename": "2.png",
          "alt": "NEXO Smart Display",
          "caption": "NEXO Smart Display"
        },
        {
          "filename": "7.png",
          "alt": "UMIND 소프트웨어",
          "caption": "UMIND v2.3.0"
        },
        {
          "filename": "10.png",
          "alt": "AI 기능",
          "caption": "AI 기반 판서"
        }
      ]
}
```

## 🆘 문제 해결

### 발행분이 목록에 나타나지 않을 때
1. 브라우저를 강력 새로고침 (Cmd+Shift+R / Ctrl+Shift+R)
2. JavaScript 문법 오류 확인 (콘솔에서 에러 메시지 확인)
3. `id` 필드가 올바른 형식인지 확인 (YYYY-MM-DD)

### 콘텐츠가 표시되지 않을 때
1. 모든 필수 필드가 포함되어 있는지 확인
2. JSON 문법 오류 확인 (쉼표, 중괄호 등)
3. 브라우저 개발자 도구 콘솔에서 에러 메시지 확인

---

**질문이 있으시면 Cursor Chat에서 언제든지 물어보세요!** 💬
