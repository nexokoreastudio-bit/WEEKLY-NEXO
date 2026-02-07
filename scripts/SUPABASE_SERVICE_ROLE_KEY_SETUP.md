# Service Role Key 설정 가이드

**"Secret keys"** 섹션에 있는 키가 바로 **Service Role Key**입니다! ✅

---

## ✅ 확인 사항

**"Secret keys"** 섹션 설명:
> "These API keys allow privileged access to your project's APIs. Use in servers, functions, workers or other backend components of your application."

이것이 바로:
- ✅ 서버 사이드용 키
- ✅ 마이그레이션 스크립트에 필요한 키
- ✅ `SUPABASE_SERVICE_ROLE_KEY`로 사용할 키

---

## 📝 설정 방법

### Step 1: Service Role Key 복사

1. **"Secret keys"** 섹션에서
2. **"service_role"** 키 찾기
3. **"Reveal"** 버튼 클릭 (숨겨져 있을 수 있음)
4. 키 복사 (전체 복사)

   형식: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.긴문자열...`

### Step 2: .env.local 파일에 추가

`.env.local` 파일을 열고:

```env
SUPABASE_SERVICE_ROLE_KEY=복사한키여기에붙여넣기
```

**예시:**
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## ⚠️ 중요 보안 주의사항

**Service Role Key는:**
- ❌ 절대 공개하지 마세요!
- ❌ Git에 커밋하지 마세요! (`.gitignore`에 `.env.local` 포함됨)
- ❌ 클라이언트 사이드 코드에 사용하지 마세요!
- ✅ 서버 사이드에서만 사용하세요!
- ✅ 마이그레이션 스크립트에서만 사용하세요!

---

## ✅ 완료 확인

`.env.local` 파일이 다음과 같이 되어 있어야 합니다:

```env
# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.실제키...

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 테스트

키가 올바르게 설정되었는지 확인:

```bash
# 패키지 설치 (아직 안 했다면)
npm install dotenv @supabase/supabase-js

# 환경 변수 확인
node -e "require('dotenv').config({ path: '.env.local' }); console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨 (' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...)' : '❌ 없음');"
```

✅가 나오면 성공입니다!

---

## 🚀 다음 단계

Service Role Key 설정이 완료되면:

1. **마이그레이션 스크립트 실행** (현재는 필요 없음 - Render.com DB 사용 안 함)
2. **Next.js 프로젝트 설정** 진행
3. **Supabase Auth로 전환** 준비

---

**완료!** 이제 Supabase 설정이 모두 끝났습니다. 🎉
