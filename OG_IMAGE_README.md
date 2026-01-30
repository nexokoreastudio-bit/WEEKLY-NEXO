# 카카오톡 링크 미리보기 썸네일 (og-image.png)

카카오톡에 링크를 보낼 때 **로고가 잘리지 않고 전체가 보이도록** 1200x1200 전용 썸네일 이미지를 사용합니다.

## og-image.png 만들기

### 방법 1: 스크립트로 자동 생성 (권장)

1. sharp 설치: `npm install sharp --save-dev`
2. 실행: `npm run generate-og-image`
3. `assets/images/og-image.png` 파일이 생성됩니다.

### 방법 2: 수동 캡처

1. 브라우저에서 `og-image.html` 열기
2. 개발자도구(F12) → 디바이스 툴바로 뷰포트 1200x1200 설정 후 전체 페이지 캡처
3. 또는 [KakaoTalk Image Cropper](https://resizeguy.com/html/kakaotalk.html) 등으로 1200x1200 캡처
4. `assets/images/og-image.png` 로 저장

## 배포 후

- Netlify에 배포하면 `og:image`가 `https://weekly-nexo.netlify.app/assets/images/og-image.png` 를 가리킵니다.
- 카카오톡은 썸네일을 캐시하므로, **이미지를 바꾼 뒤에는 카카오 개발자 도구에서 URL 캐시 삭제**가 필요할 수 있습니다: [Kakao 공유 캐시 초기화](https://developers.kakao.com/docs/latest/en/kakaotalk-share/faq#cache)
