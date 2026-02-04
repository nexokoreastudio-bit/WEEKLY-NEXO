# Netlify 브랜치 배포 설정 가이드

## 📋 현재 상태

Netlify 설정 페이지에서 확인된 내용:
- **Branch deploys**: "None" (프로덕션 브랜치만 배포)
- **Deploy Previews**: 활성화됨 (PR별 미리보기)

## 🔧 개발 테스트 배포 활성화 방법

### 1단계: Branch Deploys 활성화

1. Netlify 대시보드 → **Site settings** → **Build & deploy**
2. **Branches and deploy contexts** 섹션 찾기
3. **Branch deploys** 옵션 변경:
   - 현재: "None" (프로덕션 브랜치만 배포)
   - 변경: **"All"** 또는 **"Let me add individual branches"** 선택

### 옵션 A: 모든 브랜치 배포 (간단)

- **"All"** 선택
- 모든 브랜치에 푸시하면 자동으로 배포됨
- URL 형식: `https://[브랜치명]--weekly-nexo.netlify.app`

### 옵션 B: 특정 브랜치만 배포 (권장)

- **"Let me add individual branches"** 선택
- 개발용 브랜치 추가 (예: `develop`)
- 필요한 브랜치만 선택적으로 배포

### 2단계: 저장

- **Save** 버튼 클릭

---

## 🎯 권장 설정

### 개발 테스트용 설정

```
Branch deploys: "All" 또는 "Let me add individual branches"
  - develop 브랜치 추가

Deploy Previews: "Any pull request" (현재 설정 유지)
```

### 설정 후 동작

1. **프로덕션 배포**
   - `main` 브랜치 푸시 → 프로덕션 배포
   - URL: `https://weekly-nexo.netlify.app`

2. **개발 배포**
   - `develop` 브랜치 푸시 → 개발 환경 배포
   - URL: `https://develop--weekly-nexo.netlify.app`

3. **Deploy Preview**
   - PR 생성 → 자동으로 미리보기 배포
   - URL: `https://deploy-preview-123--weekly-nexo.netlify.app`

---

## 🔐 환경 변수 분리 설정

### 개발 환경용 환경 변수

1. **Environment variables** 메뉴로 이동
2. 환경 변수 추가/수정 시:
   - **Scopes** 선택:
     - ✅ **Branch deploys**: 개발 브랜치용
     - ✅ **Deploy previews**: PR 미리보기용
     - ✅ **Production**: 프로덕션용

### 예시: 개발용 Google Sheets

```
변수명: GOOGLE_SHEET_ID
값: [개발용 Sheet ID]
Scopes: Branch deploys, Deploy previews
```

### 예시: 프로덕션용 Google Sheets

```
변수명: GOOGLE_SHEET_ID
값: [프로덕션용 Sheet ID]
Scopes: Production
```

---

## 🧪 테스트 방법

### 1. 개발 브랜치 생성

```bash
git checkout -b develop
git push -u origin develop
```

### 2. 배포 확인

1. Netlify 대시보드 → **Deploys** 탭
2. `develop` 브랜치 배포 확인
3. 배포 URL 확인: `https://develop--weekly-nexo.netlify.app`

### 3. 기능 테스트

- 개발 환경 URL에서 폼 제출 테스트
- Functions 로그 확인
- 개발용 Google Sheets에 데이터 저장 확인

---

## 📝 설정 체크리스트

배포 설정 전 확인:

- [ ] Branch deploys 활성화 ("All" 또는 특정 브랜치)
- [ ] Deploy Previews 활성화 (이미 설정됨)
- [ ] 개발용 환경 변수 설정 (Branch deploys 스코프)
- [ ] 프로덕션용 환경 변수 설정 (Production 스코프)
- [ ] 개발용 Google Sheets 준비 (선택사항)

---

## ⚠️ 주의사항

### 비용

- Netlify 무료 플랜: 월 300분 빌드 시간
- 브랜치 배포 활성화 시 빌드 시간 사용량 증가
- 필요시 유료 플랜 고려

### 보안

- 개발 환경과 프로덕션 환경의 데이터 분리 권장
- 환경 변수 스코프를 올바르게 설정

---

**작성일**: 2026년 2월

