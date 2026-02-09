# 구글 검색 노출 가이드

이 문서는 NEXO Daily 사이트를 구글 검색에 노출시키기 위한 단계별 가이드를 제공합니다.

## ✅ 이미 완료된 설정

- ✅ `sitemap.xml` 자동 생성 (`app/sitemap.ts`)
- ✅ `robots.txt` 설정 (`app/robots.ts`)
- ✅ 메타 태그 최적화 (`app/layout.tsx`)
- ✅ Open Graph 태그 설정
- ✅ 구조화된 데이터 (JSON-LD) 추가
- ✅ 반응형 디자인

## 📋 구글 노출을 위한 단계

### 1단계: Google Search Console 등록

1. **Google Search Console 접속**
   - https://search.google.com/search-console 접속
   - 구글 계정으로 로그인

2. **속성 추가**
   - "속성 추가" 클릭
   - "URL 접두어" 선택
   - 사이트 URL 입력: `https://daily-nexo.netlify.app`
   - "계속" 클릭

3. **소유권 확인**
   - **방법 1: HTML 파일 업로드 (권장)**
     - Google이 제공하는 HTML 파일을 다운로드
     - 파일을 `public/` 폴더에 저장
     - Netlify에 배포
     - Google Search Console에서 "확인" 클릭
   
   - **방법 2: HTML 태그 추가**
     - Google이 제공하는 메타 태그를 복사
     - `app/layout.tsx`의 `metadata.verification.google`에 추가
     - 예: `google: 'your-verification-code-here'`
     - 커밋 후 배포

### 2단계: 사이트맵 제출

1. **사이트맵 확인**
   - 배포 후 `https://daily-nexo.netlify.app/sitemap.xml` 접속
   - 사이트맵이 정상적으로 생성되었는지 확인

2. **Google Search Console에서 제출**
   - Google Search Console > "색인 생성" > "Sitemaps"
   - "새 사이트맵 추가" 클릭
   - `sitemap.xml` 입력
   - "제출" 클릭

### 3단계: 색인 생성 요청 (선택사항)

1. **URL 검사 도구 사용**
   - Google Search Console > "URL 검사"
   - 주요 페이지 URL 입력 (예: `https://daily-nexo.netlify.app`)
   - "색인 생성 요청" 클릭

2. **주요 페이지 색인 요청**
   - 홈페이지
   - 발행호 목록 페이지
   - 최신 발행호 페이지

### 4단계: 성능 모니터링

1. **색인 생성 상태 확인**
   - Google Search Console > "색인 생성" > "페이지"
   - 색인된 페이지 수 확인

2. **검색 성능 확인**
   - Google Search Console > "성능"
   - 노출 횟수, 클릭 수, 평균 CTR 확인
   - 검색 쿼리 분석

### 5단계: 추가 최적화 (권장)

#### 콘텐츠 최적화
- 각 페이지에 고유한 제목과 설명 추가
- 키워드 자연스럽게 포함
- 정기적인 콘텐츠 업데이트

#### 기술적 SEO
- 페이지 로딩 속도 최적화 (이미 완료)
- 모바일 친화성 확인 (이미 완료)
- HTTPS 사용 (Netlify 자동 설정)

#### 구조화된 데이터 확인
- Google의 Rich Results Test 사용
- https://search.google.com/test/rich-results
- 주요 페이지 URL 테스트

## 🔍 사이트맵 확인 방법

배포 후 다음 URL에서 사이트맵을 확인할 수 있습니다:

```
https://daily-nexo.netlify.app/sitemap.xml
```

## 📝 Google Search Console 설정 후 확인 사항

1. ✅ 사이트맵이 정상적으로 제출되었는지
2. ✅ 색인 생성 요청이 처리되었는지
3. ✅ 오류나 경고가 없는지
4. ✅ 검색 성능 데이터가 수집되고 있는지

## ⚠️ 주의사항

- 색인 생성에는 시간이 걸릴 수 있습니다 (몇 일 ~ 몇 주)
- 정기적으로 콘텐츠를 업데이트하면 색인 속도가 빨라집니다
- Google Search Console에서 오류가 발생하면 즉시 확인하세요

## 🚀 빠른 시작 체크리스트

- [ ] Google Search Console에 사이트 등록
- [ ] 소유권 확인 완료
- [ ] 사이트맵 제출 (`sitemap.xml`)
- [ ] 주요 페이지 색인 생성 요청
- [ ] Google Search Console에서 오류 확인
- [ ] 검색 성능 모니터링 시작

## 📞 추가 도움말

- [Google Search Console 도움말](https://support.google.com/webmasters)
- [Google SEO 가이드](https://developers.google.com/search/docs/beginner/seo-starter-guide)
