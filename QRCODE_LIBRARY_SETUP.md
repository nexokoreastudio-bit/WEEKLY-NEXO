# QR 코드 라이브러리 설정 가이드

## 문제 상황

로컬 환경에서 CDN에 접근할 수 없어 QR 코드 라이브러리를 로드할 수 없는 경우가 있습니다.

## 해결 방법

### 방법 1: 로컬 파일로 다운로드 (권장)

1. 다음 URL에서 파일을 다운로드하세요:
   - https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js

2. 다운로드한 파일을 프로젝트의 `js/` 폴더에 저장하세요:
   ```
   js/qrcode.min.js
   ```

3. 파일이 저장되면 관리자 페이지를 새로고침하세요.

### 방법 2: 브라우저에서 직접 다운로드

1. 브라우저에서 다음 URL을 열어주세요:
   ```
   https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js
   ```

2. 페이지 내용을 복사하세요 (전체 선택: Cmd+A 또는 Ctrl+A)

3. 프로젝트의 `js/qrcode.min.js` 파일을 생성하고 내용을 붙여넣으세요.

### 방법 3: 터미널에서 다운로드 (인터넷 연결 필요)

터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/soriul79/workspace/NEXOKOREA/WEEKLY-NEXO/WEEKLY-NEXO
curl -o js/qrcode.min.js https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js
```

### 방법 4: npm 사용 (Node.js 설치 필요)

```bash
cd /Users/soriul79/workspace/NEXOKOREA/WEEKLY-NEXO/WEEKLY-NEXO
npm install qrcode
cp node_modules/qrcode/build/qrcode.min.js js/qrcode.min.js
```

## 확인 방법

파일이 제대로 저장되었는지 확인:

```bash
ls -lh js/qrcode.min.js
```

파일이 존재하고 크기가 약 50KB 이상이면 정상입니다.

## 참고

- 파일이 저장되면 관리자 페이지가 자동으로 로컬 파일을 사용합니다.
- 로컬 파일이 없으면 CDN에서 자동으로 로드를 시도합니다.
- 모든 방법이 실패하면 콘솔에 해결 방법이 표시됩니다.

---

**작성일**: 2026년 2월


