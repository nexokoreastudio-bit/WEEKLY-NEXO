# .env.local 파일 확인 가이드

터미널 출력에서 키가 제대로 설정되지 않은 것으로 보입니다.

---

## 🔍 현재 문제

터미널 출력:
```
Key 길이: 26
Key 시작: your-service-role-ke
```

이것은 `.env.local` 파일에 **플레이스홀더 텍스트**가 그대로 있다는 뜻입니다!

---

## ✅ 해결 방법

### Step 1: .env.local 파일 확인

`.env.local` 파일을 열어서 4번째 줄을 확인하세요:

**❌ 잘못된 예시:**
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**✅ 올바른 예시:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.매우긴문자열...
```

### Step 2: Supabase에서 실제 키 복사

1. **Supabase Dashboard** > **Settings** > **API** 이동
2. **"Secret keys"** 섹션 찾기
3. **"service_role"** 키 찾기
4. **"Reveal"** 버튼 클릭
5. **전체 키 복사** (매우 긴 문자열, 200자 이상)

### Step 3: .env.local 파일 업데이트

1. `.env.local` 파일 열기
2. 4번째 줄의 `your-service-role-key-here` 부분을 **삭제**
3. 복사한 실제 키를 **붙여넣기**
4. 저장

### Step 4: 확인

키가 올바르게 설정되었는지 확인:

```bash
node -e "require('dotenv').config({ path: '.env.local' }); const key = process.env.SUPABASE_SERVICE_ROLE_KEY; console.log('키 길이:', key?.length || 0); console.log('키 시작:', key?.substring(0, 30) || '없음');"
```

**올바르게 설정되었다면:**
- 키 길이: 200자 이상
- 키 시작: `eyJhbGci...` 또는 `sb_secret_...`

---

## 📋 체크리스트

- [ ] `.env.local` 파일 열기
- [ ] `SUPABASE_SERVICE_ROLE_KEY=` 뒤의 값 확인
- [ ] `your-service-role-key-here`가 아니라 실제 키인지 확인
- [ ] 실제 키가 아니라면 Supabase Dashboard에서 복사
- [ ] `.env.local` 파일에 붙여넣기
- [ ] 저장
- [ ] 테스트 스크립트 다시 실행

---

## 💡 키 형식 확인

올바른 Service Role Key는:
- ✅ 매우 긴 문자열 (200자 이상)
- ✅ `eyJhbGci...` (JWT 형식) 또는 `sb_secret_...` (새 형식)로 시작
- ❌ `your-service-role-key-here` 같은 플레이스홀더가 아님

---

**다음 단계**: `.env.local` 파일을 열어서 실제 키가 들어갔는지 확인하고, 플레이스홀더가 있다면 Supabase Dashboard에서 실제 키를 복사하여 붙여넣으세요!
