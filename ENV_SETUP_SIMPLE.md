# .env.local 파일 설정하기 (간단 버전)

## 📝 Step 1: 파일 생성

프로젝트 루트에 `.env.local` 파일이 이미 생성되어 있습니다.
이제 실제 값으로 채워넣으면 됩니다.

---

## 🔑 Step 2: Render.com 연결 정보 가져오기

### Render Dashboard에서:

1. [Render Dashboard](https://dashboard.render.com) 접속
2. PostgreSQL 데이터베이스 클릭
3. **"Info"** 탭 클릭
4. **"Connections"** 섹션에서 **"External Database URL"** 복사

   예시:
   ```
   postgres://nexo_user:abc123@dpg-xxxxx-a.singapore-postgres.render.com:5432/nexo_db
   ```

5. `.env.local` 파일의 `RENDER_DATABASE_URL=` 뒤에 붙여넣기

---

## 🔐 Step 3: Supabase API 키 가져오기

### Supabase Dashboard에서:

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. **WEEKLY-NEXO** 프로젝트 선택
3. 왼쪽 사이드바에서 **"Settings"** (⚙️) 클릭
4. **"API"** 클릭
5. 다음 두 가지 복사:

   **a) Project URL** (이미 올바름):
   ```
   https://icriajfrxwykufhmkfun.supabase.co
   ```
   → `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL=` 뒤에 붙여넣기

   **b) service_role key** (⚠️ 절대 공개하지 마세요!):
   - "Project API keys" 섹션에서 찾기
   - **"service_role"** 키 복사 (secret 키)
   - `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 형식
   → `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY=` 뒤에 붙여넣기

---

## ✅ Step 4: 파일 확인

완성된 `.env.local` 파일 예시:

```env
RENDER_DATABASE_URL=postgres://user:password@host:5432/database
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.실제키여기에붙여넣기
```

**⚠️ 주의:**
- 각 줄은 `KEY=value` 형식 (공백 없음)
- 값에 공백이 있으면 따옴표로 감싸기
- 주석은 `#`으로 시작

---

## 🧪 Step 5: 연결 테스트

터미널에서 실행:

```bash
# 패키지 설치
npm install dotenv @supabase/supabase-js pg

# 환경 변수 확인
node -e "require('dotenv').config({ path: '.env.local' }); console.log('RENDER:', process.env.RENDER_DATABASE_URL ? '✅' : '❌'); console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'); console.log('SUPABASE KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');"
```

모두 ✅가 나오면 성공입니다!

---

## 🚀 다음 단계

환경 변수 설정이 완료되면 마이그레이션을 실행할 수 있습니다:

```bash
# 시뮬레이션 (안전)
DRY_RUN=true node scripts/migrate-render-to-supabase-with-password.js

# 실제 마이그레이션
node scripts/migrate-render-to-supabase-with-password.js
```

---

## 🆘 문제 해결

### 파일이 보이지 않아요
- `.env.local`은 숨김 파일입니다
- Cursor/VSCode에서 `Cmd+Shift+.` (Mac) 또는 `Ctrl+Shift+.` (Windows)로 숨김 파일 표시

### "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### 값이 읽히지 않아요
- 파일이 프로젝트 루트에 있는지 확인 (`WEEKLY-NEXO/.env.local`)
- 파일명이 정확히 `.env.local`인지 확인 (점으로 시작)
- 각 줄에 공백이나 특수문자가 없는지 확인

---

**상세 가이드**: `ENV_SETUP_GUIDE.md` 참고
