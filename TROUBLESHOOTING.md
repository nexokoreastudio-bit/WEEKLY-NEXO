# Google Sheets 연동 문제 해결 가이드

## 🔍 데이터가 Google Sheets에 들어오지 않을 때 체크리스트

### 1. Netlify Functions 로그 확인 (가장 중요!)

1. Netlify 대시보드 접속
2. 사이트 선택 → **Functions** 메뉴
3. **form-to-sheets** Function 클릭
4. **Logs** 탭 확인
5. 폼 제출 후 로그에서 다음 확인:
   - Function이 호출되었는지
   - 에러 메시지가 있는지
   - 환경 변수가 제대로 로드되었는지

**에러 예시:**
- `환경 변수가 설정되지 않았습니다` → 환경 변수 확인 필요
- `Google Sheets 저장 오류` → 권한 또는 API 문제
- `JSON 파싱 오류` → 데이터 형식 문제

### 2. Netlify Forms Webhook 설정 확인

**확인 사항:**
1. Netlify 대시보드 → **Forms** → **order-form**
2. **Form settings** → **Notifications & webhooks**
3. Webhook이 설정되어 있는지 확인
4. Webhook URL이 올바른지 확인:
   ```
   https://your-site.netlify.app/.netlify/functions/form-to-sheets
   ```
   ⚠️ **주의**: `your-site`를 실제 사이트 URL로 변경해야 함

**Webhook이 없는 경우:**
- Webhook 추가:
  - **Event to send**: `form submission`
  - **URL**: `https://your-site.netlify.app/.netlify/functions/form-to-sheets`
  - **HTTP method**: `POST`
  - **Content type**: `application/json`

### 3. 환경 변수 확인

Netlify 대시보드 → **Site settings** → **Environment variables**에서 확인:

**필수 환경 변수:**
- `GOOGLE_SHEET_ID` - Google Sheets ID (예: `13VMyltoEaBiF-I55Jk-nnGHzmnGB_ZQrojiruPNYJ5s`)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service Account 이메일
- `GOOGLE_PRIVATE_KEY` - 프라이빗 키 전체 (줄바꿈 포함)

**확인 방법:**
- 각 변수가 설정되어 있는지
- 값이 올바른지 (특히 `GOOGLE_PRIVATE_KEY`의 줄바꿈 문자 `\n`)

### 4. Google Sheets 권한 확인

1. Google Sheets 열기
2. **공유** 버튼 클릭
3. Service Account 이메일이 공유 목록에 있는지 확인
4. 권한이 **편집자** 또는 **소유자**인지 확인

**Service Account 이메일 형식:**
```
netlify-sheets@your-project-id.iam.gserviceaccount.com
```

### 5. Google Sheets API 확인

1. Google Cloud Console 접속
2. 프로젝트 선택
3. **APIs & Services** → **Library**
4. "Google Sheets API" 검색
5. **활성화**되어 있는지 확인

### 6. Google Sheets 컬럼명 확인

Google Sheets의 첫 번째 행에 정확히 다음 컬럼명이 있어야 함:

```
제출일시 | 업체명 | 주문자 성함 | 연락처 | 지역 / 설치 환경 | 인치 종류 | 설치 방식 | 구매 수량 | 단가 | 총 주문 금액
```

**주의사항:**
- 대소문자 정확히 일치
- 공백도 정확히 일치
- 순서도 동일해야 함

### 7. Function 배포 확인

1. Netlify 대시보드 → **Functions**
2. `form-to-sheets` Function이 목록에 있는지 확인
3. 최근 배포 시간 확인
4. Function이 활성화되어 있는지 확인

### 8. 수동 테스트

**curl로 Function 직접 테스트:**

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

성공하면 Google Sheets에 데이터가 추가되어야 합니다.

## 🐛 일반적인 문제와 해결책

### 문제 1: "환경 변수가 설정되지 않았습니다"
**해결:**
- Netlify 대시보드에서 환경 변수 재설정
- 배포 재실행 (환경 변수 변경 후 재배포 필요)

### 문제 2: "Google Sheets 저장 오류"
**가능한 원인:**
- Service Account 권한 없음
- Google Sheets API 미활성화
- 컬럼명 불일치

**해결:**
- Service Account를 Google Sheets에 공유
- Google Sheets API 활성화
- 컬럼명 정확히 확인

### 문제 3: Webhook이 작동하지 않음
**해결:**
- Webhook URL이 정확한지 확인
- Function 이름이 `form-to-sheets`인지 확인
- Netlify Forms에서 제출이 실제로 발생했는지 확인

### 문제 4: Function이 호출되지 않음
**해결:**
- Webhook 설정 확인
- Function이 배포되었는지 확인
- Netlify Forms 제출이 성공했는지 확인 (Forms → Submissions)

## 📝 디버깅 단계

1. **Netlify Forms 제출 확인**
   - Forms → order-form → Submissions에서 제출 데이터 확인
   - 제출이 실제로 발생했는지 확인

2. **Function 로그 확인**
   - Functions → form-to-sheets → Logs
   - 에러 메시지 확인

3. **환경 변수 확인**
   - Site settings → Environment variables
   - 모든 변수가 설정되어 있는지 확인

4. **수동 테스트**
   - curl로 Function 직접 호출
   - 성공 여부 확인

5. **Google Sheets 확인**
   - Service Account 공유 확인
   - 컬럼명 확인
   - API 활성화 확인

## 💡 추가 팁

- **환경 변수 변경 후**: 반드시 재배포 필요
- **Function 수정 후**: 자동 재배포되지만 시간이 걸릴 수 있음
- **Webhook 설정**: 사이트 URL이 변경되면 webhook URL도 업데이트 필요
