# WEEKLY-NEXO Next.js 마이그레이션 - 시작 가이드

이 폴더에는 Next.js로 전환하기 위한 모든 핵심 설정 파일이 포함되어 있습니다.

## 🚀 빠른 시작

### 1. Next.js 프로젝트 생성

```bash
cd /Users/nexo_jo/Desktop/Nexo_workspace
npx create-next-app@latest weekly-nexo-nextjs --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd weekly-nexo-nextjs
```

### 2. 설정 파일 복사

```bash
# 이 폴더의 모든 파일을 새 프로젝트로 복사
cp -r ../WEEKLY-NEXO/nextjs-setup/* .
cp -r ../WEEKLY-NEXO/nextjs-setup/.* . 2>/dev/null || true
```

### 3. 패키지 설치

```bash
npm install
```

### 4. Shadcn/UI 초기화

```bash
npx shadcn@latest init
# 선택:
# - Style: Default
# - Base color: Slate  
# - CSS variables: Yes
```

### 5. Shadcn/UI 컴포넌트 설치

```bash
npx shadcn@latest add button card dialog form input label select textarea avatar badge separator tabs
```

### 6. 환경 변수 설정

```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase 정보 입력
```

### 7. Supabase 설정

1. [Supabase Dashboard](https://app.supabase.com)에서 새 프로젝트 생성
2. Settings > API에서 URL과 키 복사
3. `.env.local`에 입력:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. SQL Editor에서 `supabase/schema.sql` 실행

### 8. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

---

## 📁 파일 구조

```
nextjs-setup/
├── package.json              # 의존성 및 스크립트
├── next.config.js            # Next.js 설정
├── tsconfig.json            # TypeScript 설정
├── tailwind.config.ts       # Tailwind CSS 설정
├── middleware.ts            # 인증 미들웨어
├── .env.local.example       # 환경 변수 템플릿
├── app/
│   └── globals.css          # 전역 스타일
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # 브라우저용 Supabase 클라이언트
│   │   ├── server.ts        # 서버용 Supabase 클라이언트
│   │   └── middleware.ts    # 미들웨어 헬퍼
│   └── utils/
│       └── cn.ts            # className 병합 유틸리티
├── types/
│   ├── database.ts          # Supabase DB 타입
│   ├── article.ts           # Article 타입
│   └── user.ts              # User 타입
└── supabase/
    └── schema.sql           # 데이터베이스 스키마
```

---

## ✅ 체크리스트

- [ ] Next.js 프로젝트 생성 완료
- [ ] 설정 파일 복사 완료
- [ ] 패키지 설치 완료 (`npm install`)
- [ ] Shadcn/UI 초기화 완료
- [ ] 환경 변수 설정 완료 (`.env.local`)
- [ ] Supabase 프로젝트 생성 및 스키마 실행 완료
- [ ] 개발 서버 실행 성공 (`npm run dev`)

---

## 🔗 다음 단계

상세한 마이그레이션 가이드는 `../NEXTJS_MIGRATION_GUIDE.md`를 참고하세요.

Phase 2 작업:
1. 기존 `index.html` 레이아웃을 Next.js 컴포넌트로 변환
2. 기존 `editions-data.js` 데이터를 Supabase로 마이그레이션
3. 로그인/회원가입 페이지 구현

---

## 🆘 문제 해결

### 환경 변수 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 변수명이 `NEXT_PUBLIC_`로 시작하는지 확인 (클라이언트에서 사용 시)

### Supabase 연결 오류
- Supabase 프로젝트가 활성화되어 있는지 확인
- URL과 키가 올바른지 확인
- RLS 정책이 올바르게 설정되었는지 확인

### 타입 오류
- `npm run type-check` 실행하여 타입 오류 확인
- `types/database.ts`가 최신인지 확인
