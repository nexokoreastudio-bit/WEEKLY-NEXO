# Render.com PostgreSQL 회원 DB 설정

DB 서버를 **Render.com**으로 쓰는 경우 아래 순서대로 설정하세요.

---

## 1. Render에서 PostgreSQL 생성

1. [Render](https://render.com) 로그인 → **New +** → **PostgreSQL**
2. **Name**: 예) `nexo-weekly-db`
3. **Region**: Singapore 또는 가까운 리전
4. **PostgreSQL Version**: 15 권장
5. **Create Database** 후 생성 완료까지 대기

---

## 2. 연결 정보 확인

1. 생성된 DB 클릭 → **Info** 탭
2. **Connections** 섹션에서 **External Database URL** 복사  
   형식: `postgres://USER:PASSWORD@HOST:PORT/DATABASE`
3. 이 URL을 Netlify 환경 변수에 넣습니다 (다음 단계).

---

## 3. 회원 테이블 생성

1. Render DB 화면에서 **Shell** 탭 열기 (또는 로컬 psql로 External URL 연결)
2. 프로젝트의 **scripts/render-member-schema.sql** 내용 복사 후 실행

```bash
# 로컬에서 연결하는 경우 예시
psql "postgres://USER:PASSWORD@HOST:PORT/DATABASE" -f scripts/render-member-schema.sql
```

---

## 4. Netlify 환경 변수 설정

1. Netlify 대시보드 → 해당 사이트 → **Site configuration** → **Environment variables**
2. 다음 변수 추가:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | (2번에서 복사한 Render External Database URL 전체) |
| `JWT_SECRET` | 임의의 긴 문자열 (로그인 토큰 서명용, 32자 이상 권장) |

3. **Save** 후 **Trigger deploy**로 재배포

---

## 5. 프론트에서 Render API 사용하도록 설정

Render DB를 쓰려면 **회원 API**를 사용해야 합니다.

1. **js/config.js** (또는 config.js.example 복사본)에 다음 한 줄 추가:
   ```javascript
   window.__USE_RENDER_API__ = true;
   ```
2. Netlify 배포 후에는 **Build command**에 `node scripts/write-config.js` 가 있으면,  
   환경 변수로 `USE_RENDER_API=true` 를 넣고 write-config.js에서 이 값을 써도 됩니다.

config.js가 없으면 기본은 **localStorage 모드**이고,  
`__USE_RENDER_API__ = true` 이면 **Render DB + Netlify Functions API** 모드로 동작합니다.

---

## 6. 동작 요약

| 설정 | 회원가입 | 로그인 | 마이페이지 |
|------|----------|--------|------------|
| `__USE_RENDER_API__ = true` + `DATABASE_URL` | Netlify Function → Render Postgres 저장 | API로 비밀번호 검증 후 JWT 발급 | API로 프로필 조회/수정 |
| 그 외 | localStorage 또는 기존 시트 전송 | localStorage 비교 | localStorage |

---

## 7. 체크리스트

- [ ] Render에서 PostgreSQL 생성
- [ ] **External Database URL** 복사
- [ ] **scripts/render-member-schema.sql** 실행
- [ ] Netlify에 **DATABASE_URL** 환경 변수 설정
- [ ] **js/config.js** 에 `window.__USE_RENDER_API__ = true` 추가 (또는 빌드에서 주입)
- [ ] 재배포 후 회원가입/로그인/마이페이지 테스트
