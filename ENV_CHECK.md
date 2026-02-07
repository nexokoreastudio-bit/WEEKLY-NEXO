# 환경 변수 확인 가이드

## 문제 상황
터미널 로그에서 다음 메시지가 표시됩니다:
```
NEXT_PUBLIC_SUPABASE_URL: ✅ 설정됨
NEXT_PUBLIC_SUPABASE_ANON_KEY: ❌ 없음
```

## 해결 방법

### 1. `.env.local` 파일 확인

프로젝트 루트 디렉토리의 `.env.local` 파일을 열고 다음 형식인지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://icriajfrxwykufhmkfun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. 변수 이름 확인

**중요**: 변수 이름이 정확해야 합니다:
- ✅ 올바른 이름: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ❌ 잘못된 이름: `SUPABASE_ANON_KEY` (NEXT_PUBLIC_ 접두사 없음)
- ❌ 잘못된 이름: `NEXT_PUBLIC_SUPABASE_ANON_KEY=` (값 없음)

### 3. 값 형식 확인

- 값에 따옴표(`"` 또는 `'`)가 없어야 합니다
- 각 줄 끝에 공백이나 특수 문자가 없어야 합니다
- `=` 앞뒤에 공백이 있어도 됩니다

### 4. Supabase Dashboard에서 키 확인

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. Settings > API 이동
4. "Project API keys" 섹션에서:
   - **anon public** 키를 복사
   - 이것이 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값입니다

### 5. 개발 서버 재시작

환경 변수를 수정한 후에는 **반드시** 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)

# 캐시 삭제
rm -rf .next

# 개발 서버 재시작
npm run dev
```

### 6. 확인

서버 재시작 후 터미널에 다음 메시지가 표시되어야 합니다:
- `NEXT_PUBLIC_SUPABASE_URL: ✅ 설정됨`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ 설정됨`

만약 여전히 `❌ 없음`이 표시되면, `.env.local` 파일의 변수 이름과 값을 다시 확인하세요.

