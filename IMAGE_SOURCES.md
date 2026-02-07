# 이미지 출처 및 사용 가이드

## 📸 사용된 무료 이미지 출처

모든 이미지는 **Unsplash**에서 제공하는 무료 이미지를 사용하고 있습니다.

### Unsplash 라이선스
- ✅ 상업적 사용 가능
- ✅ 수정 가능
- ✅ 저작권 표시 불필요 (선택사항)
- ✅ Unsplash 라이선스: https://unsplash.com/license

## 🖼️ 각 발행호별 이미지

### 2026-02-05: 입시 전략 - '사탐런'과 과목 선택의 딜레마
- **이미지 URL**: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop`
- **주제**: 학생 공부, 시험 준비
- **키워드**: study, student, exam preparation

### 2026-02-06: 의대 증원 & 지역인재 전형
- **이미지 URL**: `https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=400&fit=crop`
- **주제**: 의료, 의대, 의사
- **키워드**: medical, doctor, healthcare

### 2026-02-07: 교육 정책 변화 & 고교학점제
- **이미지 URL**: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop`
- **주제**: 교육, 학교, 학습
- **키워드**: education, school, learning

### 2026-02-08: 학부모님 상담용 인사이트
- **이미지 URL**: `https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop`
- **주제**: 상담, 커뮤니케이션, 회의
- **키워드**: consultation, communication, meeting

## 🔄 이미지 변경 방법

### 방법 1: Unsplash에서 새 이미지 찾기

1. **Unsplash 웹사이트 방문**: https://unsplash.com
2. **검색**: 원하는 키워드로 검색 (예: "education", "student", "medical school")
3. **이미지 선택**: 마음에 드는 이미지 클릭
4. **URL 복사**: 이미지 URL을 복사하거나 Unsplash API 사용

### 방법 2: Unsplash API 사용

Unsplash는 무료 API를 제공합니다:

```javascript
// 예시: 검색 API
const searchTerm = 'education student';
const url = `https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=YOUR_ACCESS_KEY`;
```

### 방법 3: 직접 URL 수정

`scripts/seed-daily-editions.js` 파일에서 `thumbnail_url` 값을 변경:

```javascript
{
  date: '2026-02-05',
  thumbnail_url: 'https://images.unsplash.com/photo-NEW-IMAGE-ID?w=800&h=400&fit=crop',
  // ...
}
```

## 📝 이미지 크기 최적화

Unsplash URL 파라미터:
- `w=800`: 너비 800px
- `h=400`: 높이 400px
- `fit=crop`: 크롭 모드

다른 크기가 필요하면:
- `w=1200&h=600`: 더 큰 이미지
- `w=400&h=300`: 더 작은 이미지
- `q=80`: 품질 조절 (기본값: 75)

## 🎨 이미지 선택 팁

### 좋은 이미지 선택 기준:
1. **주제와 관련성**: 발행호 내용과 일치하는 이미지
2. **감정 전달**: 긍정적이고 전문적인 느낌
3. **가독성**: 텍스트와 잘 어울리는 색상
4. **해상도**: 고해상도 이미지 사용 (최소 800x400px)

### 피해야 할 이미지:
- 너무 복잡한 이미지
- 텍스트가 많이 포함된 이미지
- 저작권이 불명확한 이미지

## 🔗 다른 무료 이미지 사이트

### Pexels
- URL: https://www.pexels.com
- 라이선스: 무료 사용 가능
- `next.config.js`에 도메인 추가됨

### Pixabay
- URL: https://pixabay.com
- 라이선스: 무료 사용 가능

### Freepik (일부 무료)
- URL: https://www.freepik.com
- 주의: 일부 이미지는 유료

## ⚙️ 설정 확인

`next.config.js`에 다음 도메인들이 등록되어 있습니다:
- `images.unsplash.com`
- `**.pexels.com`
- `images.pexels.com`

새로운 이미지 사이트를 사용하려면 `next.config.js`의 `remotePatterns`에 도메인을 추가하세요.

## 📋 이미지 업데이트 후

이미지를 변경한 후:

1. **데이터베이스 업데이트**:
   ```bash
   npm run seed:daily
   ```

2. **개발 서버 재시작**:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **브라우저 캐시 삭제**: Ctrl+Shift+R (또는 Cmd+Shift+R)

