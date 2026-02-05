# QR 코드 라이브러리 다운로드 방법

## 문제
로컬 환경에서 CDN에 접근할 수 없어 QR 코드 라이브러리를 자동으로 다운로드할 수 없습니다.

## 해결 방법

### 방법 1: 브라우저에서 직접 다운로드 (가장 쉬움)

1. 브라우저에서 다음 URL을 열어주세요:
   ```
   https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js
   ```

2. 페이지가 열리면:
   - **Mac**: Cmd+A (전체 선택) → Cmd+C (복사)
   - **Windows**: Ctrl+A (전체 선택) → Ctrl+C (복사)

3. 프로젝트 폴더의 `js/` 디렉토리에 `qrcode.min.js` 파일을 생성하고 내용을 붙여넣으세요.

4. 파일을 저장한 후 관리자 페이지를 새로고침하세요.

### 방법 2: 터미널에서 다운로드 (인터넷 연결 필요)

터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/soriul79/workspace/NEXOKOREA/WEEKLY-NEXO/WEEKLY-NEXO
curl -L -o js/qrcode.min.js https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js
```

### 방법 3: npm 사용 (Node.js 설치 필요)

```bash
cd /Users/soriul79/workspace/NEXOKOREA/WEEKLY-NEXO/WEEKLY-NEXO
npm install qrcode@1.5.3
cp node_modules/qrcode/build/qrcode.min.js js/qrcode.min.js
```

## 확인 방법

파일이 제대로 다운로드되었는지 확인:

```bash
ls -lh js/qrcode.min.js
```

파일 크기가 약 **50KB 이상**이면 정상입니다. (64바이트는 에러 메시지입니다)

## 참고

- 파일이 저장되면 관리자 페이지가 자동으로 로컬 파일을 사용합니다.
- 로컬 파일이 없으면 CDN에서 자동으로 로드를 시도합니다.
- 모든 방법이 실패하면 콘솔에 해결 방법이 표시됩니다.

---

**작성일**: 2026년 2월


