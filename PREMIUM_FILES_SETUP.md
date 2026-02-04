# 구독자 전용 자료 파일 준비 가이드

## 📋 개요

구독자 전용 자료 섹션에 실제 파일을 추가하는 방법을 안내합니다.

## 📁 파일 위치

구독자 전용 자료 파일은 다음 폴더에 저장합니다:

```
assets/downloads/
```

## 📝 파일 준비

### 1. 파일 종류

현재 구독자 전용 자료 섹션에 표시되는 파일:

1. **상담일지 템플릿** (`상담일지_템플릿.xlsx`)
   - Excel 파일
   - 학원 상담 시 활용할 수 있는 전문 상담일지 템플릿

2. **학원 세무 가이드** (`학원_세무_가이드.pdf`)
   - PDF 파일
   - 학원 운영 시 알아야 할 세무 관련 가이드

3. **학부모 상담 매뉴얼** (`학부모_상담_매뉴얼.pdf`)
   - PDF 파일
   - 효과적인 학부모 상담을 위한 체크리스트 및 매뉴얼

### 2. 파일 이름 규칙

파일 이름은 다음 형식을 따릅니다:

- **Excel 파일**: `[파일명].xlsx`
- **PDF 파일**: `[파일명].pdf`

**중요**: 파일 이름은 `js/member-signup.js`의 `fileMap` 객체와 일치해야 합니다.

### 3. 파일 업로드

1. 파일을 준비합니다
2. `assets/downloads/` 폴더에 저장합니다
3. 파일 이름을 확인합니다

## 🔧 코드 수정 (필요시)

파일 이름이나 파일 목록을 변경하려면 `js/member-signup.js` 파일을 수정하세요:

```javascript
const fileMap = {
    '상담일지 템플릿': 'assets/downloads/상담일지_템플릿.xlsx',
    '학원 세무 가이드': 'assets/downloads/학원_세무_가이드.pdf',
    '학부모 상담 매뉴얼': 'assets/downloads/학부모_상담_매뉴얼.pdf'
};
```

## 📊 파일 추가 방법

### 방법 1: 기존 파일 교체

1. `assets/downloads/` 폴더에 파일 저장
2. 파일 이름이 코드와 일치하는지 확인
3. 완료!

### 방법 2: 새 파일 추가

1. `assets/downloads/` 폴더에 새 파일 저장
2. `index.html`의 구독자 전용 자료 섹션에 새 카드 추가
3. `js/member-signup.js`의 `fileMap`에 새 항목 추가

**예시**:

```html
<!-- index.html -->
<div class="premium-file-card locked">
    <div class="file-icon">📑</div>
    <h4 class="file-title">새 자료</h4>
    <p class="file-description">새 자료 설명</p>
    <div class="file-meta">
        <span class="file-type">PDF</span>
        <span class="file-size">약 1MB</span>
    </div>
    <div class="file-overlay">
        <div class="lock-icon">🔒</div>
        <p class="lock-text">구독하고 무료 다운로드</p>
    </div>
</div>
```

```javascript
// js/member-signup.js
const fileMap = {
    '상담일지 템플릿': 'assets/downloads/상담일지_템플릿.xlsx',
    '학원 세무 가이드': 'assets/downloads/학원_세무_가이드.pdf',
    '학부모 상담 매뉴얼': 'assets/downloads/학부모_상담_매뉴얼.pdf',
    '새 자료': 'assets/downloads/새_자료.pdf' // 추가
};
```

## ✅ 확인 방법

1. 파일이 `assets/downloads/` 폴더에 있는지 확인
2. 브라우저에서 직접 URL 접근 테스트:
   ```
   http://localhost:8000/assets/downloads/상담일지_템플릿.xlsx
   ```
3. 구독 후 자료 다운로드 테스트

## 🔒 보안 고려사항

현재는 파일이 공개적으로 접근 가능합니다. 향후 Supabase 연동 시:

1. 파일을 Supabase Storage에 저장
2. 구독자 인증 후에만 다운로드 가능하도록 설정
3. 접근 제어 정책 적용

## 📝 참고

- 파일 크기 제한: Netlify 무료 티어는 100MB까지
- 파일 형식: PDF, Excel, Word, 이미지 등 지원
- 파일 이름: 한글, 영문 모두 가능 (URL 인코딩 자동 처리)

---

**작성일**: 2026년 2월

