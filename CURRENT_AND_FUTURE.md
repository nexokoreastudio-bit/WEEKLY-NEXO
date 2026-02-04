# WEEKLY-NEXO: 현재 구현 내용과 앞으로의 방향

## 📌 프로젝트 개요

**NEXO Weekly**는 (주)넥소의 **매주 목요일 발행 전자신문 플랫폼**입니다.  
컨셉은 **"전자칠판 = 전자신문"**으로, 정기 발행·정보 전달·이벤트·커뮤니티 소통을 하나의 웹에서 제공합니다.

---

## ✅ 현재 구현 내용

### 1. 메인 페이지 (index.html)

- **헤더**: 호수(VOL), 발행일, NEXO WEEKLY 로고, 발행물 선택 UI
- **발행물 선택**: 드롭다운 + 이전/다음 버튼으로 호별 이동
- **헤드라인**: 메인/서브 헤드라인, 소셜 공유(링크 복사 ✅, 카카오톡 🔜 준비중)
- **Hero 이미지**: 호당 최대 3장 (1장 Hero, 나머지 Features 섹션)
- **본문**: `content.main` (HTML 지원), Features 리스트
- **업데이트 로그**: 소프트웨어/하드웨어/서비스/컨텐츠 카테고리, 버전·설명·날짜
- **업적**: innovation, product, growth, partnership 타입, 카드 형태 표시
- **통계**: 설치 대수, 활성 사용자, 컨텐츠 업데이트 횟수 (업적 없을 때 폴백)
- **프로모션/에디토리얼/문의** 등 고정 섹션

### 2. 발행일·콘텐츠 관리 (edition-manager.js)

- **데이터 소스**: `js/editions-data.js`의 `EDITIONS_DATA` (CORS 대응으로 JS 사용)
- **발행일 기준 공개**: `id`(YYYY-MM-DD)가 **오늘 이전**이면 공개, 미래면 비공개
- **미리 만들기·자동 오픈**: 미래 목요일 `id`로 호를 넣어두면, 그날 0시(로컬) 이후 자동 공개
- **미리보기 모드**: URL에 `?preview=1` 또는 `?preview=1&edition=2026-02-12` → 발행 전 호도 선택·본문 확인 가능, 상단에 "관리자 미리보기" 배너
- **발행 예정 호**: 일반 사용자는 해당 호 선택 시 "📅 발행 예정 - OOO에 공개됩니다" 메시지만 표시
- **준비중 호**: `status === 'preparing'` 또는 제목이 "발행물 준비중"이면 "🔜 발행물 준비중" 전용 화면
- **URL 공유**: `?edition=2026-02-12` 로 특정 호 직접 링크, 히스토리(pushState) 지원

### 3. 데이터 구조 (editions-data.js)

각 호(edition) 필드:

- **필수**: `id`, `date`, `volume`, `title`, `headline`, `updates[]`, `content`, `stats`, `achievements[]`
- **선택**: `subHeadline`, `images[]` (최대 3개, filename/alt/caption)
- **특수**: `status: 'preparing'` → 준비중 전용 화면

`data/editions.json`은 참고/동기화용으로만 사용되고, 실제 렌더링은 `editions-data.js` 기준입니다.

### 4. 관리자 에디터 (admin.html + admin-editor.js)

- **비밀번호**: 기본 `nexo2026` (admin-editor.js에서 변경 가능)
- **기능**: 발행일·호수·제목·헤드라인·본문·이미지(최대 3개)·업데이트·업적 입력
- **결과**: 폼 제출 시 `editions-data.js` 형식 파일 다운로드 → 수동으로 `js/editions-data.js` 교체, 이미지는 `assets/images/`에 수동 복사

### 5. 검색 기능

- **상태**: **구현되어 있으나 UI 비노출** (`index.html` 내 `.search-section`에 `style="display: none;"`)
- **동작**: 제목·본문·업데이트·업적 등 전체 텍스트에서 키워드 검색, 검색어 하이라이트

### 6. 배포·백엔드

- **호스팅**: Netlify (netlify.toml, DEPLOYMENT.md)
- **폼 → 데이터**: Netlify Functions (`form-to-sheets.js`, `save-to-sheets.js`)로 Google Sheets 연동 가능
- **OG 이미지**: `scripts/generate-og-image.js` (sharp), `og-image.html` 등으로 SNS 공유용 이미지 생성

### 7. 문서

- **HOW_TO_ADD_EDITION.md**: 매주 목요일 새 호 추가 방법(editions-data.js 수정, 필드 설명, 이미지 규칙, Cursor 활용 팁)
- **REFERENCE_CONTENT_FOR_EDITIONS.md**: 워크스페이스(Nexo_Content_Hub, 넥소 업무, Nexo_web_bro_1 등) 참조해서 발행물 작성하는 방법
- **ADMIN_GUIDE.md**: 관리자 에디터 사용법
- **BUSINESS_PROPOSAL.md**: 비즈니스 목적, 기능, 기대 효과

---

## 🔜 앞으로의 방향 (제안)

### 1. 콘텐츠·운영

- **매주 목요일 발행 유지**: `HOW_TO_ADD_EDITION.md`·`REFERENCE_CONTENT_FOR_EDITIONS.md` 기준으로 Nexo_Content_Hub·넥소 업무 등 참조해 `editions-data.js`에 새 호 추가
- **미리 만들기**: 다음 주·다음 달 호를 미리 넣어두고, 발행일이 되면 자동 오픈
- **관리자 워크플로**: admin 에디터로 초안 작성 → 다운로드 파일로 `editions-data.js` 반영 + 이미지 업로드

### 2. 기능 보완

- **검색 노출**: `.search-section`의 `display: none` 제거 후, 필요하면 placeholder·레이아웃만 정리해 사용자에게 검색 제공
- **카카오톡 공유**: 현재 "준비중" → 카카오 개발자 앱 설정 후 JS SDK/공유 URL 연동으로 완료
- **소셜 공유**: 발행물별 OG 이미지/제목/설명이 들어가도록 메타 태그 동적 변경 검토(이미 `edition` 파라미터로 공유 가능하므로, OG만 호별로 맞추면 됨)

### 3. 데이터·에디터

- **선택지**:  
  - 현행 유지: `editions-data.js` 수동/관리자 다운로드 교체  
  - 확장: Netlify 빌드 시 `data/editions.json`을 생성하거나, 관리자에서 제출 시 Netlify Function으로 JSON/JS 갱신 후 재배포
- **이미지**: 관리자에서 업로드 시 Netlify/스토리지에 올리고 URL을 `images[].src`로 넣는 방식으로 자동화 가능

### 4. 비즈니스 목표 (BUSINESS_PROPOSAL.md 정리)

- 정기 브랜드 노출·인지도, 제품/업데이트 전달, 이벤트·프로모션, 성장 이력 기록, 고객 소통 강화
- 검색 활성화 시 "정보 빠르게 찾기"와 자가 서비스 활용도 증가에 기여

---

## 📁 참고 파일 위치

| 용도           | 파일/폴더 |
|----------------|------------|
| 발행물 데이터  | `js/editions-data.js` |
| 발행 로직·UI   | `js/edition-manager.js` |
| 메인 페이지    | `index.html` |
| 관리자         | `admin.html`, `js/admin-editor.js` |
| 새 호 추가법   | `HOW_TO_ADD_EDITION.md` |
| 참조 콘텐츠    | `REFERENCE_CONTENT_FOR_EDITIONS.md` |
| 비즈니스/기능  | `BUSINESS_PROPOSAL.md`, `README.md` |

---

*이 문서는 현재 구현과 앞으로의 방향을 한곳에 정리한 요약본입니다. 세부 절차는 각 가이드 문서를 참고하면 됩니다.*
