# 배포 전 체크리스트

## ✅ 배포 가능 여부: **가능**

현재 프로젝트는 Netlify에 배포할 준비가 되어 있습니다.

---

## 📋 배포 전 확인 사항

### 1. 필수 파일 확인 ✅

- [x] `netlify.toml` - Netlify 설정 파일
- [x] `package.json` - 의존성 정의
- [x] `netlify/functions/` - Netlify Functions
- [x] 정적 파일 (HTML, CSS, JS)

### 2. Netlify Functions 확인 ✅

- [x] `form-to-sheets.js` - 주문 폼 데이터 저장
- [x] `member-signup-to-sheets.js` - 회원 가입 데이터 저장

### 3. 환경 변수 설정 필요 ⚠️

Netlify 대시보드에서 다음 환경 변수를 설정해야 합니다:

```
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

**설정 방법**:
1. Netlify 대시보드 접속
2. 사이트 선택 → **Site settings** → **Environment variables**
3. 위 3개 변수 추가

### 4. Google Sheets 설정 필요 ⚠️

1. Google Sheets에 Service Account 공유 (편집 권한)
2. 주문 폼 시트에 "유입 경로" 컬럼 추가
3. 회원 가입 시트는 자동 생성됨

---

## 🚀 배포 방법

### 방법 1: Git 연동 (권장)

1. **GitHub/GitLab에 코드 푸시**
   ```bash
   git add .
   git commit -m "배포 준비 완료"
   git push origin main
   ```

2. **Netlify에서 자동 배포**
   - Netlify가 자동으로 감지하여 배포 시작
   - 배포 완료까지 약 1-2분 소요

### 방법 2: Netlify CLI 사용

```bash
# Netlify CLI 설치 (한 번만)
npm install -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy --prod
```

### 방법 3: 드래그 앤 드롭

1. Netlify 대시보드 접속
2. **Sites** → **Add new site** → **Deploy manually**
3. 프로젝트 폴더를 드래그 앤 드롭

---

## 🧪 배포 후 테스트

### 1. 기본 기능 테스트

- [ ] 메인 페이지 로드 확인
- [ ] 발행물 선택 및 표시 확인
- [ ] 주문 폼 제출 테스트
- [ ] 회원 가입 폼 제출 테스트

### 2. Netlify Functions 테스트

- [ ] 주문 폼 제출 후 Google Sheets 확인
- [ ] 회원 가입 폼 제출 후 Google Sheets 확인
- [ ] Netlify Functions 로그 확인 (에러 없음)

### 3. QR 코드 생성 테스트

- [ ] 관리자 페이지 접속
- [ ] QR 코드 생성 기능 테스트
- [ ] QR 코드 이미지 다운로드 테스트

---

## ⚠️ 주의사항

### 환경 변수

- 환경 변수는 배포 전에 반드시 설정해야 합니다
- 환경 변수 변경 후 재배포 필요

### Google Sheets 권한

- Service Account 이메일을 Google Sheets에 공유해야 합니다
- 편집 권한이 필요합니다

### CORS 설정

- 현재 모든 도메인에서 접근 가능하도록 설정됨 (`Access-Control-Allow-Origin: *`)
- 프로덕션 환경에서는 특정 도메인만 허용하도록 변경 권장

---

## 📝 배포 후 확인 사항

1. **사이트 URL 확인**
   - Netlify가 제공하는 URL로 접속 가능한지 확인
   - 커스텀 도메인 설정 (선택사항)

2. **Functions 로그 확인**
   - Netlify 대시보드 → **Functions** → 각 Function의 **Logs** 확인
   - 에러가 없는지 확인

3. **Google Sheets 데이터 확인**
   - 주문 폼 제출 후 데이터가 저장되는지 확인
   - 회원 가입 폼 제출 후 데이터가 저장되는지 확인

---

## 🔧 문제 해결

### 배포 실패 시

1. **빌드 로그 확인**
   - Netlify 대시보드 → **Deploys** → 실패한 배포 클릭
   - 빌드 로그에서 에러 확인

2. **환경 변수 확인**
   - 모든 필수 환경 변수가 설정되었는지 확인

3. **의존성 확인**
   - `package.json`의 의존성이 올바른지 확인

### Functions 작동 안 할 때

1. **로그 확인**
   - Netlify 대시보드 → **Functions** → **Logs**

2. **환경 변수 확인**
   - Functions에서 환경 변수에 접근 가능한지 확인

3. **권한 확인**
   - Google Sheets에 Service Account가 공유되어 있는지 확인

---

## ✅ 배포 준비 완료

현재 프로젝트는 배포할 준비가 되어 있습니다. 위의 환경 변수만 설정하면 바로 배포 가능합니다.

---

**작성일**: 2026년 2월

