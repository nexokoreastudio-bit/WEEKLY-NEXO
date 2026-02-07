# Supabase API 키 설명

Supabase에는 두 가지 주요 API 키가 있습니다. 용도가 다르므로 구분해서 사용해야 합니다.

---

## 🔑 두 가지 키

### 1. **Publishable key (anon key)** - 클라이언트 사이드용
- **이름**: `anon` 또는 `publishable`
- **형식**: `sb_publishable_...` 또는 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **용도**: 브라우저(클라이언트)에서 사용
- **보안**: 공개해도 안전 (RLS 정책이 있으면)
- **사용 위치**: Next.js 클라이언트 컴포넌트, 브라우저 JavaScript

### 2. **Service Role Key** - 서버 사이드용 ⚠️
- **이름**: `service_role`
- **형식**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT 토큰)
- **용도**: 서버에서 사용 (마이그레이션, 관리 작업)
- **보안**: **절대 공개하지 마세요!** (모든 권한을 가짐)
- **사용 위치**: 서버 사이드 코드, 마이그레이션 스크립트

---

## 📍 Supabase Dashboard에서 찾는 방법

### Step 1: Settings > API 이동

1. Supabase Dashboard 로그인
2. 왼쪽 사이드바에서 **"Settings"** (⚙️) 클릭
3. **"API"** 섹션 클릭

### Step 2: 두 가지 키 확인

**"Project API keys"** 섹션에서:

1. **anon public** (Publishable key)
   - 클라이언트 사이드용
   - 공개해도 안전
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 사용

2. **service_role** (Secret key) ⚠️
   - 서버 사이드용
   - **절대 공개하지 마세요!**
   - `SUPABASE_SERVICE_ROLE_KEY`로 사용
   - "Reveal" 버튼을 클릭해야 보임

---

## 📝 .env.local 파일 설정

### Next.js 프로젝트용 (권장)

```env
# 클라이언트 사이드용 (공개 가능)
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...또는_eyJhbGci...

# 서버 사이드용 (비밀, 절대 공개하지 마세요!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.서비스롤키...
```

### 마이그레이션 스크립트용 (현재)

```env
# 마이그레이션 스크립트는 서버 사이드이므로 Service Role Key만 필요
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.서비스롤키...
```

---

## ✅ 현재 상황 확인

### 지금 보고 계신 키는?

**"Publishable key"** (`sb_publishable_...`)를 보고 계시는 것 같습니다.

- ✅ **맞습니다**: Next.js 클라이언트 사이드에서 사용할 키입니다
- ❌ **아닙니다**: 마이그레이션 스크립트용 Service Role Key가 아닙니다

### 마이그레이션을 위해서는?

**Service Role Key**가 필요합니다:

1. 같은 페이지(Settings > API)에서
2. **"service_role"** 키 찾기
3. **"Reveal"** 버튼 클릭하여 표시
4. 복사하여 `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY=`에 붙여넣기

---

## 🔍 키 구분 방법

### Publishable key (anon key)
- ✅ `sb_publishable_`로 시작하거나
- ✅ "Publishable key" 또는 "anon public" 라벨
- ✅ "can be safely shared publicly" 메시지
- ✅ 클라이언트 사이드용

### Service Role Key
- ✅ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`로 시작 (JWT)
- ✅ "service_role" 라벨
- ✅ "secret" 또는 "⚠️" 경고 표시
- ✅ "Reveal" 버튼을 눌러야 보임
- ✅ 서버 사이드용

---

## 📋 체크리스트

- [ ] Settings > API 페이지 확인
- [ ] "anon public" 키 확인 (클라이언트용)
- [ ] "service_role" 키 찾기
- [ ] "Reveal" 버튼 클릭하여 Service Role Key 표시
- [ ] Service Role Key 복사
- [ ] `.env.local` 파일에 `SUPABASE_SERVICE_ROLE_KEY=` 추가

---

## 🆘 Service Role Key를 찾을 수 없어요

1. **같은 페이지 확인**: Settings > API에서 아래로 스크롤
2. **"Project API keys"** 섹션 확인
3. **"service_role"** 라벨 찾기
4. **"Reveal"** 버튼 클릭 (숨겨져 있을 수 있음)

---

## 💡 요약

**현재 보고 계신 키 (Publishable key)**:
- ✅ Next.js 클라이언트 사이드에서 사용할 키 (나중에 필요)
- ❌ 마이그레이션 스크립트용이 아님

**마이그레이션을 위해서는**:
- ✅ **Service Role Key** 필요
- ✅ 같은 페이지에서 "service_role" 찾기
- ✅ "Reveal" 버튼 클릭하여 복사

---

**다음 단계**: Settings > API 페이지에서 "service_role" 키를 찾아 `.env.local`에 추가하세요!
