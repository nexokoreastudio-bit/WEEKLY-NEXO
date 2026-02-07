# Render.com → Supabase 마이그레이션 빠른 시작

## ⚡ 5분 안에 마이그레이션하기

### 1단계: 패키지 설치

```bash
cd /Users/nexo_jo/Desktop/Nexo_workspace/WEEKLY-NEXO
npm install dotenv @supabase/supabase-js
```

### 2단계: 환경 변수 설정

`.env.local` 파일 생성 (프로젝트 루트):

```env
RENDER_DATABASE_URL=postgres://user:password@host:port/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3단계: Supabase 스키마 실행

1. Supabase Dashboard > SQL Editor 열기
2. `nextjs-setup/supabase/schema.sql` 내용 복사하여 실행

### 4단계: 마이그레이션 실행

**옵션 A: 비밀번호 재설정 링크 방식** (권장)
```bash
node scripts/migrate-render-to-supabase.js
```

**옵션 B: 임시 비밀번호 방식**
```bash
node scripts/migrate-render-to-supabase-with-password.js
```

### 5단계: 결과 확인

```sql
-- Supabase SQL Editor에서 실행
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM public.users;
```

---

## 📋 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] Supabase 스키마 실행 완료
- [ ] `.env.local` 파일 생성 및 환경 변수 설정 완료
- [ ] 패키지 설치 완료 (`dotenv`, `@supabase/supabase-js`)
- [ ] Render.com 데이터 백업 완료 (선택사항)
- [ ] 마이그레이션 스크립트 실행 완료
- [ ] 결과 확인 완료
- [ ] 사용자에게 비밀번호 재설정 안내 (또는 임시 비밀번호 전달)

---

## 🆘 문제 발생 시

**오류: "relation 'users' does not exist"**
→ Supabase 스키마를 먼저 실행하세요.

**오류: "permission denied"**
→ `SUPABASE_SERVICE_ROLE_KEY`가 올바른지 확인하세요.

**오류: "duplicate key"**
→ 이미 Supabase에 해당 이메일이 존재합니다. 중복 확인 후 진행하세요.

---

**상세 가이드**: `scripts/MIGRATION_GUIDE.md` 참고
