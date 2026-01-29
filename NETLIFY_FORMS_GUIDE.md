# Netlify Forms 작동 가이드

## ⚠️ 중요: 로컬 환경에서는 작동하지 않습니다

Netlify Forms는 **Netlify에 배포된 사이트에서만** 작동합니다. 로컬 환경(`localhost:8003`)에서는 작동하지 않습니다.

## 🔍 문제 해결 체크리스트

### 1. 로컬 테스트 확인
- 로컬에서 폼을 제출하면 콘솔에 데이터가 출력됩니다
- 실제 제출은 Netlify에 배포 후에만 가능합니다

### 2. Netlify 배포 확인
- [ ] Netlify에 사이트가 배포되어 있는지 확인
- [ ] 배포된 URL에서 폼 테스트 (예: `https://weekly-nexo.netlify.app`)

### 3. 폼 설정 확인
- [ ] `form` 태그에 `netlify` 속성이 있는지 확인
- [ ] `name="order-form"` 속성이 있는지 확인
- [ ] `form-name` hidden 필드가 있는지 확인

### 4. Netlify 대시보드 확인
1. Netlify 대시보드 접속
2. **Forms** 메뉴 클릭
3. `order-form`이 목록에 나타나는지 확인
4. 폼 제출 후 **Submissions**에서 확인

## 🚀 로컬에서 Netlify Forms 테스트하기

### 방법 1: Netlify Dev 사용 (권장)

```bash
# Netlify CLI 설치 (한 번만)
npm install -g netlify-cli

# 프로젝트 디렉토리에서 실행
netlify dev
```

이렇게 하면 로컬에서도 Netlify Forms가 작동합니다.

### 방법 2: 실제 배포 후 테스트

1. Git에 커밋 및 푸시
2. Netlify가 자동으로 배포
3. 배포된 URL에서 폼 테스트

## 📋 폼 필드 확인

현재 폼에 포함된 필드:
- `company_name` (업체명)
- `customer_name` (주문자 성함)
- `phone_number` (연락처)
- `region` (지역 / 설치 환경)
- `size` (인치 종류)
- `mount_type` (설치 방식)
- `quantity` (구매 수량)
- `unit_price` (단가 - hidden)
- `total_price` (총 금액 - hidden)
- `agree` (개인정보 동의)

## 🐛 문제 해결

### 폼이 Netlify Forms에 나타나지 않을 때
1. Netlify에 배포가 완료되었는지 확인
2. 배포 로그에서 에러 확인
3. HTML 파일이 정적 파일로 배포되는지 확인

### 제출은 되지만 데이터가 안 보일 때
1. Netlify 대시보드 → Forms → Submissions 확인
2. 스팸 필터에 걸렸는지 확인
3. 필드 이름이 올바른지 확인

### 로컬에서 테스트하고 싶을 때
- `netlify dev` 명령어 사용
- 또는 실제 배포 후 테스트

## ✅ 배포 후 확인 사항

1. **폼이 보이는지 확인**
   - 사이드바에 "전용 공동구매 신청" 폼이 표시되는지

2. **폼 제출 테스트**
   - 모든 필드 입력 후 제출
   - `/thank-you.html`로 리다이렉트되는지 확인

3. **Netlify 대시보드 확인**
   - Forms → order-form → Submissions에서 데이터 확인
