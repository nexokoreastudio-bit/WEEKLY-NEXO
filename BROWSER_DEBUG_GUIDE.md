# 브라우저에서 오류 확인 가이드

## 🔍 확인 방법

### 1. 개발자 도구 열기
- **Chrome/Edge**: `F12` 또는 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`)
- **Firefox**: `F12` 또는 `Ctrl+Shift+K` (Mac: `Cmd+Option+K`)

### 2. 확인할 탭

#### 📋 Console 탭 (가장 중요)
**확인할 내용:**
- 빨간색 에러 메시지
- 주황색 경고 메시지
- 폼 제출 시 나타나는 메시지

**예상 에러:**
- `Failed to fetch` → 네트워크 오류
- `404 Not Found` → Function URL 오류
- `500 Internal Server Error` → Function 내부 오류
- `CORS policy` → CORS 설정 문제

#### 🌐 Network 탭
**확인할 내용:**
1. 폼 제출 후 Network 탭 확인
2. `form-to-sheets` 또는 `save-to-sheets` 요청 찾기
3. 요청 상태 확인:
   - **200**: 성공
   - **404**: Function을 찾을 수 없음
   - **500**: Function 내부 오류
   - **CORS error**: CORS 문제

**확인 방법:**
1. Network 탭 열기
2. 폼 제출
3. 필터에서 "Fetch/XHR" 선택
4. `form-to-sheets` 요청 클릭
5. **Headers**, **Preview**, **Response** 탭 확인

#### 📝 Sources 탭
- JavaScript 파일이 올바르게 로드되었는지 확인
- `js/order-form.js` 파일 확인

## 🐛 일반적인 오류와 해결책

### 오류 1: "Failed to fetch" 또는 "Network Error"
**원인:** Function URL이 잘못되었거나 Function이 배포되지 않음

**해결:**
- Function URL 확인: `https://weekly-nexo.netlify.app/.netlify/functions/form-to-sheets`
- Netlify 대시보드에서 Function이 배포되었는지 확인

### 오류 2: "404 Not Found"
**원인:** Function을 찾을 수 없음

**해결:**
- Function 이름 확인: `form-to-sheets`
- 파일 경로 확인: `netlify/functions/form-to-sheets.js`
- 배포 로그 확인

### 오류 3: "500 Internal Server Error"
**원인:** Function 내부 오류 (환경 변수, Google Sheets 권한 등)

**해결:**
- Netlify Functions 로그 확인 (가장 중요!)
- 환경 변수 확인
- Google Sheets 권한 확인

### 오류 4: CORS 오류
**원인:** CORS 설정 문제

**해결:**
- Function의 CORS 헤더 확인
- 이미 설정되어 있으므로 다른 원인 확인 필요

## 📊 확인 체크리스트

### 폼 제출 전
- [ ] 개발자 도구 열기
- [ ] Console 탭 확인 (기존 에러 확인)
- [ ] Network 탭 열기

### 폼 제출 시
- [ ] 폼 작성 및 제출
- [ ] Console에 새 에러 메시지 확인
- [ ] Network 탭에서 요청 확인

### 폼 제출 후
- [ ] Network 탭에서 `form-to-sheets` 요청 찾기
- [ ] 요청 상태 코드 확인 (200, 404, 500 등)
- [ ] Response 내용 확인
- [ ] Console에 에러 메시지 확인

## 💡 디버깅 팁

### 1. Console.log 추가 (임시)
폼 제출 시 데이터 확인:
```javascript
// js/order-form.js에 추가
console.log('폼 제출 데이터:', formData);
```

### 2. Network 요청 상세 확인
- Network 탭에서 요청 클릭
- **Headers** 탭: 요청 URL, 메서드 확인
- **Payload** 탭: 전송된 데이터 확인
- **Response** 탭: 서버 응답 확인

### 3. Function 직접 테스트
브라우저 콘솔에서 직접 호출:
```javascript
fetch('/.netlify/functions/form-to-sheets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    form_name: 'order-form',
    data: {
      company_name: '테스트',
      customer_name: '홍길동',
      phone_number: '010-1234-5678',
      region: '서울',
      size: '65',
      mount_type: 'wall',
      quantity: '1',
      unit_price: '2,250,000원',
      total_price: '2,250,000원'
    }
  })
})
.then(res => res.json())
.then(data => console.log('응답:', data))
.catch(err => console.error('에러:', err));
```

## 🎯 확인 후 알려주세요

다음 정보를 알려주시면 더 정확한 해결책을 제시할 수 있습니다:

1. **Console 에러 메시지** (있다면)
2. **Network 요청 상태 코드** (200, 404, 500 등)
3. **Network Response 내용** (에러 메시지)
4. **Function이 호출되었는지 여부** (Network 탭에서 요청이 보이는지)
