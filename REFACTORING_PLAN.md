# WEEKLY-NEXO 리팩터링 계획서

## 🎯 프로젝트 목표

정적 웹사이트를 **Next.js 14 기반의 에듀테크 커뮤니티 플랫폼**으로 전환

### 핵심 가치
- **정보 습득 (News)**: 매주 목요일 발행 전자신문
- **자료 공유 (Resources)**: 선생님용 교육 자료 다운로드
- **소통 (Community)**: 게시판, 댓글, 좋아요
- **보상 (Points)**: 활동 포인트 및 등급 시스템

---

## 📋 Phase별 작업 계획

### Phase 1: 프로젝트 초기 설정 ✅ (진행 중)
- [x] 데이터베이스 스키마 설계 (`supabase-schema-v2.sql`)
- [x] TypeScript 타입 정의 (`types/database-v2.ts`)
- [ ] Next.js 14 프로젝트 생성
- [ ] Supabase 클라이언트 설정
- [ ] Tailwind CSS + Shadcn/UI 설정

### Phase 2: 인증 시스템 구현
- [ ] Supabase Auth 연동
- [ ] 로그인/회원가입 페이지
- [ ] 세션 관리 (Middleware)
- [ ] 사용자 프로필 관리

### Phase 3: 기존 기능 마이그레이션
- [ ] `editions-data.js` → Supabase `articles` 테이블
- [ ] 메인 페이지 리팩터링 (기존 `index.html` → Next.js)
- [ ] 발행물 관리 시스템
- [ ] 이미지 업로드 (Supabase Storage)

### Phase 4: 커뮤니티 기능 구현
- [ ] 게시판 (자유게시판, Q&A, 팁, 중고장터)
- [ ] 댓글 시스템
- [ ] 좋아요 기능
- [ ] 이미지 업로드 (게시글)

### Phase 5: 자료실 및 포인트 시스템
- [ ] 자료실 UI
- [ ] 다운로드 기능
- [ ] 포인트 차감 로직
- [ ] 포인트 로그 조회
- [ ] 등급 시스템 (bronze/silver/gold)

### Phase 6: UI/UX 개선
- [ ] Shadcn/UI 컴포넌트 적용
- [ ] 반응형 디자인
- [ ] 다크모드 (선택사항)
- [ ] 애니메이션 및 인터랙션

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블
1. **users**: 사용자 프로필 (role, point, level 포함)
2. **articles**: 뉴스/매거진 (기존 editions 대체)
3. **posts**: 커뮤니티 게시글
4. **comments**: 댓글
5. **likes**: 좋아요
6. **resources**: 자료실
7. **point_logs**: 포인트 로그
8. **downloads**: 다운로드 이력

### 자동화 기능
- 새 사용자 생성 시 프로필 자동 생성 (트리거)
- 게시글 작성 시 +10 포인트 (트리거)
- 댓글 작성 시 +5 포인트 (트리거)
- 좋아요 수 자동 업데이트 (트리거)
- 포인트에 따른 레벨 자동 업데이트 (트리거)

---

## 🛠️ 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (Auth, Postgres, Storage, Realtime)
- **State Management**: Zustand (필요시)
- **Deployment**: Vercel (권장) 또는 Netlify

---

## 📁 프로젝트 구조 (예상)

```
weekly-nexo-nextjs/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── (community)/       # 커뮤니티 페이지
│   │   ├── posts/
│   │   └── boards/
│   ├── resources/         # 자료실
│   ├── mypage/            # 마이페이지
│   └── layout.tsx
├── components/             # React 컴포넌트
│   ├── ui/               # Shadcn/UI 컴포넌트
│   ├── articles/         # 아티클 관련
│   ├── posts/            # 게시글 관련
│   └── resources/        # 자료실 관련
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/        # Supabase 클라이언트
│   ├── utils/           # 공통 유틸리티
│   └── hooks/           # Custom Hooks
├── types/                # TypeScript 타입 정의
├── supabase/            # Supabase 관련 파일
│   └── schema.sql      # 데이터베이스 스키마
└── public/              # 정적 파일
```

---

## 🚀 다음 단계

1. **Supabase 스키마 실행**: `supabase-schema-v2.sql` 실행
2. **Next.js 프로젝트 생성**: 새 프로젝트 또는 기존 프로젝트 확장
3. **기본 구조 생성**: 폴더 구조 및 설정 파일
4. **인증 시스템 구현**: 로그인/회원가입
5. **기존 데이터 마이그레이션**: editions-data.js → articles 테이블

---

**작성일**: 2026년 2월 6일  
**버전**: 2.0.0

