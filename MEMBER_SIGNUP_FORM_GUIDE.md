# 회원 수집 폼 설정 가이드

## 📋 개요

구독자 전용 자료를 다운로드하려는 사용자로부터 회원 정보를 수집하는 폼입니다.

## 🎯 목표

- 이메일, 이름, 학원명, 유입 경로 수집
- 나중에 Supabase 연동 시 이 데이터를 DB로 마이그레이션
- 현재는 Google Sheets 또는 Tally로 수집

---

## 방법 1: Google Forms 사용 (권장 - 간단)

### 1단계: Google Forms 생성

1. [Google Forms](https://forms.google.com) 접속
2. 새 양식 만들기
3. 다음 필드 추가:
   - **이름** (단답형, 필수)
   - **이메일** (단답형, 필수)
   - **학원명** (단답형, 선택)
   - **연락처** (단답형, 선택)
   - **유입 경로** (단답형, 선택)
   - **알림 수신 동의** (체크박스)

### 2단계: 응답 시트 설정

1. Forms 상단의 "응답" 탭 클릭
2. Google Sheets 아이콘 클릭 → 새 시트 생성 또는 기존 시트 연결
3. 시트에 응답이 자동으로 저장됨

### 3단계: 폼 임베딩

1. Forms 상단의 "전송" 버튼 클릭
2. `</>` (HTML 코드) 아이콘 클릭
3. 생성된 iframe 코드 복사
4. `index.html`에 다음 위치에 추가:

```html
<!-- 구독자 전용 자료 섹션 -->
<div class="premium-download-section">
    <h3>📚 구독자 전용 자료</h3>
    <p>유료급 고급 자료를 무료로 다운로드하세요!</p>
    
    <!-- Google Forms 임베딩 -->
    <div class="signup-form-embed">
        <!-- 여기에 Google Forms iframe 코드 붙여넣기 -->
    </div>
</div>
```

---

## 방법 2: Tally 사용 (권장 - 더 예쁨)

### 1단계: Tally 계정 생성

1. [Tally](https://tally.so) 접속
2. 무료 계정 생성

### 2단계: 폼 생성

1. 새 폼 만들기
2. 다음 필드 추가:
   - **이름** (텍스트, 필수)
   - **이메일** (이메일, 필수)
   - **학원명** (텍스트, 선택)
   - **연락처** (전화번호, 선택)
   - **유입 경로** (텍스트, 선택)
   - **알림 수신 동의** (체크박스)

### 3단계: 폼 스타일링

1. Tally에서 폼 디자인 커스터마이징
2. 넥소 브랜드 컬러 적용 (네이비, 시안)

### 4단계: 폼 임베딩

1. Tally 폼 편집 페이지에서 "공유" 클릭
2. "임베드" 탭 선택
3. iframe 코드 복사
4. `index.html`에 추가 (위와 동일)

---

## 방법 3: 자체 HTML 폼 (향후 Supabase 연동용)

### 현재는 Google Forms/Tally 사용 권장

나중에 Supabase 연동 시 자체 HTML 폼으로 교체할 수 있습니다.

**예시 구조**:
```html
<form id="member-signup-form" class="member-signup-form">
    <div class="form-group">
        <label for="member-name">이름 *</label>
        <input type="text" id="member-name" name="name" required>
    </div>
    
    <div class="form-group">
        <label for="member-email">이메일 *</label>
        <input type="email" id="member-email" name="email" required>
    </div>
    
    <div class="form-group">
        <label for="member-academy">학원명</label>
        <input type="text" id="member-academy" name="academy_name">
    </div>
    
    <div class="form-group">
        <label for="member-phone">연락처</label>
        <input type="tel" id="member-phone" name="phone">
    </div>
    
    <div class="form-group">
        <label for="member-referrer">유입 경로</label>
        <input type="text" id="member-referrer" name="referrer_code" placeholder="QR 코드 또는 추천인 코드">
    </div>
    
    <div class="form-group">
        <label>
            <input type="checkbox" name="notification_agree" value="1">
            매주 목요일 발행 알림 수신 동의
        </label>
    </div>
    
    <button type="submit" class="btn-primary">구독하기</button>
</form>
```

---

## 📍 폼 배치 위치

### 옵션 1: 사이드바에 추가
- 주문 폼 아래에 배치
- 항상 보이도록

### 옵션 2: 구독자 전용 자료 섹션에 추가
- 자료 다운로드 버튼 클릭 시 모달로 표시
- "구독하고 무료 다운로드" 버튼

### 옵션 3: 별도 페이지 생성
- `/signup.html` 페이지 생성
- 메인 페이지에서 링크로 연결

---

## 🎨 스타일링

### Google Forms/Tally 임베딩 스타일

```css
.signup-form-embed {
    width: 100%;
    max-width: 600px;
    margin: 20px auto;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.signup-form-embed iframe {
    width: 100%;
    min-height: 500px;
    border: none;
}
```

---

## 📊 데이터 수집 현황

### Google Sheets에서 확인
1. Google Sheets에서 응답 시트 열기
2. 실시간으로 회원 정보 확인
3. 나중에 Supabase로 마이그레이션

### 데이터 활용
- 이메일 마케팅 (향후)
- 알림톡 발송 (향후)
- 유입 경로 분석

---

## ✅ 체크리스트

- [ ] Google Forms 또는 Tally 계정 생성
- [ ] 폼 필드 설정 (이름, 이메일, 학원명, 유입 경로 등)
- [ ] 폼 스타일링 (넥소 브랜드 컬러)
- [ ] iframe 코드 복사
- [ ] `index.html`에 임베딩
- [ ] 테스트 제출
- [ ] Google Sheets 응답 확인

---

## 🚀 다음 단계

1. **현재**: Google Forms/Tally로 수집
2. **1개월 후**: Supabase 도입
3. **2개월 후**: 자체 HTML 폼으로 교체 + 자동 로그인 연동

---

**작성일**: 2026년 2월  
**버전**: 1.0

