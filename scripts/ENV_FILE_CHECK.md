# .env.local 파일 저장 확인 가이드

터미널에서 여전히 플레이스홀더가 나온다면 파일이 저장되지 않았을 수 있습니다.

---

## 🔍 확인 사항

### 1. 파일 저장 확인

`.env.local` 파일을 열었을 때:
- ✅ **저장되지 않은 변경사항**이 있으면 Cursor/VSCode 상단에 "Unsaved" 표시가 있습니다
- ✅ **저장**: `Cmd+S` (Mac) 또는 `Ctrl+S` (Windows)
- ✅ 저장 후 파일이 닫혔다면 다시 열어서 확인

### 2. 실제 키 확인

`.env.local` 파일의 4번째 줄을 확인:

**❌ 잘못된 예시:**
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**✅ 올바른 예시:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.매우긴문자열...
```

또는

```env
SUPABASE_SERVICE_ROLE_KEY=sb_secret_매우긴문자열...
```

### 3. 키 형식 확인

올바른 Service Role Key는:
- ✅ 매우 긴 문자열 (200자 이상)
- ✅ `eyJhbGci...` (JWT 형식) 또는 `sb_secret_...` (새 형식)로 시작
- ❌ `your-service-role-key-here` 같은 플레이스홀더가 아님

---

## ✅ 해결 방법

### Step 1: Supabase에서 키 복사

1. **Supabase Dashboard** > **Settings** > **API** 이동
2. **"Secret keys"** 섹션 찾기
3. **"service_role"** 키 찾기
4. **"Reveal"** 버튼 클릭
5. **전체 키 복사** (매우 긴 문자열)

### Step 2: .env.local 파일 수정

1. `.env.local` 파일 열기
2. 4번째 줄 찾기: `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`
3. `your-service-role-key-here` 부분을 **전체 선택** (드래그)
4. 복사한 실제 키로 **붙여넣기**
5. **저장** (`Cmd+S` 또는 `Ctrl+S`)

### Step 3: 저장 확인

파일 저장 후 터미널에서 확인:

```bash
cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY
```

출력 예시:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.매우긴문자열...
```

플레이스홀더가 아니라 실제 키가 나와야 합니다.

### Step 4: 테스트

```bash
node -e "require('dotenv').config({ path: '.env.local' }); const key = process.env.SUPABASE_SERVICE_ROLE_KEY; console.log('키 길이:', key?.length || 0); console.log('키 시작:', key?.substring(0, 30) || '없음');"
```

**올바르게 설정되었다면:**
- 키 길이: 200자 이상
- 키 시작: `eyJhbGci...` 또는 `sb_secret_...`

---

## 🆘 여전히 안 된다면

### 파일 위치 확인

파일이 올바른 위치에 있는지 확인:

```bash
pwd
# 출력: /Users/nexo_jo/Desktop/Nexo_workspace/WEEKLY-NEXO

ls -la .env.local
# 파일이 존재하는지 확인
```

### 파일 내용 직접 확인

```bash
cat .env.local
```

4번째 줄에 실제 키가 있는지 확인하세요.

---

## 💡 팁

### 키 복사 시 주의사항

- ✅ 전체 키를 복사하세요 (매우 긴 문자열)
- ✅ 앞뒤 공백이 없어야 합니다
- ✅ 줄바꿈이 없어야 합니다
- ✅ 따옴표로 감싸지 마세요

### 파일 저장 확인

- Cursor/VSCode에서 파일 탭에 **점(·)** 표시가 있으면 저장되지 않은 변경사항이 있습니다
- 저장 후 점이 사라져야 합니다

---

**다음 단계**: `.env.local` 파일을 열어서 실제 키를 붙여넣고 **저장**하세요!
