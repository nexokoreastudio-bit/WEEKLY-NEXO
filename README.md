# NEXO Daily

> 넥소 전자칠판 사용자들을 위한 교육 정보 큐레이션 및 커뮤니티 플랫폼

[![Netlify Status](https://api.netlify.com/api/v1/badges/weekly-nexo/deploy-status)](https://app.netlify.com/sites/weekly-nexo/deploys)

## 🎉 v2.0.0 주요 업데이트

**NEXO Weekly**에서 **NEXO Daily**로 전면 리팩터링되었습니다!

### ✨ 주요 변경사항

- **브랜드명 변경**: NEXO Weekly → **NEXO Daily**
- **발행 주기**: 주간 발행 → **일일 발행**
- **아키텍처 전환**: 정적 HTML → **Next.js 14 App Router**
- **데이터 관리**: 하드코딩 → **Supabase PostgreSQL**
- **기능 확장**: 뉴스레터 → **커뮤니티, 자료실, 현장 소식**

### 🚀 새로운 기능

- ✅ **일일 발행 콘텐츠**: 데이터베이스 기반 동적 콘텐츠 관리
- ✅ **커뮤니티 게시판**: 자유게시판, Q&A, 팁 공유, 중고거래
- ✅ **자료실**: 레벨별 접근 제어 및 포인트 기반 다운로드
- ✅ **현장 소식**: 설치 현장 사진 및 설명 관리
- ✅ **구독자 인증**: 시리얼 번호 기반 인증 및 할인 혜택
- ✅ **포인트 시스템**: 활동 기반 포인트 적립 및 레벨 시스템

## 🛠️ 기술 스택

- **Frontend**: Next.js 14.2, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Netlify

## 📦 설치 및 실행

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📚 주요 페이지

- **메인 페이지** (`/`): 최신 발행호 자동 표시
- **발행호 목록** (`/news`): 모든 발행호 아카이브
- **커뮤니티** (`/community`): 게시판 및 소통 공간
- **자료실** (`/resources`): 교육 자료 다운로드
- **현장 소식** (`/field`): 설치 현장 소식
- **마이페이지** (`/mypage`): 사용자 정보 및 구독자 인증

## 🔐 관리자 기능

관리자 권한이 있는 사용자는 다음 기능을 사용할 수 있습니다:

- 현장 소식 작성 및 관리 (`/admin/field-news`)
- 콘텐츠 발행 관리

## 📖 상세 문서

- [리팩터링 구현 보고서](./REFACTORING_REPORT.md)
- [보안 사고 대응 가이드](./SECURITY_INCIDENT_RESPONSE.md)
- [Netlify 배포 가이드](./NETLIFY_DEPLOY.md)

## 🌐 배포

- **프로덕션**: https://weekly-nexo.netlify.app
- **자동 배포**: `main` 브랜치 푸시 시 Netlify 자동 배포

## 📝 라이선스

ISC

## 👥 기여

이 프로젝트는 (주)넥소의 내부 프로젝트입니다.

---

**NEXO Daily** - 전자칠판과 함께하는 교육 커뮤니티 🎓
