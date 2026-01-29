# 빠른 문제 확인 체크리스트

## ✅ 확인 완료된 항목
- [x] Netlify 환경 변수 설정
- [x] 폼 설정
- [x] 이메일 알림 설정
- [x] Google Sheets 공유 (Service Account 편집자 권한)
- [x] Google Sheets 컬럼명 확인 및 코드 수정

## 🔍 추가로 확인해야 할 사항

### 1. Netlify Functions 로그 확인 (가장 중요!)

**확인 방법:**
1. Netlify 대시보드 → **Functions** → **form-to-sheets**
2. **Logs** 탭 클릭
3. 폼 제출 후 로그 확인

**확인할 내용:**
- Function이 호출되었는지 (로그에 요청이 있는지)
- 에러 메시지가 있는지
- 어떤 에러인지

**예상 에러:**
- `환경 변수가 설정되지 않았습니다` → 환경 변수 재확인
- `Google Sheets 저장 오류` → 권한 또는 API 문제
- `Cannot read property 'addRow'` → 컬럼명 불일치 또는 권한 문제

### 2. Netlify Forms Webhook 확인

**확인 방법:**
1. Netlify 대시보드 → **Forms** → **order-form**
2. **Form settings** → **Notifications & webhooks**
3. **Outgoing webhook** 확인

**확인할 내용:**
- Webhook이 설정되어 있는지
- Webhook URL이 올바른지:
  ```
  https://weekly-nexo.netlify.app/.netlify/functions/form-to-sheets
  ```
- Event가 `form submission`으로 설정되어 있는지

### 3. Google Sheets API 활성화 확인

1. Google Cloud Console 접속
2. 프로젝트 선택
3. **APIs & Services** → **Library**
4. "Google Sheets API" 검색
5. **활성화**되어 있는지 확인

### 4. Service Account 권한 재확인

1. Google Sheets 열기
2. **공유** 버튼 클릭
3. Service Account 이메일 확인:
   - 이메일이 목록에 있는지
   - 권한이 **편집자**인지
   - 이메일 주소가 정확한지 (오타 없이)

### 5. Function 배포 확인

1. Netlify 대시보드 → **Functions**
2. `form-to-sheets` Function이 목록에 있는지 확인
3. 최근 배포 시간 확인
4. Function이 활성화되어 있는지 확인

### 6. 수동 테스트

**curl로 Function 직접 테스트:**

```bash
curl -X POST https://weekly-nexo.netlify.app/.netlify/functions/form-to-sheets \
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

## 🎯 가장 가능성 높은 원인

1. **Webhook 미설정 또는 잘못된 URL** (가장 가능성 높음)
2. **Function이 호출되지 않음** (로그 확인 필요)
3. **Google Sheets API 미활성화**
4. **Service Account 권한 문제**

## 📝 다음 단계

1. **코드 수정 사항 커밋 및 배포**
2. **Netlify Functions 로그 확인**
3. **Webhook 설정 확인**
4. **수동 테스트 실행**
