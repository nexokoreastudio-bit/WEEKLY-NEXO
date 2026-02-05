# QR 코드 라이브러리 수동 다운로드 가이드

## 문제
터미널에서 curl로 다운로드가 실패했습니다. 브라우저에서 직접 다운로드하는 방법을 사용하세요.

## 해결 방법: 브라우저에서 직접 다운로드

### 단계별 가이드

1. **브라우저에서 URL 열기**
   - Chrome, Safari, Firefox 등 브라우저를 엽니다
   - 주소창에 다음 URL을 입력하고 Enter:
     ```
     https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js
     ```

2. **파일 내용 복사**
   - 페이지가 열리면 전체 선택:
     - **Mac**: `Cmd + A`
     - **Windows**: `Ctrl + A`
   - 복사:
     - **Mac**: `Cmd + C`
     - **Windows**: `Ctrl + C`

3. **파일 생성 및 저장**
   - 프로젝트 폴더로 이동:
     ```
     /Users/soriul79/workspace/NEXOKOREA/WEEKLY-NEXO/WEEKLY-NEXO/js/
     ```
   - 새 파일 생성: `qrcode.min.js`
   - 복사한 내용을 붙여넣기:
     - **Mac**: `Cmd + V`
     - **Windows**: `Ctrl + V`
   - 파일 저장

4. **확인**
   - 파일 크기가 약 **50KB 이상**이어야 합니다
   - 파일 내용이 JavaScript 코드로 시작해야 합니다 (예: `!function` 또는 `(function`)

5. **관리자 페이지 새로고침**
   - 브라우저에서 관리자 페이지를 새로고침하면 QR 코드 생성이 작동합니다

## 대체 URL (위 URL이 안 되면)

다음 URL들도 시도해보세요:

1. `https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js`
2. `https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js`

## 파일 확인 방법

터미널에서:

```bash
ls -lh js/qrcode.min.js
```

파일 크기가 **50KB 이상**이면 정상입니다.

파일 내용 확인:

```bash
head -5 js/qrcode.min.js
```

JavaScript 코드로 시작해야 합니다.

---

**작성일**: 2026년 2월


