# WEEKL Y-NEXO 사이트 구현 사항 정리

**최종 업데이트**: 2026년 1월 28일  
**프로젝트**: 넥소 전자신문 플랫폼 (WEEKLY-NEXO)

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [주요 페이지](#주요-페이지)
3. [핵심 기능](#핵심-기능)
4. [회원 시스템](#회원-시스템)
5. [관리자 기능](#관리자-기능)
6. [주문/상담 시스템](#주문상담-시스템)
7. [UI/UX 구성](#uiux-구성)
8. [데이터베이스 연동](#데이터베이스-연동)
9. [배포 및 환경](#배포-및-환경)
10. [기술 스택](#기술-스택)

---

## 프로젝트 개요

**WEEKLY-NEXO**는 (주)넥소의 전자신문 플랫폼으로, 매주 목요일 정기 발행되는 디지털 미디어입니다.

- **컨셉**: 전자칠판 = 전자신문
- **발행 주기**: 매주 목요일
- **주요 목적**: 정보 전달, 이벤트 진행, 커뮤니티 소통
- **배포 URL**: `https://weekly-nexo.netlify.app/`

---

## 주요 페이지

### 1. **index.html** - 메인 페이지
- **헤더**: 발행호 정보, 에디션 선택 드롭다운, 이전/다음 네비게이션
- **본문**: 
  - 헤드라인 그룹 (메인/서브 헤드라인)
  - 소셜 공유 버튼 (카카오톡, 페이스북, 트위터)
  - 업데이트 로그 (소프트웨어/하드웨어/컨텐츠/서비스)
  - 통계 대시보드 (설치 대수, 활성 사용자, 업데이트 횟수)
  - 현장 스케치 섹션 (노원구 학원연합회 이취임식)
  - 넥소 전자칠판 홍보 블록 (이미지 2개 + 연락처)
  - 매거진 섹션 (에디터/칼럼)
- **사이드바**:
  - NEXO 쌤 도구함 (접기/펼치기)
  - 특별 프로모션 (준비중)
  - **넥소 전자칠판 주문/상담 신청** (드롭다운 폼)
  - 실전 팁 박스
  - 연락처 정보
  - 광고 배너 (꿈을담아 - 숨김 처리됨)

### 2. **login.html** - 로그인 페이지
- LG전자 스타일 디자인
- 이메일/비밀번호 로그인
- 회원가입 링크
- Render.com PostgreSQL 또는 localStorage 기반 인증

### 3. **mypage.html** - 마이페이지
- 회원 정보 표시 (이름, 이메일)
- 구독자 정보 편집 폼
- 로그아웃 버튼
- 구독자 전용 섹션 링크

### 4. **admin.html** - 관리자 에디터
- 발행물 작성/수정 인터페이스
- 이미지 업로드 (최대 3개)
- JSON 데이터 생성 및 다운로드
- 비밀번호 보호

### 5. **search.html** - 검색 페이지
- 검색 기능 준비 중 플레이스홀더

### 6. **thank-you.html** - 제출 완료 페이지
- 주문/상담 신청 완료 안내

---

## 핵심 기능

### 1. **에디션 관리 시스템**
- **파일**: `js/edition-manager.js`, `js/editions-data.js`
- **기능**:
  - 발행호별 콘텐츠 동적 로딩
  - 드롭다운으로 발행일 선택
  - 이전/다음 버튼 네비게이션
  - 호별 목록 뷰 (리스트식 미리보기)
  - URL 파라미터로 특정 호 공유 (`?edition=2026-01-28`)
  - 관리자 미리보기 모드 (`?preview=1`)

### 2. **업데이트 로그**
- 카테고리별 색상 구분:
  - 소프트웨어 (파란색)
  - 하드웨어 (주황색)
  - 컨텐츠 (초록색)
  - 서비스 (보라색)
- 버전 정보, 설명, 날짜 표시

### 3. **통계 대시보드**
- 총 설치 대수
- 활성 사용자 수
- 컨텐츠 업데이트 횟수
- 실시간 업데이트

### 4. **소셜 공유**
- 카카오톡 공유 (Web Share API)
- 페이스북 공유
- 트위터 공유
- URL 복사

### 5. **NEXO 쌤 도구함**
- 도구 카드 렌더링 (`renderTools()`)
- 다운로드 링크 제공
- 모바일에서 접기/펼치기

### 6. **매거진 섹션**
- 에디터/칼럼 구분
- 가로 배열 레이아웃
- 동적 콘텐츠 렌더링

---

## 회원 시스템

### **인증 방식**
- **옵션 1**: Render.com PostgreSQL + Netlify Functions
- **옵션 2**: localStorage (폴백)

### **주요 파일**
- `js/member-signup.js` - 회원가입
- `js/member-login.js` - 로그인
- `js/mypage.js` - 마이페이지
- `netlify/functions/member-auth.js` - 인증 API
- `scripts/render-member-schema.sql` - DB 스키마

### **기능**
- 회원가입 (이메일, 비밀번호, 이름)
- 로그인/로그아웃
- 프로필 조회/수정
- JWT 토큰 기반 인증
- 비밀번호 해싱 (bcryptjs)

### **UI 구성**
- 헤더 프로필 위젯 (네이버 스타일)
- 로그인 상태에 따른 버튼 전환
- 인라인 로그인/회원가입 폼 (메인 콘텐츠 상단)

---

## 관리자 기능

### **admin.html**
- 발행물 작성 폼
- 이미지 업로드 (최대 3개)
- JSON 데이터 생성
- 파일 다운로드

### **미리보기 모드**
- URL 파라미터: `?preview=1`
- 발행 예정 호 미리보기
- 비밀번호 보호

### **관리자 로그인**
- 헤더 버튼
- 모달 팝업
- 비밀번호: `nexo2026` (기본값)

---

## 주문/상담 시스템

### **사이드바 드롭다운**
- 위치: 우측 사이드바
- 토글 버튼: "📋 넥소 전자칠판 주문/상담 신청"
- 모바일: 기본 숨김, 드롭다운 열 때만 표시

### **폼 항목**
- 업체명 (학원명)
- 주문자 성함
- 연락처
- 지역/설치 환경
- 인치 종류 (65/75/86)
- 설치 방식 (벽걸이/이동형 스탠드)
- 구매 수량
- 유입 경로 (선택사항)
- 개인정보 동의

### **가격 계산**
- 파일: `js/order-form.js`
- 인치/설치방식/수량에 따른 자동 계산
- Hidden 필드에 단가/총액 저장

### **제출 처리**
- Netlify Forms 연동
- Google Sheets 저장 (선택)
- 로컬 환경에서는 제출 차단 (개발용)
- 제출 완료 후 `thank-you.html`로 이동

---

## UI/UX 구성

### **반응형 디자인**
- **데스크톱**: 메인 콘텐츠 + 우측 사이드바
- **태블릿/모바일**: 단일 컬럼, 사이드바 하단 배치
- **브레이크포인트**: 768px, 1024px, 480px

### **모바일 최적화**
- 에디션 드롭다운: 터치 영역 확대 (48px), 가독성 개선
- 주문 폼: 드롭다운 열 때만 표시
- 쌤 도구함: 접기/펼치기
- 고정 버튼: 하단 (공동구매, 카카오톡 문의 - 준비중)

### **색상 시스템**
- 네이비: `#1a1a1a`
- 시안: `#00c4b4`
- 텍스트: `#333`, `#666` (muted)

### **타이포그래피**
- 헤드라인: Noto Serif KR
- 본문: Noto Sans KR
- Google Fonts 로딩

### **접근성**
- ARIA 레이블
- 시맨틱 HTML
- 키보드 네비게이션 지원

---

## 데이터베이스 연동

### **Render.com PostgreSQL**
- 테이블: `members`
- 스키마: `scripts/render-member-schema.sql`
- 환경 변수: `DATABASE_URL`, `JWT_SECRET`
- API: `netlify/functions/member-auth.js`

### **Google Sheets 연동**
- 주문 폼 데이터 저장
- 파일: `netlify/functions/form-to-sheets.js`
- 환경 변수: `GOOGLE_SHEETS_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT`

### **데이터 저장소**
- 발행물 데이터: `js/editions-data.js` (JSON)
- 참고용: `data/editions.json`

---

## 배포 및 환경

### **배포 플랫폼**
- **프로덕션**: Netlify (`main` 브랜치)
- **개발**: Netlify (`develop` 브랜치)
- **로컬 개발**: `npx serve` (포트 8080/8090)

### **브랜치 전략**
- `main`: 프로덕션 배포 (현장 스케치 섹션 포함)
- `develop`: 개발/테스트 (모든 최신 기능)

### **환경 변수 (Netlify)**
- `DATABASE_URL`: Render PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 토큰 시크릿
- `GOOGLE_SHEETS_SHEET_ID`: Google Sheets ID
- `GOOGLE_SERVICE_ACCOUNT`: 서비스 계정 JSON

### **로컬 개발 설정**
- `LOCAL_DEV_SETUP.md` 가이드 참고
- 두 개의 저장소 클론 (main/develop)
- 각각 다른 포트로 실행

---

## 기술 스택

### **프론트엔드**
- HTML5
- CSS3 (커스텀, 미디어 쿼리)
- JavaScript (ES6+)
- Google Fonts (Noto Sans KR, Noto Serif KR)

### **백엔드/서버리스**
- Netlify Functions
- Node.js
- PostgreSQL (Render.com)
- Google Sheets API

### **의존성 (package.json)**
- `pg`: PostgreSQL 클라이언트
- `bcryptjs`: 비밀번호 해싱
- `jsonwebtoken`: JWT 토큰
- `google-spreadsheet`: Google Sheets 연동
- `qrcode`: QR 코드 생성
- `sharp`: 이미지 처리

### **도구**
- Git/GitHub
- Netlify CLI
- Cursor AI

---

## 주요 섹션 상세

### **현장 스케치 섹션**
- 노원구 학원연합회 이취임식 현장 사진 (4개)
- 블로그 스타일 레이아웃
- 넥소 전자칠판 홍보 블록:
  - 이미지 2개 (4.png, nexo-classroom.png)
  - 홍보 문구
  - 연락처 정보 (Web, Blog, Tel, Addr)
- 해시태그 (#노원구학원연합회 등)

### **주문/상담 신청 폼**
- 드롭다운 토글
- 가격 계산 로직
- Netlify Forms 제출
- 모바일 최적화

### **광고 섹션**
- 꿈을담아 배너 (현재 숨김 처리)
- CSS: `display: none !important`

---

## 파일 구조 요약

```
WEEKLY-NEXO/
├── index.html              # 메인 페이지
├── login.html             # 로그인 페이지
├── mypage.html            # 마이페이지
├── admin.html             # 관리자 에디터
├── search.html            # 검색 페이지
├── thank-you.html         # 제출 완료 페이지
├── css/
│   ├── style.css          # 메인 스타일시트
│   ├── admin.css          # 관리자 스타일
│   └── mypage.css         # 마이페이지 스타일
├── js/
│   ├── editions-data.js   # 발행물 데이터
│   ├── edition-manager.js # 에디션 관리
│   ├── member-login.js    # 로그인
│   ├── member-signup.js   # 회원가입
│   ├── mypage.js          # 마이페이지
│   ├── order-form.js      # 주문 폼
│   └── ...
├── netlify/functions/
│   ├── member-auth.js     # 회원 인증 API
│   ├── form-to-sheets.js  # Google Sheets 저장
│   └── ...
├── assets/
│   ├── images/            # 이미지 저장소
│   └── downloads/        # 쌤 도구함 자료
└── scripts/
    └── render-member-schema.sql  # DB 스키마
```

---

## 최근 업데이트 (2026-01-28)

1. ✅ 모바일 에디션 드롭다운 가독성 개선
2. ✅ 광고 섹션 숨김 처리
3. ✅ 현장 스케치 섹션에 넥소 전자칠판 홍보 블록 추가
4. ✅ 주문/상담 신청 버튼 → 연락처 정보로 교체
5. ✅ 이미지 영역 확대 (시원한 느낌)
6. ✅ develop 브랜치에서 작업 완료

---

## 참고 문서

- `README.md`: 프로젝트 개요
- `HOW_TO_ADD_EDITION.md`: 발행물 추가 가이드
- `ADMIN_GUIDE.md`: 관리자 에디터 사용법
- `RENDER_DB_SETUP.md`: Render PostgreSQL 설정
- `LOCAL_DEV_SETUP.md`: 로컬 개발 환경 설정
- `DEPLOYMENT.md`: 배포 가이드
- `DOCS_INDEX.md`: 문서 목록

---

**문서 작성일**: 2026년 1월 28일  
**작성자**: Cursor AI Assistant  
**프로젝트**: WEEKLY-NEXO 전자신문 플랫폼
