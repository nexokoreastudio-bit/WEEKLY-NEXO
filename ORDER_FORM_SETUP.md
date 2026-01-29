# 주문 입력 폼 설정 가이드

## 📋 개요

오른쪽 사이드바에 주문 입력 폼이 추가되었습니다. 이 폼은 Netlify Functions와 Google Sheets를 연동하여 주문 데이터를 자동으로 저장합니다.

## 🔧 설정 단계

### 1. Google Sheets 준비

1. Google Sheets에서 새 스프레드시트 생성
2. 첫 번째 행에 다음 컬럼명 입력:
   - 제출일시
   - 업체명
   - 주문자 성함
   - 연락처
   - 지역 / 설치 환경
   - 인치 종류
   - 설치 방식
   - 구매 수량
   - 단가
   - 총 주문 금액

3. 스프레드시트 ID 확인 (URL에서 확인)
   - 예: `https://docs.google.com/spreadsheets/d/13VMyltoEaBiF-I55Jk-nnGHzmnGB_ZQrojiruPNYJ5s/edit`
   - ID: `13VMyltoEaBiF-I55Jk-nnGHzmnGB_ZQrojiruPNYJ5s`

### 2. Google Service Account 설정

1. Google Cloud Console 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Library**에서 "Google Sheets API" 활성화
4. **APIs & Services** → **Credentials** → **Create Credentials** → **Service Account**
5. Service Account 생성 후:
   - **Keys** 탭 → **Add Key** → **Create new key** → **JSON** 선택
   - 다운로드된 JSON 파일에서 다음 정보 확인:
     - `client_email`: 서비스 계정 이메일
     - `private_key`: 프라이빗 키
6. 생성한 Service Account 이메일을 Google Sheets에 공유 (편집 권한)

### 3. Netlify 환경 변수 설정

Netlify 대시보드에서 다음 환경 변수를 설정하세요:

```
GOOGLE_SHEET_ID=13VMyltoEaBiF-I55Jk-nnGHzmnGB_ZQrojiruPNYJ5s
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

**주의사항:**
- `GOOGLE_PRIVATE_KEY`는 전체 키를 입력하되, 줄바꿈 문자(`\n`)를 그대로 포함해야 합니다
- Netlify의 환경 변수 설정에서 **Scopes**는 **All scopes**로 설정해야 무료 플랜에서 작동합니다

### 4. 패키지 설치

프로젝트 루트에서 다음 명령어 실행:

```bash
npm install
```

또는 Netlify가 자동으로 `package.json`을 감지하여 설치합니다.

## 💰 가격 정보

현재 설정된 가격:

| 인치 | 벽걸이 | 이동형 스탠드 |
|------|--------|--------------|
| 65인치 | 2,250,000원 | 2,500,000원 |
| 75인치 | 2,750,000원 | 3,000,000원 |
| 86인치 | 3,450,000원 | 3,800,000원 |

가격 변경이 필요하면 `js/order-form.js` 파일의 `priceData` 객체를 수정하세요.

## 📱 모바일 지원

- 데스크톱: 사이드바에 고정 표시
- 모바일: 현재는 숨김 처리 (필요시 하단 고정 버튼으로 토글 가능하도록 수정 가능)

## 🐛 문제 해결

### 주문이 저장되지 않을 때
1. Netlify Functions 로그 확인 (Netlify 대시보드 → Functions → Logs)
2. 환경 변수가 올바르게 설정되었는지 확인
3. Google Sheets에 Service Account가 공유되어 있는지 확인
4. Google Sheets API가 활성화되어 있는지 확인

### CORS 오류
- Netlify Functions의 CORS 헤더가 올바르게 설정되어 있는지 확인
- `save-to-sheets.js` 파일의 headers 확인

## 📝 파일 구조

```
WEEKLY-NEXO/
├── index.html              # 주문 폼 HTML 포함
├── css/style.css           # 주문 폼 스타일
├── js/order-form.js        # 주문 폼 로직 (가격 계산, 제출)
├── netlify/
│   └── functions/
│       └── save-to-sheets.js  # Netlify Function
├── package.json            # 의존성 관리
└── netlify.toml            # Netlify 설정
```

## ✅ 테스트

1. 로컬 테스트:
   ```bash
   netlify dev
   ```

2. 배포 후 테스트:
   - 실제 주문 폼 제출 테스트
   - Google Sheets에 데이터가 올바르게 저장되는지 확인
