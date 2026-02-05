# 개발 테스트 배포 가이드

## 📋 개요

개발 테스트를 위한 별도 배포 환경을 설정하는 방법입니다.

## 🎯 배포 환경 구분

### 1. 프로덕션 (Production)
- **브랜치**: `main`
- **용도**: 실제 서비스
- **URL**: `https://weekly-nexo.netlify.app` (또는 커스텀 도메인)

### 2. 개발 (Development)
- **브랜치**: `develop` 또는 `dev`
- **용도**: 개발 테스트
- **URL**: `https://develop--weekly-nexo.netlify.app`

### 3. Deploy Preview
- **브랜치**: 모든 PR/브랜치
- **용도**: 기능 테스트
- **URL**: PR별 자동 생성 (예: `https://deploy-preview-123--weekly-nexo.netlify.app`)

---

## 🚀 개발 테스트 배포 설정

### 방법 1: 별도 브랜치 사용 (권장)

#### 1단계: 개발 브랜치 생성

```bash
# 개발 브랜치 생성 및 전환
git checkout -b develop

# 개발 브랜치 푸시
git push -u origin develop
```

#### 2단계: Netlify에서 브랜치별 배포 활성화

1. Netlify 대시보드 접속
2. 사이트 선택 → **Site settings** → **Build & deploy**
3. **Branch deploys** 섹션에서:
   - **Branch deploys**: 활성화
   - **Deploy only the production branch**: 비활성화
   - 또는 특정 브랜치만 선택 (예: `develop`)

#### 3단계: 브랜치별 환경 변수 설정

1. Netlify 대시보드 → **Site settings** → **Environment variables**
2. 환경 변수 추가 시 **Scopes** 선택:
   - **Production**: 프로덕션 환경용
   - **Deploy previews**: PR 미리보기용
   - **Branch deploys**: 브랜치별 배포용
   - **All scopes**: 모든 환경

**개발 테스트용 환경 변수 예시**:
- `GOOGLE_SHEET_ID` (개발용 시트 ID)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` (동일)
- `GOOGLE_PRIVATE_KEY` (동일)

---

### 방법 2: Deploy Preview 사용

#### 1단계: PR 생성

```bash
# 기능 브랜치 생성
git checkout -b feature/new-feature

# 변경사항 커밋
git add .
git commit -m "새 기능 추가"

# PR 생성
git push -u origin feature/new-feature
```

#### 2단계: GitHub에서 PR 생성

1. GitHub 저장소 접속
2. **Pull requests** → **New pull request**
3. `feature/new-feature` → `main` 브랜치로 PR 생성

#### 3단계: Netlify Deploy Preview 확인

- PR 생성 시 Netlify가 자동으로 Deploy Preview 생성
- PR 페이지에 배포 링크 표시
- 각 PR마다 고유한 URL 제공

---

### 방법 3: 별도 Netlify 사이트 생성

완전히 분리된 개발 사이트를 원하는 경우:

1. Netlify 대시보드 → **Add new site**
2. 동일한 저장소 연결
3. **Branch to deploy**: `develop` 선택
4. 사이트 이름: `weekly-nexo-dev` (또는 원하는 이름)
5. 별도 환경 변수 설정

**장점**:
- 완전히 분리된 환경
- 독립적인 Functions 로그
- 별도 URL 관리

**단점**:
- 별도 사이트 관리 필요
- 환경 변수 중복 설정

---

## 🔧 환경 변수 분리 설정

### 개발 환경용 Google Sheets

개발 테스트용 별도 Google Sheets를 사용하는 것을 권장합니다:

1. **개발용 Google Sheets 생성**
   - 새 Google Sheets 생성
   - Sheet ID 확인

2. **Netlify 환경 변수 설정**
   - **Scopes**: **Branch deploys** 또는 **Deploy previews** 선택
   - `GOOGLE_SHEET_ID`: 개발용 Sheet ID 입력

3. **프로덕션 환경 변수**
   - **Scopes**: **Production** 선택
   - `GOOGLE_SHEET_ID`: 프로덕션용 Sheet ID 입력

---

## 📝 netlify.toml 설정

현재 `netlify.toml`에 브랜치별 설정이 추가되었습니다:

```toml
[context.production]
  command = "npm install"

[context.develop]
  command = "npm install"

[context.branch-deploy]
  command = "npm install"

[context.deploy-preview]
  command = "npm install"
```

---

## 🧪 테스트 배포 방법

### 빠른 테스트 배포

```bash
# 개발 브랜치로 전환
git checkout develop

# 변경사항 커밋
git add .
git commit -m "개발 테스트"

# 푸시 (자동 배포)
git push origin develop
```

### Deploy Preview 테스트

```bash
# 기능 브랜치 생성
git checkout -b test/feature-name

# 변경사항 커밋 및 푸시
git add .
git commit -m "테스트 기능"
git push -u origin test/feature-name

# GitHub에서 PR 생성
# → Netlify가 자동으로 Deploy Preview 생성
```

---

## ✅ 배포 확인

### 개발 환경 확인

1. **배포 URL 확인**
   - Netlify 대시보드 → **Deploys** 탭
   - `develop` 브랜치 배포 확인
   - URL: `https://develop--weekly-nexo.netlify.app`

2. **Functions 테스트**
   - 개발 환경 URL에서 폼 제출
   - Functions 로그 확인
   - 개발용 Google Sheets에 데이터 저장 확인

3. **환경 변수 확인**
   - 개발 환경에서 올바른 환경 변수가 사용되는지 확인

---

## 🔒 보안 고려사항

### 개발 환경

- 개발용 Google Sheets 사용 권장
- 테스트 데이터와 실제 데이터 분리
- 환경 변수 스코프를 올바르게 설정

### 프로덕션 환경

- 프로덕션용 Google Sheets 사용
- 실제 사용자 데이터 저장
- 환경 변수 스코프를 Production으로 제한

---

## 📊 배포 환경 비교

| 항목 | 프로덕션 | 개발 | Deploy Preview |
|------|---------|------|----------------|
| 브랜치 | `main` | `develop` | 모든 브랜치 |
| URL | 커스텀 도메인 | `develop--site.netlify.app` | PR별 자동 생성 |
| 환경 변수 | Production 스코프 | Branch deploys 스코프 | Deploy previews 스코프 |
| Google Sheets | 프로덕션용 | 개발용 | 개발용 (또는 테스트용) |
| 용도 | 실제 서비스 | 개발 테스트 | 기능 검증 |

---

## 🚀 빠른 시작

### 1. 개발 브랜치 생성 및 배포

```bash
git checkout -b develop
git push -u origin develop
```

### 2. Netlify에서 브랜치 배포 활성화

1. Netlify 대시보드 → **Site settings** → **Build & deploy**
2. **Branch deploys** 활성화

### 3. 개발용 환경 변수 설정

1. **Environment variables** → 환경 변수 추가
2. **Scopes**: **Branch deploys** 선택
3. 개발용 Google Sheets ID 입력

### 4. 테스트

- `develop` 브랜치에 푸시
- 자동 배포 확인
- 개발 환경 URL에서 테스트

---

**작성일**: 2026년 2월


