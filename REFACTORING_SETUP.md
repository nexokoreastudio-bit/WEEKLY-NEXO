# 리팩터링 설정 가이드

## ✅ 완료된 작업

1. ✅ Next.js 기본 구조 생성 (`app/`, `lib/`, `types/` 폴더)
2. ✅ Supabase 클라이언트 설정 (기존 연결 활용)
3. ✅ TypeScript 타입 정의
4. ✅ Tailwind CSS + Shadcn/UI 설정
5. ✅ package.json 업데이트 (Next.js 의존성 추가)

## 🔧 다음 단계

### 1단계: 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
# Supabase 연결 정보 (Next.js용)
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmlhamZyeHd5a3VmaG1rZnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjc3MzMsImV4cCI6MjA4NTk0MzczM30.WBGKJyHjeEfCvrIwJ_LRH3SugcCD12ggFdFZ9T7mnzs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmlhamZyeHd5a3VmaG1rZnVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM2NzczMywiZXhwIjoyMDg1OTQzNzMzfQ.OELYKcGtloi9JaXGgMEZNx2FFtm_xRfgfwolKZqzmck
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**참고**: `SUPABASE_SERVICE_ROLE_KEY`는 이미 `.env.local`에 있으므로, `NEXT_PUBLIC_`로 시작하는 두 개만 추가하면 됩니다.

### 2단계: 패키지 설치

```bash
cd /Users/soriul79/workspace/NEXOKOREA/WEEKLY-NEXO
npm install
```

### 3단계: Supabase 스키마 실행

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. SQL Editor 이동
3. `supabase-schema-v2.sql` 파일 내용 복사
4. SQL Editor에 붙여넣고 실행

### 4단계: Next.js 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 5단계: 기존 사이트 접속 (병행 사용)

기존 정적 사이트는 계속 사용 가능:
```bash
npm run dev:legacy
```

http://localhost:3000 (Next.js)와 http://localhost:8080 (기존)을 병행 사용 가능

---

## 📁 프로젝트 구조

```
WEEKLY-NEXO/
├── app/                    # Next.js App Router (새로 생성)
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 메인 페이지
│   └── globals.css       # 전역 스타일
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/        # Supabase 클라이언트 (기존 연결 활용)
│   └── utils/           # 공통 유틸리티
├── types/                # TypeScript 타입 정의
│   └── database.ts      # Supabase DB 타입
├── components/           # React 컴포넌트 (추가 예정)
├── index.html            # 기존 정적 사이트 (유지)
├── js/                   # 기존 JavaScript (유지)
└── package.json          # Next.js 의존성 추가됨
```

---

## 🎯 다음 작업

1. Supabase 스키마 실행 (`supabase-schema-v2.sql`)
2. 패키지 설치 (`npm install`)
3. Next.js 개발 서버 실행 (`npm run dev`)
4. 인증 시스템 구현
5. 기존 기능 마이그레이션

