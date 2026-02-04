# NEXO Weekly - 전자신문 플랫폼

**넥소의 전자신문 플랫폼**: 매주 목요일마다 넥소의 모든 정보와 컨텐츠를 소개하고 이벤트를 진행하는 디지털 미디어 플랫폼입니다.

전자칠판 = 전자신문의 개념을 실현하여, 매주 목요일 정기적으로 발행되는 넥소의 공식 정보 전달 채널입니다.

## 프로젝트 정보

- **회사**: (주)넥소
- **커뮤니티**: 카카오톡 단톡방 (2026노원지구협력업체)
- **목적**: 넥소의 전자신문 플랫폼으로서 매주 목요일 정기 발행, 정보 전달, 이벤트 진행, 커뮤니티 소통
- **플랫폼 정체성**: 전자칠판 = 전자신문 | 매주 목요일, 정보의 새로운 전달 방식
- **발행일**: 매주 목요일
- **웹사이트**: nexokorea.co.kr
- **블로그**: https://blog.naver.com/nexokorea

## 진행중인 이벤트

- **공동구매 랜딩페이지**: https://smmt.kr/2026_nexo
- **공동구매 오픈채팅방**: https://open.kakao.com/o/gsXGYodi

## 프로젝트 구조

```
WEEKLY-NEXO/
├── index.html          # 메인 페이지
├── css/
│   └── style.css       # 스타일시트
├── js/
│   ├── editions-data.js     # 발행 이력 데이터 (JavaScript)
│   └── edition-manager.js  # 발행일·매거진·쌤 도구함 관리
├── data/
│   └── editions.json   # 발행 이력 (참고용)
├── assets/
│   ├── images/         # 이미지 저장소
│   └── downloads/     # 쌤 도구함 다운로드 자료 (DOWNLOAD_FILES_GUIDE.md 참고)
├── DOCS_INDEX.md       # 문서 목록 (용도별 정리)
└── README.md           # 프로젝트 설명서
```

**문서가 많을 때**: **`DOCS_INDEX.md`**에서 용도별로 문서를 찾을 수 있습니다.

## 주요 기능

### 1. 발행일 선택 기능
- 드롭다운 메뉴로 과거 발행분 선택
- 이전/다음 버튼으로 네비게이션
- URL 파라미터로 특정 발행분 공유 가능

### 2. 업데이트 로그
- 소프트웨어, 하드웨어, 컨텐츠, 서비스 업데이트 추적
- 각 업데이트별 버전 정보 및 설명
- 카테고리별 색상 구분

### 3. 발전 이력 통계
- 총 설치 대수
- 활성 사용자 수
- 컨텐츠 업데이트 횟수

### 4. 전자신문 플랫폼
- 매주 목요일 정기 발행 시스템
- 과거 발행분 아카이브 및 조회
- 회사 발전 이력 추적
- 이벤트 및 프로모션 관리
- 소셜 공유 기능 (카카오톡, 페이스북 등)
- 발행물 검색 기능

## 사용 방법

### 🧪 테스트 모드 (개발용)

URL에 **`?test=1`**을 붙이면 테스트 모드가 켜집니다. 검색 UI가 노출되고 상단에 "테스트 모드" 배너가 표시됩니다. 자세한 내용은 **`TEST_MODE.md`**를 참고하세요.

### 🎯 빠른 시작: 관리자 에디터 사용

**가장 쉬운 방법**: 관리자 에디터를 사용하여 발행물을 작성하세요!

1. `admin.html` 파일을 브라우저에서 엽니다
2. 비밀번호 입력 (기본: `nexo2026`)
3. 폼에 발행물 정보 입력
4. 이미지 등록 (최대 3개)
5. "발행물 등록" 클릭
6. 다운로드된 파일을 `js/editions-data.js`로 교체
7. 이미지 파일을 `assets/images/` 폴더에 복사

**자세한 가이드**: `ADMIN_GUIDE.md` 파일을 참고하세요.

### 매주 목요일 업데이트 (수동 방법)

**📖 상세 가이드는 `HOW_TO_ADD_EDITION.md` 파일을 참고하세요!**

1. `js/editions-data.js` 파일에 새로운 발행분 추가:

```javascript
// js/editions-data.js 파일의 EDITIONS_DATA.editions 배열 맨 앞에 추가
{
  "id": "2026-02-12",  // YYYY-MM-DD 형식 (목요일)
  "date": "2026년 2월 12일 목요일",
  "volume": "VOL. 2026-02",
  "title": "새로운 제목",
  "headline": "메인 헤드라인",
  "subHeadline": "서브 헤드라인 (선택사항)",
  "updates": [
    {
      "category": "소프트웨어",  // 또는 "하드웨어", "서비스", "컨텐츠"
      "version": "UMIND v2.3.0",
      "description": "업데이트 설명",
      "date": "2026-02-10"
    }
  ],
  "content": {
    "main": "본문 내용",
    "features": ["기능1", "기능2", "기능3"]
  },
  "stats": {
    "totalInstallations": 170,
    "activeUsers": 1400,
    "contentUpdates": 55
  },
  "achievements": [
    {
      "type": "innovation",  // "innovation", "product", "growth", "partnership"
      "category": "혁신",
      "title": "업적 제목",
      "description": "업적 설명",
      "date": "2026-02-10",
      "value": "값",
      "milestone": "이정표"
    }
  ]
}
```

2. 발행분은 `id` 기준으로 최신순으로 자동 정렬됩니다.

3. 사용자는 드롭다운에서 발행일을 선택하여 해당 호의 정보를 확인할 수 있습니다.

### Cursor AI 활용 팁

매주 업데이트 시 Cursor Chat(Ctrl+L)에서 다음과 같이 요청하세요:

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

**💡 더 자세한 가이드는 `HOW_TO_ADD_EDITION.md` 파일을 확인하세요!**

## 기술 스택

- HTML5
- CSS3
- JavaScript (ES6+)
- JSON (데이터 저장)
- Pico CSS Framework
- Google Fonts (Noto Sans KR, Noto Serif KR)

## 데이터 구조

### editions-data.js 구조

각 발행분은 다음 정보를 포함합니다:

- `id`: 고유 식별자 (YYYY-MM-DD 형식)
- `date`: 발행일 표시 형식
- `volume`: 호수
- `title`: 제목
- `headline`: 메인 헤드라인
- `updates`: 업데이트 목록
  - `category`: 카테고리 (소프트웨어/하드웨어/컨텐츠/서비스)
  - `version`: 버전 정보
  - `description`: 설명
  - `date`: 업데이트 날짜
- `content`: 콘텐츠 정보
- `stats`: 통계 정보

## 라이선스

© 2026 주식회사 넥소 (NEXO). All rights reserved.
