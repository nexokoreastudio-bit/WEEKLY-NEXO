# Google Sheets ID 업데이트 가이드

## 📋 현재 상황

실제 사용해야 하는 Google Sheets:
- **URL**: `https://docs.google.com/spreadsheets/d/13_6GEFN0HBaxVKpoErXwJzl4ZbCRhchdzQj6qUj0jMw/edit?gid=0#gid=0`
- **Sheet ID**: `13_6GEFN0HBaxVKpoErXwJzl4ZbCRhchdzQj6qUj0jMw`

## 🔧 Netlify 환경 변수 업데이트 방법

### 1. Netlify 대시보드 접속
1. Netlify 대시보드 접속
2. 사이트 선택 (`weekly-nexo`)
3. **Site settings** → **Environment variables**

### 2. GOOGLE_SHEET_ID 업데이트
1. `GOOGLE_SHEET_ID` 변수 찾기
2. **Edit** 클릭
3. 값을 다음으로 변경:
   ```
   13_6GEFN0HBaxVKpoErXwJzl4ZbCRhchdzQj6qUj0jMw
   ```
4. **Save** 클릭

### 3. 재배포 필요
환경 변수 변경 후:
1. **Deploys** 탭으로 이동
2. **Trigger deploy** → **Deploy site** 클릭
   또는
3. Git에 빈 커밋 푸시하여 재배포 트리거

## ✅ 확인 사항

### Google Sheets 설정 확인
1. 제공하신 Sheet 열기
2. 첫 번째 행에 다음 컬럼명이 있는지 확인:
   ```
   제출일시 | 업체명 | 주문자 성함 | 연락처 | 지역 / 설치 환경 인치 종류 | 설치 방식 | 구매 수량 | 단가 | 총 주문 금액
   ```
   ⚠️ **중요**: Column E가 "지역 / 설치 환경 인치 종류"로 합쳐져 있어야 함

### Service Account 공유 확인
1. Google Sheets 열기
2. **공유** 버튼 클릭
3. Service Account 이메일이 공유 목록에 있는지 확인
4. 권한이 **편집자**인지 확인

## 🧪 테스트 방법

환경 변수 업데이트 및 재배포 후:

1. 실제 사이트에서 폼 제출
2. Netlify Functions 로그 확인:
   - Functions → `form-to-sheets` → Logs
   - 에러가 없는지 확인
3. Google Sheets 확인:
   - 제공하신 Sheet URL에서 데이터 확인
   - 새 행이 추가되었는지 확인

## 📝 참고

- 환경 변수 변경 후 반드시 재배포 필요
- 재배포 없이는 변경사항이 적용되지 않음
- Function 코드는 이미 올바르게 작성되어 있음 (환경 변수만 업데이트하면 됨)
