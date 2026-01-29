# Google Sheets 연동 설정 가이드

## 📋 개요

Netlify Forms의 제출 데이터를 Google Sheets에 자동으로 저장하는 설정 방법입니다.

## 🔧 설정 단계

### 1. Google Sheets 준비

1. Google Sheets에서 새 스프레드시트 생성
2. 첫 번째 행에 다음 컬럼명 입력 (정확히 일치해야 함):
   ```
   제출일시 | 업체명 | 주문자 성함 | 연락처 | 지역 / 설치 환경 | 인치 종류 | 설치 방식 | 구매 수량 | 단가 | 총 주문 금액
   ```
3. 스프레드시트 ID 확인 (URL에서 확인)
   - 예: `https://docs.google.com/spreadsheets/d/13VMyltoEaBiF-I55Jk-nnGHzmnGB_ZQrojiruPNYJ5s/edit`
   - ID: `13VMyltoEaBiF-I55Jk-nnGHzmnGB_ZQrojiruPNYJ5s`

### 2. Google Service Account 설정

1. Google Cloud Console 접속 (https://console.cloud.google.com)
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Library**에서 "Google Sheets API" 활성화
4. **APIs & Services** → **Credentials** → **Create Credentials** → **Service Account**
5. Service Account 생성:
   - 이름: `netlify-sheets` (또는 원하는 이름)
   - 역할: Editor (또는 Owner)
6. 생성한 Service Account 클릭 → **Keys** 탭 → **Add Key** → **Create new key** → **JSON** 선택
7. 다운로드된 JSON 파일에서 다음 정보 확인:
   - `client_email`: 서비스 계정 이메일 (예: `netlify-sheets@project-id.iam.gserviceaccount.com`)
   - `private_key`: 프라이빗 키 (전체 키 복사)
8. 생성한 Service Account 이메일을 Google Sheets에 공유 (편집 권한)

### 3. Netlify 환경 변수 설정

Netlify 대시보드에서 다음 환경 변수를 설정하세요:

1. Netlify 대시보드 접속
2. 사이트 선택 → **Site settings** → **Environment variables**
3. 다음 변수 추가:

```
GOOGLE_SHEET_ID=13VMyltoEaBiF-I55Jk-nnGHzmnGB_ZQrojiruPNYJ5s
GOOGLE_SERVICE_ACCOUNT_EMAIL=netlify-sheets@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

**중요 사항:**
- `GOOGLE_PRIVATE_KEY`는 전체 키를 입력하되, 줄바꿈 문자(`\n`)를 그대로 포함해야 합니다
- JSON 파일에서 `private_key` 값을 복사할 때 따옴표는 제거하세요
- Netlify의 환경 변수 설정에서 **Scopes**는 **All scopes**로 설정해야 무료 플랜에서 작동합니다

### 4. Netlify Forms Webhook 설정

1. Netlify 대시보드 → **Forms** → **order-form** 선택
2. **Form settings** → **Notifications & webhooks**
3. **Outgoing webhook** 추가:
   - **Event to send**: `form submission`
   - **URL**: `https://your-site.netlify.app/.netlify/functions/form-to-sheets`
   - **HTTP method**: `POST`
   - **Content type**: `application/json`

또는 **Build hooks** 대신 **Functions**를 사용할 수도 있습니다.

### 5. 패키지 설치 확인

`package.json`에 `google-spreadsheet` 패키지가 포함되어 있는지 확인:

```json
{
  "dependencies": {
    "google-spreadsheet": "^4.1.1"
  }
}
```

Netlify가 자동으로 `npm install`을 실행합니다.

## 🧪 테스트 방법

### 1. 로컬 테스트 (Netlify Dev 사용)

```bash
# Netlify CLI 설치 (한 번만)
npm install -g netlify-cli

# 환경 변수 설정 (.env 파일 생성)
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# 로컬 서버 실행
netlify dev
```

### 2. 배포 후 테스트

1. 실제 사이트에서 폼 제출
2. Netlify Functions 로그 확인:
   - Netlify 대시보드 → **Functions** → **form-to-sheets** → **Logs**
3. Google Sheets에서 데이터 확인

## 🐛 문제 해결

### 데이터가 Google Sheets에 저장되지 않을 때

1. **환경 변수 확인**
   - Netlify 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
   - 특히 `GOOGLE_PRIVATE_KEY`의 줄바꿈 문자(`\n`) 확인

2. **Google Sheets 권한 확인**
   - Service Account 이메일이 Google Sheets에 공유되어 있는지 확인
   - 편집 권한이 있는지 확인

3. **Google Sheets API 확인**
   - Google Cloud Console에서 Google Sheets API가 활성화되어 있는지 확인

4. **Netlify Functions 로그 확인**
   - Netlify 대시보드 → **Functions** → **form-to-sheets** → **Logs**
   - 에러 메시지 확인

5. **컬럼명 확인**
   - Google Sheets의 첫 번째 행 컬럼명이 정확히 일치하는지 확인
   - 대소문자, 공백 모두 정확해야 함

### Webhook이 작동하지 않을 때

1. **Webhook URL 확인**
   - `https://your-site.netlify.app/.netlify/functions/form-to-sheets` 형식이 맞는지 확인
   - 실제 사이트 URL로 변경

2. **Function 이름 확인**
   - `netlify/functions/form-to-sheets.js` 파일이 올바른 위치에 있는지 확인

3. **수동 테스트**
   - Postman이나 curl로 Function을 직접 호출하여 테스트

## 📝 수동 테스트 (curl)

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/form-to-sheets \
  -H "Content-Type: application/json" \
  -d '{
    "form_name": "order-form",
    "data": {
      "company_name": "테스트 업체",
      "customer_name": "홍길동",
      "phone_number": "010-1234-5678",
      "region": "서울",
      "size": "65",
      "mount_type": "wall",
      "quantity": "1",
      "unit_price": "2,250,000원",
      "total_price": "2,250,000원"
    }
  }'
```

## ✅ 체크리스트

- [ ] Google Sheets 생성 및 컬럼명 설정
- [ ] Google Service Account 생성
- [ ] Google Sheets API 활성화
- [ ] Service Account를 Google Sheets에 공유 (편집 권한)
- [ ] Netlify 환경 변수 설정 (GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)
- [ ] Netlify Forms webhook 설정
- [ ] 배포 후 테스트
- [ ] Google Sheets에서 데이터 확인
