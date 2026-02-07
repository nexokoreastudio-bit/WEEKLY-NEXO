# WEEKLY-NEXO → Next.js 마이그레이션 가이드

## 🚀 Phase 1: 프로젝트 초기 설정

### 1단계: Next.js 프로젝트 생성

```bash
# 새 프로젝트 생성 (기존 프로젝트와 병행하여 개발)
cd /Users/nexo_jo/Desktop/Nexo_workspace
npx create-next-app@latest weekly-nexo-nextjs --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# 프로젝트 디렉토리로 이동
cd weekly-nexo-nextjs

# Shadcn/UI 초기화
npx shadcn@latest init
# 선택사항:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### 2단계: 필수 패키지 설치

```bash
# Supabase 클라이언트
npm install @supabase/supabase-js @supabase/ssr

# Zustand (상태 관리)
npm install zustand

# 날짜/시간 처리
npm install date-fns

# 이미지 최적화 (Next.js Image와 함께 사용)
npm install sharp

# 폼 검증
npm install zod react-hook-form @hookform/resolvers

# Shadcn/UI 컴포넌트 추가 설치
npx shadcn@latest add button card dialog form input label select textarea avatar badge separator tabs
```

### 3단계: 환경 변수 설정

`.env.local` 파일 생성:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 프로젝트 폴더 구조

```
weekly-nexo-nextjs/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (community)/              # 커뮤니티 라우트 그룹
│   │   ├── community/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── write/
│   │       └── page.tsx
│   ├── admin/                    # 관리자 페이지
│   │   ├── articles/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── tools/                    # 쌤 도구함
│   │   └── page.tsx
│   ├── mypage/                   # 마이페이지
│   │   └── page.tsx
│   ├── api/                      # API Routes
│   │   └── webhooks/
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈페이지
│   └── globals.css               # 전역 스타일
├── components/                   # React 컴포넌트
│   ├── ui/                       # Shadcn/UI 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── UserWidget.tsx
│   ├── articles/                 # 뉴스/매거진 컴포넌트
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleDetail.tsx
│   │   └── ArticleList.tsx
│   ├── community/                # 커뮤니티 컴포넌트
│   │   ├── PostCard.tsx
│   │   ├── PostForm.tsx
│   │   └── CommentSection.tsx
│   ├── tools/                    # 쌤 도구함 컴포넌트
│   │   ├── Timer.tsx
│   │   ├── RandomPicker.tsx
│   │   └── ToolsGrid.tsx
│   └── admin/                    # 관리자 컴포넌트
│       └── ArticleEditor.tsx
├── lib/                          # 유틸리티 및 설정
│   ├── supabase/                 # Supabase 클라이언트
│   │   ├── client.ts            # 브라우저용 클라이언트
│   │   ├── server.ts            # 서버용 클라이언트
│   │   └── middleware.ts        # 미들웨어 헬퍼
│   ├── utils/                    # 유틸리티 함수
│   │   ├── cn.ts                # className 병합
│   │   └── format.ts            # 날짜/숫자 포맷팅
│   └── constants/                # 상수
│       └── config.ts
├── types/                        # TypeScript 타입 정의
│   ├── database.ts              # Supabase DB 타입
│   ├── article.ts
│   ├── user.ts
│   └── post.ts
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts
│   ├── useArticles.ts
│   └── usePoints.ts
├── store/                        # Zustand 스토어
│   └── authStore.ts
├── public/                       # 정적 파일
│   ├── images/
│   └── downloads/
├── scripts/                      # 유틸리티 스크립트
│   └── seed-articles.ts        # 기존 데이터 마이그레이션
└── middleware.ts                # Next.js 미들웨어
```

---

## 🔧 핵심 설정 파일

**✅ 모든 핵심 설정 파일이 `nextjs-setup/` 폴더에 준비되어 있습니다.**

다음 파일들을 확인하고 새 프로젝트에 복사하세요:

1. **`package.json`** - 의존성 및 스크립트
2. **`next.config.js`** - Next.js 설정
3. **`tsconfig.json`** - TypeScript 설정
4. **`tailwind.config.ts`** - Tailwind CSS 설정
5. **`middleware.ts`** - 인증 미들웨어
6. **`lib/supabase/`** - Supabase 클라이언트 (client.ts, server.ts, middleware.ts)
7. **`types/`** - TypeScript 타입 정의 (database.ts, article.ts, user.ts)
8. **`app/globals.css`** - 전역 스타일
9. **`.env.local.example`** - 환경 변수 템플릿

### Supabase 스키마 설정

**`nextjs-setup/supabase/schema.sql`** 파일을 Supabase Dashboard > SQL Editor에서 실행하세요.

이 스키마는 다음을 포함합니다:
- 사용자 프로필 확장 테이블
- 뉴스/매거진 (articles)
- 커뮤니티 게시글 (posts)
- 댓글 (comments)
- 좋아요 (likes)
- 자료실 (resources)
- 포인트 로그 (point_logs)
- 다운로드 이력 (downloads)
- RLS (Row Level Security) 정책
- 자동 트리거 함수 (포인트 지급, 카운트 업데이트 등)

---

## 📋 다음 단계 (Phase 2)

### 1. 프로젝트 초기화 완료 확인

```bash
# 새 프로젝트 생성 후
cd weekly-nexo-nextjs

# nextjs-setup 폴더의 파일들을 복사
cp -r ../WEEKLY-NEXO/nextjs-setup/* .

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase 정보 입력

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. Supabase 프로젝트 생성 및 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Settings > API에서 URL과 키 복사
3. `.env.local`에 입력
4. SQL Editor에서 `supabase/schema.sql` 실행

### 3. Shadcn/UI 컴포넌트 설치

```bash
npx shadcn@latest add button card dialog form input label select textarea avatar badge separator tabs
```

### 4. 기존 데이터 마이그레이션

`scripts/seed-articles.ts` 스크립트를 작성하여 `js/editions-data.js`의 데이터를 Supabase `articles` 테이블로 이전합니다.

---

## 🎯 Phase 2 작업 요청

다음 단계로 진행하려면 다음을 요청하세요:

1. **"Phase 2: 기존 index.html의 헤더와 레이아웃을 Next.js 컴포넌트로 변환해줘"**
2. **"기존 editions-data.js 데이터를 Supabase articles 테이블로 마이그레이션하는 스크립트 작성해줘"**
3. **"로그인/회원가입 페이지를 Next.js로 구현해줘"**

---

## 📚 참고 자료

- [Next.js 14 공식 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Shadcn/UI 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
