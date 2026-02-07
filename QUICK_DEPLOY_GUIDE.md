# 빠른 배포 가이드

## ✅ 배포 가능 여부: **가능**

현재 프로젝트는 Netlify에 배포할 준비가 완료되었습니다.

---

## 🚀 빠른 배포 (3단계)

### 1단계: 환경 변수 설정

Netlify 대시보드에서 다음 환경 변수를 설정하세요:

1. Netlify 대시보드 접속
2. 사이트 선택 → **Site settings** → **Environment variables**
3. 다음 3개 변수 추가:

```
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

**참고**: 기존 `form-to-sheets.js`에서 사용하던 환경 변수와 동일합니다.

### 2단계: Google Sheets 설정

1. Google Sheets에 Service Account 이메일 공유 (편집 권한)
2. 주문 폼 시트에 "유입 경로" 컬럼 추가 (선택사항 - 없어도 작동)

### 3단계: 배포

#### 방법 A: Git 푸시 (자동 배포)
```bash
git add .
git commit -m "배포 준비 완료"
git push origin main
```

#### 방법 B: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### 방법 C: 드래그 앤 드롭
1. Netlify 대시보드 → **Add new site** → **Deploy manually**
2. 프로젝트 폴더 드래그 앤 드롭

---

## ✅ 배포 후 확인

1. **사이트 접속**: Netlify가 제공하는 URL로 접속
2. **주문 폼 테스트**: 폼 제출 후 Google Sheets 확인
3. **회원 가입 테스트**: 회원 가입 폼 제출 후 Google Sheets 확인
4. **Functions 로그**: Netlify 대시보드 → Functions → Logs 확인

---

## 📋 현재 배포 준비 상태

### ✅ 준비 완료
- [x] `netlify.toml` 설정 파일
- [x] `package.json` 의존성 정의
- [x] Netlify Functions (2개)
- [x] 정적 파일 (HTML, CSS, JS)
- [x] `.gitignore` 설정

### ⚠️ 배포 전 필수 설정
- [ ] Netlify 환경 변수 설정
- [ ] Google Sheets 권한 설정

---

## 🧪 테스트 배포

테스트 배포를 원하시면:

1. **환경 변수만 설정**하면 바로 배포 가능
2. **로컬 테스트**: `netlify dev` 명령어로 로컬에서 Functions 테스트 가능

---

**작성일**: 2026년 2월


