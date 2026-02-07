# 환경 변수 설정 가이드 (.env.local)

마이그레이션을 위해 `.env.local` 파일에 Render.com과 Supabase 연결 정보를 설정해야 합니다.

---

## 📍 Step 1: 파일 위치 확인

`.env.local` 파일은 **프로젝트 루트**에 생성합니다:

```
WEEKLY-NEXO/
├── .env.local          ← 여기에 생성
├── index.html
├── package.json
└── ...
```

---

## 🔑 Step 2: Render.com 연결 정보 가져오기

### 2-1. Render.com Dashboard 접속

1. [Render Dashboard](https://dashboard.render.com) 로그인
2. PostgreSQL 데이터베이스 클릭

### 2-2. External Database URL 복사

1. 데이터베이스 페이지에서 **"Info"** 탭 클릭
2. **"Connections"** 섹션 찾기
3. **"External Database URL"** 복사

   형식 예시:
   ```
   postgres://user:password@hostname:5432/database_name
   ```

   또는 **"Internal Database URL"** (같은 Render 네트워크 내에서 사용)

### 2-3. URL 확인

- URL이 `postgres://`로 시작해야 합니다
- 비밀번호가 포함되어 있으므로 **절대 공개하지 마세요!**

---

## 🔐 Step 3: Supabase API 키 가져오기

### 3-1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. **WEEKLY-NEXO** 프로젝트 선택

### 3-2. Settings > API 이동

1. 왼쪽 사이드바에서 **"Settings"** (⚙️ 아이콘) 클릭
2. **"API"** 섹션 클릭

### 3-3. 키 복사

다음 두 가지 키를 복사합니다:

1. **Project URL**
   ```
   https://icriajfrxwykufhmkfun.supabase.co
   ```

2. **service_role key** (⚠️ 중요: 절대 공개하지 마세요!)
   - "Project API keys" 섹션에서 찾기
   - **"service_role"** 키 (secret 키) 복사
   - `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 형식

---

## 📝 Step 4: .env.local 파일 생성

### 4-1. 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성합니다.

**방법 1: 터미널에서 생성**
```bash
cd /Users/nexo_jo/Desktop/Nexo_workspace/WEEKLY-NEXO
touch .env.local
```

**방법 2: 에디터에서 생성**
- Cursor/VSCode에서 새 파일 생성
- 파일명: `.env.local` (점으로 시작)
- 위치: 프로젝트 루트 (`WEEKLY-NEXO/`)

### 4-2. 내용 작성

`.env.local` 파일에 다음 내용을 작성합니다:

```env
# Render.com PostgreSQL 연결 정보
RENDER_DATABASE_URL=postgres://user:password@hostname:5432/database_name

# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here

# 마이그레이션 옵션 (선택사항)
# DRY_RUN=true              # 시뮬레이션만 실행 (실제 마이그레이션 안 함)
# TEMP_PASSWORD=TempPass123  # 모든 사용자에게 동일한 임시 비밀번호 사용
```

### 4-3. 실제 값으로 교체

위 예시를 실제 값으로 교체하세요:

1. **RENDER_DATABASE_URL**: Render.com에서 복사한 External Database URL
2. **NEXT_PUBLIC_SUPABASE_URL**: Supabase Project URL (이미 올바름)
3. **SUPABASE_SERVICE_ROLE_KEY**: Supabase에서 복사한 service_role 키

---

## ✅ Step 5: 파일 확인

### 5-1. 형식 확인

- 각 변수는 `KEY=value` 형식
- 공백 없이 `=`로 연결
- 값에 공백이 있으면 따옴표로 감싸기 (일반적으로 필요 없음)
- 주석은 `#`으로 시작

### 5-2. 보안 확인

- ✅ `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- ✅ Git에 커밋하지 않았는지 확인
- ✅ 공개 저장소에 업로드하지 않았는지 확인

---

## 🧪 Step 6: 연결 테스트

### 6-1. 패키지 설치

```bash
npm install dotenv @supabase/supabase-js pg
```

### 6-2. 간단한 테스트 스크립트 실행

프로젝트 루트에 `test-connection.js` 파일 생성:

```javascript
require('dotenv').config({ path: '.env.local' });

console.log('🔍 환경 변수 확인:');
console.log('RENDER_DATABASE_URL:', process.env.RENDER_DATABASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨' : '❌ 없음');
```

실행:
```bash
node test-connection.js
```

모두 "✅ 설정됨"이 나와야 합니다.

---

## 🚨 주의사항

### 1. 파일 위치
- ❌ `nextjs-setup/.env.local` (잘못된 위치)
- ✅ `WEEKLY-NEXO/.env.local` (프로젝트 루트)

### 2. 파일명
- ❌ `.env` (개발용, Git에 포함될 수 있음)
- ❌ `env.local` (점이 없음)
- ✅ `.env.local` (로컬 전용, Git 무시됨)

### 3. 보안
- ⚠️ **절대 공개하지 마세요**: `.env.local` 파일은 개인 정보가 포함됩니다
- ⚠️ **Git에 커밋하지 마세요**: `.gitignore`에 포함되어 있는지 확인
- ⚠️ **공유하지 마세요**: 다른 사람과 공유하지 마세요

---

## 📋 체크리스트

- [ ] Render.com에서 External Database URL 복사 완료
- [ ] Supabase에서 Project URL 확인 완료
- [ ] Supabase에서 service_role 키 복사 완료
- [ ] 프로젝트 루트에 `.env.local` 파일 생성 완료
- [ ] 모든 환경 변수 입력 완료
- [ ] 연결 테스트 완료

---

## 🆘 문제 해결

### "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### "RENDER_DATABASE_URL is not defined"
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일명이 정확히 `.env.local`인지 확인 (숨김 파일)
- 스크립트에서 `require('dotenv').config({ path: '.env.local' })` 사용

### "connection refused" 또는 연결 오류
- Render.com URL이 올바른지 확인
- Supabase 키가 올바른지 확인
- 네트워크 연결 확인

---

## 📝 예시 파일

완성된 `.env.local` 파일 예시:

```env
# Render.com PostgreSQL 연결 정보
RENDER_DATABASE_URL=postgres://nexo_user:abc123xyz@dpg-xxxxx-a.singapore-postgres.render.com:5432/nexo_weekly_db

# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmlhamZyeHd5a3VmaG1rZnVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzg5MjM0NSwiZXhwIjoyMDMzNDY4MzQ1fQ.실제키는여기에있습니다

# 마이그레이션 옵션 (선택사항)
# DRY_RUN=true
```

**⚠️ 위 예시는 실제 값이 아닙니다. 실제 값으로 교체하세요!**

---

준비가 완료되면 마이그레이션을 실행할 수 있습니다:

```bash
# 시뮬레이션 (안전)
DRY_RUN=true node scripts/migrate-render-to-supabase-with-password.js

# 실제 마이그레이션
node scripts/migrate-render-to-supabase-with-password.js
```
