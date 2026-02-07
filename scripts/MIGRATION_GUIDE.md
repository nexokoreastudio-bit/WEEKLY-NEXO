# Render.com → Supabase 마이그레이션 가이드

이 가이드는 Render.com PostgreSQL에서 Supabase로 회원 데이터를 마이그레이션하는 방법을 설명합니다.

---

## 📋 사전 준비

### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com)에서 새 프로젝트 생성
2. Settings > API에서 다음 정보 확인:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) - **절대 공개하지 마세요!**

### 2. Supabase 스키마 실행

1. Supabase Dashboard > SQL Editor 열기
2. `nextjs-setup/supabase/schema.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블과 RLS 정책이 생성되었는지 확인

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
# Render.com PostgreSQL 연결 정보
RENDER_DATABASE_URL=postgres://user:password@host:port/database
# 또는
DATABASE_URL=postgres://user:password@host:port/database

# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 마이그레이션 옵션 (선택사항)
DRY_RUN=true              # 실제 마이그레이션 없이 시뮬레이션만 실행
TEMP_PASSWORD=TempPass123 # 모든 사용자에게 동일한 임시 비밀번호 사용
```

---

## 🚀 마이그레이션 실행

### 방법 1: 비밀번호 재설정 링크 방식 (권장)

사용자가 이메일로 비밀번호 재설정 링크를 받아 새 비밀번호를 설정합니다.

```bash
# 패키지 설치
npm install dotenv @supabase/supabase-js pg

# 마이그레이션 실행
node scripts/migrate-render-to-supabase.js
```

**장점:**
- 보안성이 높음 (기존 비밀번호 해시 사용 불가)
- 사용자가 직접 비밀번호 설정

**단점:**
- 사용자가 이메일을 확인해야 함
- 일부 사용자가 링크를 클릭하지 않을 수 있음

### 방법 2: 임시 비밀번호 방식

모든 사용자에게 임시 비밀번호를 생성하여 마이그레이션합니다.

```bash
# 패키지 설치
npm install dotenv @supabase/supabase-js pg

# 마이그레이션 실행
node scripts/migrate-render-to-supabase-with-password.js
```

**옵션:**
- 모든 사용자에게 동일한 임시 비밀번호 사용:
  ```bash
  TEMP_PASSWORD=TempPass123 node scripts/migrate-render-to-supabase-with-password.js
  ```
- 시뮬레이션만 실행 (실제 마이그레이션 없음):
  ```bash
  DRY_RUN=true node scripts/migrate-render-to-supabase-with-password.js
  ```

**장점:**
- 즉시 마이그레이션 가능
- 사용자가 바로 로그인 가능

**단점:**
- 임시 비밀번호를 안전하게 전달해야 함
- CSV 파일에 저장되므로 보안 주의 필요

---

## 📊 데이터 매핑

### Render.com `members` → Supabase `users`

| Render.com | Supabase | 비고 |
|-----------|----------|------|
| `id` | `auth.users.id` | 새 UUID 생성 (Supabase Auth) |
| `email` | `email` | 동일 |
| `name` | `nickname` | 이름 → 닉네임 |
| `academy_name` | `academy_name` | 동일 |
| `phone` | `user_metadata.phone` | 메타데이터에 저장 |
| `referrer_code` | `referrer_code` | 동일 |
| `subscription_status` | `role` | 'active' → 'teacher', 그 외 → 'user' |
| `created_at` | `created_at` | 동일 |
| `password_hash` | ❌ | 마이그레이션 불가 (임시 비밀번호 또는 재설정 링크) |

---

## ⚠️ 주의사항

### 1. 비밀번호 마이그레이션 불가

Supabase는 bcrypt 해시를 직접 사용할 수 없습니다. 따라서:
- **방법 1**: 사용자에게 비밀번호 재설정 링크 전송
- **방법 2**: 임시 비밀번호 생성 후 안전하게 전달

### 2. 이메일 중복 확인

마이그레이션 전에 Supabase에 이미 존재하는 이메일이 있는지 확인하세요.

```sql
-- Supabase SQL Editor에서 실행
SELECT email FROM auth.users;
```

### 3. 백업

마이그레이션 전에 Render.com 데이터를 백업하세요:

```bash
# Render.com 데이터 덤프
pg_dump "postgres://user:password@host:port/database" > render-backup.sql
```

### 4. 테스트

먼저 소수의 사용자로 테스트하세요:

```sql
-- Render.com에서 테스트용 사용자만 선택
SELECT * FROM members LIMIT 5;
```

---

## 🔍 마이그레이션 후 확인

### 1. 사용자 수 확인

```sql
-- Supabase SQL Editor에서 실행
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM public.users;
```

두 숫자가 일치해야 합니다.

### 2. 샘플 데이터 확인

```sql
-- Supabase SQL Editor에서 실행
SELECT 
  u.email,
  u.nickname,
  u.academy_name,
  u.role,
  u.point,
  u.level,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC
LIMIT 10;
```

### 3. 로그인 테스트

임시 비밀번호로 로그인이 되는지 확인하세요.

---

## 🐛 문제 해결

### 오류: "duplicate key value violates unique constraint"

이미 Supabase에 해당 이메일이 존재합니다. 마이그레이션 전에 확인하세요.

```sql
-- Supabase에서 중복 확인
SELECT email FROM auth.users WHERE email IN (
  SELECT email FROM members
);
```

### 오류: "relation 'users' does not exist"

Supabase 스키마가 실행되지 않았습니다. `nextjs-setup/supabase/schema.sql`을 실행하세요.

### 오류: "permission denied"

Service Role Key가 올바른지 확인하세요. `SUPABASE_SERVICE_ROLE_KEY` 환경 변수를 확인하세요.

---

## 📝 마이그레이션 후 작업

### 1. 사용자 안내

마이그레이션된 사용자에게 다음을 안내하세요:

- **비밀번호 재설정 링크 방식**: 이메일로 받은 링크를 클릭하여 새 비밀번호 설정
- **임시 비밀번호 방식**: 제공된 임시 비밀번호로 로그인 후 즉시 비밀번호 변경

### 2. CSV 파일 보안

`migration-results.csv` 파일에는 임시 비밀번호가 포함되어 있습니다:
- 안전한 곳에 보관
- 사용자에게 전달 후 삭제 권장
- Git에 커밋하지 마세요 (`.gitignore`에 추가)

### 3. Render.com 데이터 정리

마이그레이션이 완료되고 모든 사용자가 Supabase로 전환되면:
- Render.com 데이터 백업
- Render.com PostgreSQL 인스턴스 삭제 또는 보관

---

## 🔄 롤백 계획

문제가 발생하면:

1. **Supabase 데이터 삭제**:
   ```sql
   -- 주의: 모든 데이터가 삭제됩니다!
   DELETE FROM public.users;
   DELETE FROM auth.users;
   ```

2. **Render.com 데이터 복원**:
   ```bash
   psql "postgres://..." < render-backup.sql
   ```

---

## 📞 지원

문제가 발생하면:
1. 마이그레이션 로그 확인
2. Supabase Dashboard > Logs 확인
3. Render.com 로그 확인

---

**마이그레이션 완료 후**: Next.js 프로젝트에서 Supabase Auth를 사용하도록 코드를 업데이트하세요.
