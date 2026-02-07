# Supabase 테이블 확인 가이드

연결 테스트가 실패했다면, 테이블이 실제로 존재하는지 확인해야 합니다.

---

## 🔍 Step 1: Table Editor에서 확인

1. **Supabase Dashboard** 접속
2. 왼쪽 사이드바에서 **"Table Editor"** 클릭
3. 왼쪽 사이드바에서 **`public`** 스키마 확인
4. 다음 테이블들이 보이는지 확인:

   - ✅ `users`
   - ✅ `articles`
   - ✅ `posts`
   - ✅ `comments`
   - ✅ `likes`
   - ✅ `resources`
   - ✅ `point_logs`
   - ✅ `downloads`

---

## ❌ 테이블이 보이지 않는다면

### 해결 방법: 스키마 다시 실행

1. **Supabase Dashboard** > **SQL Editor** 이동
2. 프로젝트의 `nextjs-setup/supabase/schema.sql` 파일 열기
3. 전체 내용 복사
4. SQL Editor에 붙여넣기
5. **"Run"** 버튼 클릭 (또는 `Cmd+Enter` / `Ctrl+Enter`)
6. 성공 메시지 확인
7. Table Editor에서 테이블 확인

---

## ✅ 테이블이 보인다면

테이블이 존재하는데도 접근이 안 된다면:

### 가능한 원인 1: RLS 정책 문제

Service Role Key는 RLS를 우회해야 합니다. 확인:

1. Table Editor에서 `users` 테이블 클릭
2. 오른쪽 상단 **"..."** 메뉴 클릭
3. **"View Policies"** 확인

**해결**: Service Role Key를 사용하면 RLS를 우회해야 합니다. 스키마가 올바르게 실행되었는지 확인하세요.

### 가능한 원인 2: Service Role Key 문제

키가 올바른지 다시 확인:

1. Settings > API > Secret keys
2. service_role 키의 "Reveal" 클릭
3. 전체 키 복사 (매우 긴 문자열)
4. `.env.local`에 다시 붙여넣기

---

## 🧪 간단한 테스트 실행

더 자세한 오류 정보를 보려면:

```bash
node scripts/test-supabase-simple.js
```

이 스크립트는 더 상세한 오류 정보를 출력합니다.

---

## 📋 체크리스트

- [ ] Supabase Dashboard > Table Editor에서 테이블 확인 완료
- [ ] 테이블이 보이지 않으면 schema.sql 다시 실행 완료
- [ ] 테이블이 보이면 간단한 테스트 스크립트 실행 완료
- [ ] 오류 메시지 확인 완료

---

**가장 가능성 높은 원인**: 테이블이 아직 생성되지 않았을 수 있습니다. Table Editor에서 확인해보세요!
