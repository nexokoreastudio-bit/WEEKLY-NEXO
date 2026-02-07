# WEEKLY-NEXO 구현 기능 명세서

**작성일**: 2026년 2월 6일  
**버전**: 2.0.0  
**프로젝트 상태**: 개발 진행 중

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [구현 완료 기능](#구현-완료-기능)
5. [데이터베이스 스키마](#데이터베이스-스키마)
6. [API 및 라우팅](#api-및-라우팅)
7. [컴포넌트 명세](#컴포넌트-명세)
8. [환경 설정](#환경-설정)
9. [다음 단계](#다음-단계)

---

## 프로젝트 개요

### 목표
정적 웹사이트를 **Next.js 14 기반의 에듀테크 커뮤니티 플랫폼**으로 전환

### 핵심 가치
- **정보 습득 (News)**: 매주 목요일 발행 전자신문
- **자료 공유 (Resources)**: 선생님용 교육 자료 다운로드
- **소통 (Community)**: 게시판, 댓글, 좋아요
- **보상 (Points)**: 활동 포인트 및 등급 시스템

---

## 기술 스택

### Frontend
- **Framework**: Next.js 14.2.0 (App Router)
- **Language**: TypeScript 5.3.3
- **Styling**: 
  - Tailwind CSS 3.4.1
  - CSS Modules (기존 스타일 유지)
  - Shadcn/UI 컴포넌트
- **State Management**: Zustand 4.4.7 (준비됨)

### Backend & Database
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth

### 개발 도구
- **Form Validation**: Zod 3.22.4, React Hook Form 7.49.3
- **Date Handling**: date-fns 3.0.6
- **UI Components**: Radix UI (Avatar, Dialog, Dropdown, Label, Select, Separator, Slot, Tabs, Toast)
- **Icons**: Lucide React 0.309.0

---

## 프로젝트 구조

```
WEEKLY-NEXO/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # 인증 라우트 그룹
│   │   ├── login/
│   │   │   └── page.tsx        # 로그인 페이지 ✅
│   │   └── signup/
│   │       └── page.tsx        # 회원가입 페이지 ✅
│   ├── actions/
│   │   └── auth.ts             # 서버 액션 (로그아웃) ✅
│   ├── layout.tsx              # 루트 레이아웃 ✅
│   ├── page.tsx                # 메인 페이지 ✅
│   ├── page.module.css         # 메인 페이지 스타일 ✅
│   └── globals.css             # 전역 스타일 ✅
│
├── components/                  # React 컴포넌트
│   ├── auth/
│   │   └── user-button.tsx     # 사용자 버튼 (로그인/로그아웃) ✅
│   ├── layout/
│   │   └── header.tsx          # 헤더 컴포넌트 ✅
│   └── ui/                     # Shadcn/UI 컴포넌트
│       ├── button.tsx          # 버튼 컴포넌트 ✅
│       ├── card.tsx            # 카드 컴포넌트 ✅
│       ├── input.tsx           # 입력 컴포넌트 ✅
│       └── label.tsx           # 레이블 컴포넌트 ✅
│
├── lib/                         # 유틸리티 및 설정
│   ├── supabase/
│   │   ├── client.ts          # 브라우저용 Supabase 클라이언트 ✅
│   │   ├── server.ts          # 서버용 Supabase 클라이언트 ✅
│   │   └── middleware.ts      # 미들웨어용 Supabase 클라이언트 ✅
│   └── utils/
│       └── cn.ts               # className 유틸리티 ✅
│
├── types/                       # TypeScript 타입 정의
│   ├── database.ts             # Supabase DB 타입 정의 ✅
│   └── database-v2.ts          # DB 타입 정의 (v2) ✅
│
├── middleware.ts                # Next.js 미들웨어 (세션 관리) ✅
│
├── public/                      # 정적 파일
│   └── assets/                 # 이미지 및 리소스
│
├── supabase-schema-v2.sql      # 데이터베이스 스키마 ✅
│
├── package.json                # 의존성 및 스크립트 ✅
├── tsconfig.json               # TypeScript 설정 ✅
├── tailwind.config.ts          # Tailwind CSS 설정 ✅
├── postcss.config.js           # PostCSS 설정 ✅
├── next.config.js              # Next.js 설정 ✅
│
└── .env.local                  # 환경 변수 (로컬)
```

---

## 구현 완료 기능

### ✅ Phase 1: 프로젝트 초기 설정

#### 1.1 Next.js 프로젝트 설정
- [x] Next.js 14 프로젝트 생성 (App Router)
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] PostCSS 설정
- [x] Next.js 설정 파일 (`next.config.js`)
- [x] 환경 변수 설정 구조

#### 1.2 Supabase 연동
- [x] Supabase 클라이언트 설정 (브라우저용)
- [x] Supabase 서버 클라이언트 설정
- [x] Supabase 미들웨어 클라이언트 설정
- [x] 세션 관리 미들웨어 구현
- [x] TypeScript 타입 정의 (`types/database.ts`)

#### 1.3 데이터베이스 스키마
- [x] 데이터베이스 스키마 설계 (`supabase-schema-v2.sql`)
- [x] 테이블 정의:
  - `users` (사용자 프로필)
  - `articles` (뉴스/매거진)
  - `posts` (커뮤니티 게시글)
  - `comments` (댓글)
  - `likes` (좋아요)
  - `resources` (자료실)
  - `point_logs` (포인트 로그)
  - `downloads` (다운로드 이력)
- [x] Row Level Security (RLS) 정책 설정
- [x] 트리거 및 함수 정의:
  - 사용자 프로필 자동 생성
  - 포인트 시스템 자동화
  - 좋아요 수 자동 업데이트

---

### ✅ Phase 2: 인증 시스템 구현

#### 2.1 인증 페이지
- [x] **로그인 페이지** (`/login`)
  - 이메일/비밀번호 로그인
  - 로그인 상태 유지 옵션
  - 에러 처리 및 사용자 피드백
  - 비밀번호 찾기 링크
  - 회원가입 링크

- [x] **회원가입 페이지** (`/signup`)
  - 이메일, 비밀번호, 이름 입력
  - 학원명, 연락처, 추천인 코드 (선택사항)
  - 비밀번호 확인
  - 이메일 인증 플로우 지원
  - 에러 처리 및 사용자 피드백

#### 2.2 인증 기능
- [x] Supabase Auth 연동
- [x] 세션 관리 (Middleware)
- [x] 로그아웃 기능 (서버 액션)
- [x] 사용자 상태 확인 (`UserButton` 컴포넌트)
- [x] 인증 상태에 따른 UI 변경

#### 2.3 사용자 인터페이스
- [x] **Header 컴포넌트**
  - 로고 및 네비게이션
  - 사용자 버튼 통합
  - 반응형 디자인

- [x] **UserButton 컴포넌트**
  - 로그인 전: 로그인/회원가입 버튼
  - 로그인 후: 사용자 이름 표시 및 로그아웃 버튼
  - 실시간 인증 상태 업데이트

---

### ✅ Phase 3: 메인 페이지 리팩터링 (진행 중)

#### 3.1 기본 구조
- [x] 메인 페이지 컴포넌트 생성 (`app/page.tsx`)
- [x] CSS 모듈화 (`app/page.module.css`)
- [x] 기존 디자인 시스템 유지

#### 3.2 레이아웃 구성
- [x] 헤더 섹션 (로고, 발행호 정보)
- [x] 히어로 섹션 (메인 이미지, 헤드라인)
- [x] 매거진 섹션 (기본 구조)
- [x] 사이드바 (기본 구조)
- [x] 푸터

#### 3.3 이미지 최적화
- [x] Next.js Image 컴포넌트 적용
- [x] 이미지 최적화 설정 (`next.config.js`)

---

### ✅ Phase 4: UI 컴포넌트 시스템

#### 4.1 Shadcn/UI 컴포넌트
- [x] **Button** (`components/ui/button.tsx`)
  - 다양한 variant (default, destructive, outline, secondary, ghost, link)
  - 다양한 size (default, sm, lg, icon)
  - asChild prop 지원

- [x] **Input** (`components/ui/input.tsx`)
  - 기본 입력 필드
  - 접근성 지원
  - 포커스 스타일

- [x] **Label** (`components/ui/label.tsx`)
  - Radix UI 기반
  - 접근성 지원

- [x] **Card** (`components/ui/card.tsx`)
  - Card, CardHeader, CardTitle, CardDescription
  - CardContent, CardFooter

#### 4.2 유틸리티
- [x] **cn 함수** (`lib/utils/cn.ts`)
  - className 병합 유틸리티
  - clsx + tailwind-merge 통합

---

## 데이터베이스 스키마

### 테이블 구조

#### 1. `users` 테이블
```sql
- id (UUID, PK, FK → auth.users)
- email (TEXT, UNIQUE)
- nickname (TEXT)
- avatar_url (TEXT)
- role (TEXT: 'admin', 'teacher', 'academy_owner', 'user')
- academy_name (TEXT)
- referrer_code (TEXT)
- point (INTEGER, DEFAULT 0)
- level (TEXT: 'bronze', 'silver', 'gold', DEFAULT 'bronze')
- created_at, updated_at (TIMESTAMP)
```

#### 2. `articles` 테이블
```sql
- id (SERIAL, PK)
- title (TEXT, NOT NULL)
- subtitle (TEXT)
- content (TEXT - HTML/Markdown)
- category (TEXT: 'news', 'column', 'update', 'event')
- thumbnail_url (TEXT)
- author_id (UUID, FK → users)
- published_at (TIMESTAMP)
- is_published (BOOLEAN, DEFAULT FALSE)
- views (INTEGER, DEFAULT 0)
- created_at, updated_at (TIMESTAMP)
```

#### 3. `posts` 테이블
```sql
- id (SERIAL, PK)
- board_type (TEXT: 'free', 'qna', 'tip', 'market')
- title (TEXT, NOT NULL)
- content (TEXT, NOT NULL)
- author_id (UUID, FK → users)
- images (TEXT[] - Supabase Storage URL 배열)
- likes_count (INTEGER, DEFAULT 0)
- comments_count (INTEGER, DEFAULT 0)
- created_at, updated_at (TIMESTAMP)
```

#### 4. `comments` 테이블
```sql
- id (SERIAL, PK)
- post_id (INTEGER, FK → posts)
- author_id (UUID, FK → users)
- content (TEXT, NOT NULL)
- created_at, updated_at (TIMESTAMP)
```

#### 5. `likes` 테이블
```sql
- id (SERIAL, PK)
- post_id (INTEGER, FK → posts)
- user_id (UUID, FK → users)
- created_at (TIMESTAMP)
- UNIQUE(post_id, user_id)
```

#### 6. `resources` 테이블
```sql
- id (SERIAL, PK)
- title (TEXT, NOT NULL)
- description (TEXT)
- file_url (TEXT - Supabase Storage URL)
- file_type (TEXT: 'pdf', 'excel', 'image', 'video', 'other')
- file_size (INTEGER)
- point_cost (INTEGER, DEFAULT 0)
- download_count (INTEGER, DEFAULT 0)
- is_premium (BOOLEAN, DEFAULT FALSE)
- created_by (UUID, FK → users)
- created_at, updated_at (TIMESTAMP)
```

#### 7. `point_logs` 테이블
```sql
- id (SERIAL, PK)
- user_id (UUID, FK → users)
- point_change (INTEGER)
- point_balance (INTEGER)
- reason (TEXT)
- related_type (TEXT: 'post', 'comment', 'download', 'admin')
- related_id (INTEGER)
- created_at (TIMESTAMP)
```

#### 8. `downloads` 테이블
```sql
- id (SERIAL, PK)
- user_id (UUID, FK → users)
- resource_id (INTEGER, FK → resources)
- point_spent (INTEGER)
- created_at (TIMESTAMP)
```

### 자동화 기능 (트리거)

1. **사용자 프로필 자동 생성**
   - `auth.users`에 새 사용자 생성 시 `public.users` 프로필 자동 생성

2. **포인트 시스템**
   - 게시글 작성 시: +10 포인트
   - 댓글 작성 시: +5 포인트
   - 자료 다운로드 시: 포인트 차감 및 로그 기록

3. **통계 자동 업데이트**
   - 좋아요 수 자동 업데이트
   - 댓글 수 자동 업데이트
   - 다운로드 수 자동 업데이트

4. **레벨 자동 업데이트**
   - 포인트에 따른 레벨 자동 변경 (bronze → silver → gold)

---

## API 및 라우팅

### 인증 라우트

| 경로 | 메서드 | 설명 | 상태 |
|------|--------|------|------|
| `/login` | GET | 로그인 페이지 | ✅ |
| `/signup` | GET | 회원가입 페이지 | ✅ |
| `/api/auth/signout` | POST | 로그아웃 (서버 액션) | ✅ |

### 메인 라우트

| 경로 | 메서드 | 설명 | 상태 |
|------|--------|------|------|
| `/` | GET | 메인 페이지 | ✅ |

---

## 컴포넌트 명세

### 페이지 컴포넌트

#### `app/page.tsx` (메인 페이지)
- **타입**: Server Component
- **기능**: 
  - 최신 발행호 표시
  - 히어로 섹션 렌더링
  - 매거진 섹션 렌더링
- **상태**: 기본 구조 완료, 데이터 연동 예정

#### `app/(auth)/login/page.tsx` (로그인 페이지)
- **타입**: Client Component
- **기능**:
  - 이메일/비밀번호 로그인 폼
  - 로그인 상태 유지 옵션
  - 에러 처리 및 피드백
  - 로그인 성공 시 리다이렉트
- **상태**: ✅ 완료

#### `app/(auth)/signup/page.tsx` (회원가입 페이지)
- **타입**: Client Component
- **기능**:
  - 회원가입 폼 (이메일, 비밀번호, 이름 등)
  - 비밀번호 확인
  - 이메일 인증 플로우 지원
  - 에러 처리 및 피드백
- **상태**: ✅ 완료

### 레이아웃 컴포넌트

#### `app/layout.tsx` (루트 레이아웃)
- **타입**: Server Component
- **기능**:
  - 전역 메타데이터 설정
  - 폰트 로딩 (Noto Sans KR, Noto Serif KR)
  - Header 컴포넌트 포함
- **상태**: ✅ 완료

#### `components/layout/header.tsx` (헤더)
- **타입**: Server Component
- **기능**:
  - 로고 및 네비게이션 링크
  - UserButton 통합
  - 반응형 디자인
- **상태**: ✅ 완료

### 인증 컴포넌트

#### `components/auth/user-button.tsx` (사용자 버튼)
- **타입**: Client Component
- **기능**:
  - 인증 상태 확인
  - 로그인 전: 로그인/회원가입 버튼
  - 로그인 후: 사용자 이름 및 로그아웃 버튼
  - 실시간 인증 상태 업데이트
- **상태**: ✅ 완료

### UI 컴포넌트

#### `components/ui/button.tsx`
- **Props**: `variant`, `size`, `asChild`, `className`
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon
- **상태**: ✅ 완료

#### `components/ui/input.tsx`
- **Props**: 표준 HTML input props
- **기능**: 접근성 지원, 포커스 스타일
- **상태**: ✅ 완료

#### `components/ui/label.tsx`
- **Props**: Radix UI Label props
- **기능**: 접근성 지원
- **상태**: ✅ 완료

#### `components/ui/card.tsx`
- **Sub-components**: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **상태**: ✅ 완료

---

## 환경 설정

### 환경 변수 (`.env.local`)

```env
# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### npm 스크립트

```json
{
  "dev": "next dev",                    # 개발 서버 실행
  "build": "next build",                 # 프로덕션 빌드
  "start": "next start",                 # 프로덕션 서버 실행
  "lint": "next lint",                   # ESLint 실행
  "type-check": "tsc --noEmit",          # TypeScript 타입 체크
  "dev:legacy": "npx serve -l 3000"     # 기존 정적 사이트 실행
}
```

---

## 다음 단계

### 🔄 진행 중
- [ ] 메인 페이지 데이터 연동 (editions-data.js → Supabase)
- [ ] 기존 CSS 통합 (css/style.css)

### 📋 예정
- [ ] 발행호 선택 기능
- [ ] 검색 기능
- [ ] 커뮤니티 기능 (게시판, 댓글, 좋아요)
- [ ] 자료실 기능 (다운로드, 포인트 시스템)
- [ ] 마이페이지
- [ ] 관리자 페이지

---

## 참고 문서

- [리팩터링 계획서](./REFACTORING_PLAN.md)
- [설정 가이드](./REFACTORING_SETUP.md)
- [데이터베이스 스키마](./supabase-schema-v2.sql)

---

**마지막 업데이트**: 2026년 2월 6일
