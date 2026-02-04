# QR 코드 라이브러리 대체 해결 방법

## 문제
`qrcode@1.5.3` 패키지에 `build/qrcode.min.js` 파일이 없어 CDN에서 다운로드할 수 없습니다.

## 해결 방법

### 방법 1: 다른 QR 코드 라이브러리 사용 (권장)

#### 옵션 A: qrcodejs (더 간단한 라이브러리)

브라우저에서 다음 URL을 열어서 다운로드:
```
https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js
```

또는:
```
https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js
```

파일을 `js/qrcode.min.js`로 저장하고, `admin.html`에서 사용 방법을 변경해야 합니다.

#### 옵션 B: 다른 버전의 qrcode

다른 버전을 시도:
```
https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js
```

### 방법 2: 온라인 QR 코드 생성 API 사용

외부 라이브러리 없이 온라인 API를 사용:

```javascript
// 예시: QR Server API 사용
function generateQRCode(text) {
    const size = 300;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    return apiUrl; // 이미지 URL 반환
}
```

### 방법 3: 간단한 QR 코드 생성기 직접 구현

복잡하지만 외부 의존성 없이 구현 가능합니다. (시간이 많이 걸림)

### 방법 4: npm 패키지를 browserify로 번들링

터미널에서:

```bash
npm install -g browserify
browserify node_modules/qrcode/lib/browser.js -o js/qrcode.min.js
```

## 권장 해결책

**가장 빠른 방법**: `qrcodejs` 라이브러리 사용

1. 브라우저에서 다음 URL 열기:
   ```
   https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js
   ```

2. 내용 복사하여 `js/qrcode.min.js`로 저장

3. `js/qrcode-generator.js` 파일 수정 필요 (API가 약간 다름)

---

**작성일**: 2026년 2월

