# Render.com에서 데이터베이스 연결 정보 찾기

Render.com에서 `RENDER_DATABASE_URL`을 찾는 방법은 두 가지가 있습니다.

---

## 방법 1: 별도 PostgreSQL 서비스 찾기 (권장)

### Step 1: PostgreSQL 서비스 확인

1. Render Dashboard 왼쪽 사이드바에서 **"Projects"** 또는 **"Services"** 클릭
2. 서비스 목록에서 **PostgreSQL** 타입의 서비스를 찾습니다
   - 이름 예시: `nexo-weekly-db`, `postgres`, `database` 등
   - 타입: "PostgreSQL"

### Step 2: 연결 정보 가져오기

PostgreSQL 서비스를 찾으면:

1. 해당 PostgreSQL 서비스 클릭
2. **"Info"** 탭 클릭
3. **"Connections"** 섹션 찾기
4. **"External Database URL"** 복사
   ```
   postgres://user:password@hostname:5432/database_name
   ```

### Step 3: .env.local에 추가

복사한 URL을 `.env.local` 파일에 붙여넣기:

```env
RENDER_DATABASE_URL=postgres://user:password@hostname:5432/database_name
```

---

## 방법 2: crm-nexo-backend 서비스의 환경 변수 확인

만약 별도 PostgreSQL 서비스가 없다면, `crm-nexo-backend` 서비스의 환경 변수에 데이터베이스 URL이 있을 수 있습니다.

### Step 1: 서비스 설정 열기

1. `crm-nexo-backend` 서비스 클릭
2. **"Environment"** 탭 클릭

### Step 2: 환경 변수 확인

다음 변수들을 찾아보세요:

- `DATABASE_URL`
- `RENDER_DATABASE_URL`
- `POSTGRES_URL`
- `DB_URL`

이 중 하나에 PostgreSQL 연결 URL이 있을 수 있습니다.

### Step 3: .env.local에 추가

찾은 URL을 `.env.local` 파일에 붙여넣기:

```env
RENDER_DATABASE_URL=찾은_URL_여기에
```

---

## 방법 3: 새 PostgreSQL 서비스 생성 (데이터베이스가 없는 경우)

만약 PostgreSQL 서비스가 전혀 없다면:

### Step 1: 새 PostgreSQL 생성

1. Render Dashboard에서 **"New +"** 클릭
2. **"PostgreSQL"** 선택
3. 설정:
   - **Name**: `nexo-weekly-db` (또는 원하는 이름)
   - **Region**: Singapore (또는 가까운 리전)
   - **PostgreSQL Version**: 15 권장
4. **"Create Database"** 클릭

### Step 2: 연결 정보 가져오기

생성 완료 후:

1. 생성된 PostgreSQL 서비스 클릭
2. **"Info"** 탭 클릭
3. **"External Database URL"** 복사
4. `.env.local`에 추가

### Step 3: 기존 데이터 마이그레이션

기존 데이터가 다른 곳에 있다면:
- 기존 데이터베이스에서 덤프 생성
- 새 PostgreSQL에 복원

---

## 🔍 확인 방법

### PostgreSQL 서비스가 있는지 확인

Render Dashboard에서:

1. 왼쪽 사이드바에서 **"Services"** 또는 **"All Services"** 클릭
2. 서비스 목록에서 타입이 **"PostgreSQL"**인 것 찾기
3. 또는 검색창에 "postgres" 또는 "database" 입력

### 환경 변수에서 확인

`crm-nexo-backend` 서비스에서:

1. 서비스 클릭
2. **"Environment"** 탭 클릭
3. 환경 변수 목록에서 데이터베이스 관련 변수 찾기

---

## 📋 체크리스트

- [ ] Render Dashboard에서 PostgreSQL 서비스 확인 완료
- [ ] 또는 `crm-nexo-backend` 환경 변수 확인 완료
- [ ] External Database URL 복사 완료
- [ ] `.env.local` 파일에 `RENDER_DATABASE_URL` 추가 완료
- [ ] URL 형식 확인 (`postgres://`로 시작)

---

## 🆘 문제 해결

### PostgreSQL 서비스를 찾을 수 없어요

- `crm-nexo-backend` 서비스의 환경 변수를 확인하세요
- 또는 새 PostgreSQL 서비스를 생성하세요

### URL 형식이 이상해요

올바른 형식:
```
postgres://username:password@hostname:port/database_name
```

잘못된 형식:
```
postgresql://... (postgresql이 아닌 postgres)
https://... (HTTP가 아닌 postgres 프로토콜)
```

### 연결이 안 돼요

- URL에 특수문자가 있으면 URL 인코딩 필요
- 비밀번호에 `@`, `:`, `/` 등이 있으면 문제가 될 수 있음
- Render Dashboard에서 URL을 다시 복사해보세요

---

## 💡 팁

### Internal Database URL vs External Database URL

- **External Database URL**: 외부에서 접근 가능 (로컬 개발, 마이그레이션용)
- **Internal Database URL**: Render 네트워크 내에서만 접근 가능

마이그레이션 스크립트는 로컬에서 실행되므로 **External Database URL**을 사용해야 합니다.

---

**다음 단계**: 연결 정보를 찾았으면 `.env.local` 파일에 추가하고 마이그레이션을 실행하세요!
