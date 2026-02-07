# Supabase로 새로 시작하기 (Render.com 마이그레이션 불필요)

현재 WEEKLY-NEXO는 **localStorage 기반**으로 작동하고 있으며, Render.com DB를 사용하지 않았습니다.

따라서 **Render.com 마이그레이션은 필요 없고**, Supabase로 새로 시작하면 됩니다.

---

## ✅ 현재 상황

- ✅ Supabase 프로젝트 생성 완료
- ✅ Supabase 스키마 실행 완료 (모든 테이블 생성됨)
- ✅ `.env.local` 파일 생성 완료
- ❌ Render.com DB 사용 안 함 → 마이그레이션 불필요

---

## 🚀 다음 단계: Supabase로 새로 시작

### Step 1: .env.local 파일 설정

`.env.local` 파일에서 **Render.com 관련 부분을 제거**하고 Supabase만 설정:

```env
# Supabase 연결 정보만 필요
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Render.com 관련은 제거하거나 주석 처리
# RENDER_DATABASE_URL=... (필요 없음)
```

### Step 2: Supabase API 키 설정

1. Supabase Dashboard > Settings > API 이동
2. **service_role key** 복사
3. `.env.local` 파일의 `SUPABASE_SERVICE_ROLE_KEY=` 뒤에 붙여넣기

### Step 3: 기존 localStorage 데이터 처리 (선택사항)

현재 브라우저에 저장된 회원 데이터가 있다면:

#### 옵션 A: 새로 시작 (권장)
- 기존 localStorage 데이터는 무시
- 사용자가 새로 회원가입
- 깔끔하게 시작

#### 옵션 B: localStorage 데이터를 Supabase로 이전
- 브라우저 개발자 도구에서 localStorage 데이터 확인
- 수동으로 Supabase에 추가 (관리자 권한 필요)

---

## 📋 Supabase 설정 체크리스트

- [x] Supabase 프로젝트 생성 완료
- [x] 스키마 실행 완료 (테이블 생성됨)
- [ ] `.env.local` 파일에 Supabase 키 추가 완료
- [ ] Supabase Auth 설정 확인 (이메일/비밀번호 로그인 활성화)
- [ ] Next.js 프로젝트 설정 준비

---

## 🔧 Supabase Auth 설정 확인

### 이메일/비밀번호 로그인 활성화

1. Supabase Dashboard > **Authentication** > **Providers** 이동
2. **Email** 프로바이더 확인
3. **"Enable Email provider"** 활성화되어 있는지 확인
4. 필요시 **"Confirm email"** 설정 (개발 중에는 비활성화 가능)

### 카카오톡 소셜 로그인 (선택사항)

1. **Authentication** > **Providers** > **Kakao** 클릭
2. Kakao Developers에서 앱 생성 및 키 발급
3. Client ID와 Client Secret 입력
4. Redirect URL 설정: `https://icriajfrxwykufhmkfun.supabase.co/auth/v1/callback`

---

## 🎯 Next.js 프로젝트로 전환 준비

이제 Supabase가 준비되었으므로:

1. **Next.js 프로젝트 생성** (아직 안 했다면)
2. **Supabase 클라이언트 설정** (`nextjs-setup/lib/supabase/` 파일들 사용)
3. **로그인/회원가입 페이지 구현** (Supabase Auth 사용)
4. **기존 localStorage 코드를 Supabase Auth로 교체**

---

## 📝 .env.local 파일 최종 버전

```env
# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.실제키여기에

# 앱 설정 (Next.js 프로젝트용)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Render.com 관련은 필요 없음 (제거)
```

---

## 🆘 다음 단계

1. **Supabase API 키 설정 완료** → Next.js 프로젝트 설정 진행
2. **기존 코드를 Supabase Auth로 전환** → 로그인/회원가입 페이지 구현
3. **커뮤니티 기능 구현** → 게시판, 댓글, 좋아요 등

---

**Render.com 마이그레이션 스크립트는 필요 없습니다!**  
Supabase로 새로 시작하면 됩니다. 🚀
