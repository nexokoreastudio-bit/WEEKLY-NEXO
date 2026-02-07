# Supabase 프로젝트 설정 단계별 가이드

현재 상태: Supabase 프로젝트 생성 완료, 스키마 미실행

---

## 🔧 Step 1: Supabase 스키마 실행 (필수)

### 1-1. SQL Editor 열기

1. Supabase Dashboard 왼쪽 사이드바에서 **"SQL Editor"** 클릭
2. 또는 상단 메뉴에서 **"Database" > "SQL Editor"** 클릭

### 1-2. 스키마 파일 실행

1. 프로젝트의 `nextjs-setup/supabase/schema.sql` 파일 열기
2. 전체 내용 복사
3. Supabase SQL Editor에 붙여넣기
4. **"Run"** 버튼 클릭 (또는 `Cmd+Enter` / `Ctrl+Enter`)

### 1-3. 실행 확인

다음 메시지가 표시되어야 합니다:
- ✅ `CREATE TABLE` 성공 메시지들
- ✅ `CREATE INDEX` 성공 메시지들
- ✅ `CREATE POLICY` 성공 메시지들
- ✅ `CREATE FUNCTION` 성공 메시지들

**오류가 발생하면:**
- 오류 메시지를 확인하고, 해당 부분만 다시 실행하세요
- 일부 테이블이 이미 존재하는 경우 `IF NOT EXISTS`로 인해 무시될 수 있습니다 (정상)

---

## 📊 Step 2: 테이블 확인

### 2-1. Table Editor에서 확인

1. 왼쪽 사이드바에서 **"Table Editor"** 클릭
2. 다음 테이블들이 보여야 합니다:
   - ✅ `users` (public 스키마)
   - ✅ `articles` (public 스키마)
   - ✅ `posts` (public 스키마)
   - ✅ `comments` (public 스키마)
   - ✅ `likes` (public 스키마)
   - ✅ `resources` (public 스키마)
   - ✅ `point_logs` (public 스키마)
   - ✅ `downloads` (public 스키마)

### 2-2. SQL로 확인

SQL Editor에서 실행:

```sql
-- 모든 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 🔑 Step 3: API 키 확인

### 3-1. Settings에서 키 복사

1. 왼쪽 사이드바에서 **"Settings"** (톱니바퀴 아이콘) 클릭
2. **"API"** 섹션 클릭
3. 다음 정보를 복사하여 `.env.local`에 저장:

```
Project URL: https://icriajfrxwykufhmkfun.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3-2. .env.local 파일 업데이트

프로젝트 루트에 `.env.local` 파일 생성/수정:

```env
# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Render.com 연결 정보 (마이그레이션용)
RENDER_DATABASE_URL=postgres://user:password@host:port/database
```

**⚠️ 중요**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요!

---

## 🚀 Step 4: 프로젝트 상태 확인

### 4-1. "Unhealthy" 상태 해결

"Unhealthy" 상태는 보통 다음 중 하나입니다:

1. **스키마 미실행**: Step 1을 완료하면 해결됩니다
2. **데이터베이스 연결 문제**: 몇 분 기다린 후 새로고침
3. **리전 문제**: Mumbai 리전이므로 약간의 지연이 있을 수 있습니다

**해결 방법:**
- 스키마 실행 후 1-2분 기다린 후 새로고침
- 여전히 "Unhealthy"면 Settings > Database에서 연결 테스트

### 4-2. 상태 확인

스키마 실행 후:
- ✅ "Unhealthy" → "Healthy"로 변경되어야 합니다
- ✅ Table Editor에서 테이블들이 보여야 합니다
- ✅ SQL Editor에서 쿼리가 실행되어야 합니다

---

## 📝 Step 5: 마이그레이션 준비

### 5-1. Render.com 데이터 확인

Render.com에서 현재 회원 수 확인:

```sql
-- Render.com PostgreSQL에서 실행
SELECT COUNT(*) FROM members;
```

### 5-2. 마이그레이션 스크립트 준비

1. `.env.local`에 Render.com 연결 정보 추가
2. 패키지 설치:
   ```bash
   npm install dotenv @supabase/supabase-js
   ```

### 5-3. 테스트 실행 (DRY_RUN)

먼저 시뮬레이션으로 테스트:

```bash
DRY_RUN=true node scripts/migrate-render-to-supabase-with-password.js
```

---

## ✅ 체크리스트

- [ ] Supabase SQL Editor에서 스키마 실행 완료
- [ ] Table Editor에서 모든 테이블 확인 완료
- [ ] Settings > API에서 키 복사 완료
- [ ] `.env.local` 파일 생성 및 키 입력 완료
- [ ] 프로젝트 상태가 "Healthy"로 변경됨
- [ ] Render.com 연결 정보 확인 완료
- [ ] 마이그레이션 스크립트 테스트 완료

---

## 🆘 문제 해결

### "Unhealthy" 상태가 계속됨

1. **스키마 실행 확인**: SQL Editor에서 오류가 없는지 확인
2. **대기**: 스키마 실행 후 2-3분 기다린 후 새로고침
3. **로그 확인**: Settings > Logs에서 오류 확인
4. **지원 문의**: Supabase Discord 또는 GitHub Issues

### 테이블이 보이지 않음

1. **스키마 확인**: SQL Editor에서 `SELECT * FROM information_schema.tables` 실행
2. **권한 확인**: Table Editor에서 "public" 스키마 선택 확인
3. **새로고침**: 브라우저 새로고침

### API 키가 작동하지 않음

1. **키 복사 확인**: 공백이나 줄바꿈이 없는지 확인
2. **환경 변수 확인**: `.env.local` 파일이 올바른 위치에 있는지 확인
3. **서비스 롤 키 확인**: `service_role` 키를 사용해야 합니다 (마이그레이션용)

---

## 📞 다음 단계

스키마 실행이 완료되면:

1. **마이그레이션 실행**: `scripts/MIGRATION_GUIDE.md` 참고
2. **Next.js 프로젝트 설정**: `nextjs-setup/README.md` 참고
3. **인증 코드 전환**: Supabase Auth 사용하도록 코드 업데이트

---

**현재 프로젝트 URL**: `https://icriajfrxwykufhmkfun.supabase.co`  
**데이터베이스 위치**: South Asia (Mumbai)  
**상태**: 스키마 실행 대기 중
