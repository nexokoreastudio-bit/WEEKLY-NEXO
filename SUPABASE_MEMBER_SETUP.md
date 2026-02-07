# 진짜 회원 가입/로그인 설정 (Supabase)

사이트를 **진짜 회원**으로 운영하려면 Supabase에 회원 DB와 이메일 로그인을 설정한 뒤, 아래 순서대로 진행하세요.

---

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 후 로그인
2. **New project** → Organization 선택, 프로젝트 이름 예: `nexo-weekly`
3. **Database Password** 설정 (꼭 저장해 두기)
4. **Region**: `Northeast Asia (Seoul)` 선택
5. 생성 완료 후 대시보드 진입

---

## 2. 이메일/비밀번호 로그인 활성화

1. 대시보드 왼쪽 **Authentication** → **Providers**
2. **Email** 항목이 **Enabled**인지 확인 (기본 활성화)
3. (선택) **Confirm email** 끄면 이메일 인증 없이 바로 로그인 가능

---

## 3. 회원 테이블 생성 (SQL 실행)

1. 왼쪽 **SQL Editor** 클릭 → **New query**
2. 프로젝트 루트의 **scripts/supabase-member-schema.sql** 내용을 복사해 붙여넣기
3. **Run** 실행  
   - `member_profiles` 테이블 생성  
   - 가입 시 자동으로 프로필 행 생성하는 트리거 적용  
   - RLS 정책 적용

---

## 4. API 키 확인

1. **Settings** (왼쪽 하단 톱니바퀴) → **API**
2. **Project URL** 복사 (예: `https://xxxx.supabase.co`)
3. **anon public** 키 복사 (브라우저에서 사용하는 공개 키)

---

## 5. 사이트에 설정 넣기

### 방법 A: Netlify 배포 시 (권장)

1. Netlify 대시보드 → 해당 사이트 → **Site configuration** → **Environment variables**
2. 다음 두 개 추가:
   - `SUPABASE_URL` = (4번에서 복사한 Project URL)
   - `SUPABASE_ANON_KEY` = (4번에서 복사한 anon public 키)
3. **Build** 설정에서 **Build command**에 다음 추가:
   ```bash
   node scripts/write-config.js && npm install
   ```
   (기존에 `npm install`만 있으면 앞에 `node scripts/write-config.js &&` 만 붙이면 됩니다.)
4. 저장 후 **Trigger deploy**로 다시 배포

### 방법 B: 로컬/직접 배포

1. **js/config.js.example** 을 복사해 **js/config.js** 로 저장
2. `YOUR_...` 부분을 Supabase 프로젝트 URL과 anon 키로 교체
3. **index.html**, **login.html**, **mypage.html** 에는 이미 스크립트가 포함되어 있음 (config.js가 없으면 Supabase 미사용 모드로 동작)

---

## 6. 동작 방식 요약

| 구분 | Supabase 설정 후 | Supabase 미설정 |
|------|------------------|------------------|
| 회원가입 | Supabase Auth + DB에 저장 | 기존처럼 localStorage만 |
| 로그인 | 이메일/비밀번호로 서버 인증 | 기존처럼 localStorage 비교 |
| 마이페이지 | DB에서 프로필 조회/수정 | localStorage 기반 |

- **config.js** 또는 환경 변수로 **SUPABASE_URL**, **SUPABASE_ANON_KEY**가 있으면 → 진짜 회원(DB) 모드로 동작  
- 없으면 → 기존처럼 브라우저 저장소만 사용 (테스트용)

---

## 7. 체크리스트

- [ ] Supabase 프로젝트 생성 (Seoul 리전)
- [ ] Email Provider 활성화 확인
- [ ] **scripts/supabase-member-schema.sql** 실행
- [ ] Netlify 환경 변수 또는 **js/config.js** 설정
- [ ] (Netlify) Build command에 `node scripts/write-config.js` 포함 후 재배포
- [ ] 회원가입 → 로그인 → 마이페이지까지 한 번씩 테스트

이렇게 하면 **DB 서버는 Supabase가 대신** 하고, 진짜 회원으로 사이트를 운영할 수 있습니다.
