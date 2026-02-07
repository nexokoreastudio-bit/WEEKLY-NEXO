# Service Role Key 문제 해결

테이블은 존재하지만 접근이 안 되는 경우, Service Role Key 형식 문제일 가능성이 높습니다.

---

## 🔍 현재 상황

- ✅ 테이블들이 모두 존재함 (Table Editor에서 확인됨)
- ✅ 환경 변수 설정 완료
- ❌ 테이블 접근 실패

**가능한 원인**: Service Role Key 형식 문제

---

## 🔑 Service Role Key 형식 확인

현재 키가 `sb_secret_`로 시작하는 경우:

- ⚠️ 이것은 Supabase의 새로운 키 형식일 수 있습니다
- ⚠️ 하지만 `@supabase/supabase-js`는 보통 **JWT 형식**을 기대합니다
- ✅ JWT 형식: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (매우 긴 문자열)

---

## ✅ 해결 방법

### Step 1: Supabase Dashboard에서 키 다시 확인

1. **Supabase Dashboard** > **Settings** > **API** 이동
2. **"Secret keys"** 섹션 찾기
3. **"service_role"** 키 찾기
4. **"Reveal"** 버튼 클릭하여 키 표시
5. 키 형식 확인:
   - ✅ **JWT 형식** (`eyJhbGci...`로 시작) → 올바른 형식
   - ⚠️ **sb_secret_ 형식** → 다른 키일 수 있음

### Step 2: 올바른 키 복사

**중요**: `service_role` 키는:
- 매우 긴 문자열입니다 (수백 자)
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`로 시작합니다
- JWT 토큰 형식입니다

### Step 3: .env.local 파일 업데이트

1. `.env.local` 파일 열기
2. `SUPABASE_SERVICE_ROLE_KEY=` 뒤의 값을 삭제
3. 복사한 전체 키 붙여넣기
4. 저장

---

## 🧪 테스트

키를 업데이트한 후:

```bash
node scripts/test-supabase-detailed.js
```

이 스크립트는:
- 키 형식을 확인합니다
- 상세한 오류 메시지를 출력합니다
- 해결 방법을 제시합니다

---

## 📋 체크리스트

- [ ] Supabase Dashboard > Settings > API 이동
- [ ] "Secret keys" 섹션에서 "service_role" 찾기
- [ ] "Reveal" 버튼 클릭하여 키 표시
- [ ] 키가 JWT 형식(`eyJhbGci...`)인지 확인
- [ ] 전체 키 복사
- [ ] `.env.local` 파일에 붙여넣기
- [ ] 테스트 스크립트 실행

---

## 💡 팁

### 키 형식 구분

| 형식 | 시작 | 용도 | 사용 가능? |
|------|------|------|-----------|
| **JWT 형식** | `eyJhbGci...` | Service Role Key | ✅ 권장 |
| **sb_secret_** | `sb_secret_...` | 다른 용도? | ⚠️ 확인 필요 |
| **anon public** | `eyJhbGci...` | 클라이언트용 | ❌ 서버용 아님 |

### 키 길이

- Service Role Key는 보통 **200자 이상**의 매우 긴 문자열입니다
- 짧은 키(예: 30-40자)는 잘못 복사되었을 가능성이 높습니다

---

**다음 단계**: Supabase Dashboard에서 `service_role` 키를 다시 확인하고, JWT 형식의 전체 키를 복사하여 `.env.local`에 붙여넣으세요!
