# Netlify Forms 이메일 알림 설정 가이드

## 📧 이메일 알림 설정 방법

### 1. Netlify 대시보드에서 설정

1. Netlify 대시보드 접속
2. 사이트 선택
3. **Forms** 메뉴 클릭
4. **order-form** 선택
5. **Form settings** 클릭
6. **Notifications & webhooks** 섹션으로 이동

### 2. 이메일 알림 추가

**Email notifications** 섹션에서:

1. **Add notification** 클릭
2. **Email notification** 선택
3. 받을 이메일 주소 입력
4. **Save** 클릭

### 3. 이메일 알림 옵션

- **Send email notifications for**: 
  - `form submission` - 폼 제출 시 이메일 발송
- **Email address**: 알림을 받을 이메일 주소
- **Email subject**: 이메일 제목 (선택사항)
- **Email template**: 기본 템플릿 사용 또는 커스텀

### 4. 이메일 내용

기본적으로 다음 정보가 포함됩니다:
- 제출 시간
- 폼 필드와 값
- 제출자 IP 주소 (선택사항)

## 💡 참고사항

### 이메일 알림과 Google Sheets 연동

- **이메일 알림**: 폼 제출 시 이메일로 알림 받기
- **Google Sheets 연동**: Webhook을 통해 자동으로 Google Sheets에 저장

두 기능은 독립적으로 작동합니다:
- 이메일 알림만 설정 → 이메일로만 알림
- Webhook만 설정 → Google Sheets에만 저장
- 둘 다 설정 → 이메일 알림 + Google Sheets 저장

### 무료 플랜 제한

- Netlify Forms 무료 플랜: 월 100건 제출까지
- 이메일 알림: 무제한
- Webhook: 무제한

## 🔧 이메일 설정 후 확인

1. 폼 제출 테스트
2. 설정한 이메일 주소로 알림 확인
3. 스팸 폴더도 확인

## 📝 추가 설정 (선택사항)

### 커스텀 이메일 템플릿

Netlify 대시보드에서 이메일 템플릿을 커스터마이징할 수 있습니다:
- HTML 형식 지원
- 필드별 포맷팅
- 브랜딩 추가

### 여러 이메일 주소 설정

여러 이메일 주소에 알림을 보낼 수 있습니다:
- 각 이메일 주소마다 별도 알림 추가
- 또는 쉼표로 구분하여 여러 주소 입력
