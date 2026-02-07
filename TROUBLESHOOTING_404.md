# 404 에러 해결 가이드

## 문제 상황
`/news/2026-02-05` 경로에서 404 에러 발생

## 가능한 원인 및 해결 방법

### 1. 개발 서버 재시작
Next.js는 새 파일을 인식하기 위해 재시작이 필요할 수 있습니다.

```bash
# 개발 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

### 2. .next 캐시 삭제
빌드 캐시 문제일 수 있습니다.

```bash
rm -rf .next
npm run dev
```

### 3. 데이터베이스 확인
Supabase에서 데이터가 제대로 저장되었는지 확인:

```sql
-- 발행호 목록 확인
SELECT DISTINCT edition_id, COUNT(*) as count
FROM articles
WHERE edition_id IS NOT NULL
GROUP BY edition_id;

-- 특정 발행호 확인
SELECT id, title, edition_id, is_published
FROM articles
WHERE edition_id = '2026-02-05';
```

### 4. 환경 변수 확인
`.env.local` 파일에 Supabase 연결 정보가 올바른지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. 콘솔 로그 확인
브라우저 개발자 도구의 콘솔과 터미널 로그를 확인하여 에러 메시지를 확인하세요.

### 6. 파일 구조 확인
다음 구조가 올바른지 확인:

```
app/
├── news/
│   └── [editionId]/
│       └── page.tsx  ✅ 이 파일이 있어야 함
```

### 7. TypeScript 컴파일 확인
타입 에러가 있는지 확인:

```bash
npm run type-check
```

## 디버깅 단계

1. **터미널 로그 확인**: 개발 서버 실행 시 에러 메시지 확인
2. **브라우저 콘솔 확인**: 네트워크 탭에서 요청 상태 확인
3. **Supabase 로그 확인**: Supabase Dashboard > Logs에서 쿼리 확인

## 빠른 해결 방법

```bash
# 1. 캐시 삭제
rm -rf .next

# 2. 개발 서버 재시작
npm run dev

# 3. 브라우저에서 하드 리프레시
# Chrome: Cmd+Shift+R (Mac) 또는 Ctrl+Shift+R (Windows)
```

## 여전히 문제가 있다면

1. `app/news/[editionId]/page.tsx` 파일이 존재하는지 확인
2. 파일 내용에 문법 오류가 없는지 확인
3. Supabase 연결이 정상인지 확인
4. 데이터베이스에 `edition_id = '2026-02-05'`인 레코드가 있는지 확인

