# QR 코드 라이브러리 npm 설치 가이드

## 문제
모든 CDN이 차단되어 QR 코드 라이브러리를 다운로드할 수 없습니다.

## 해결 방법: npm 사용

### 1단계: npm 설치

터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/soriul79/workspace/NEXOKOREA/WEEKLY-NEXO/WEEKLY-NEXO
npm install
```

이 명령어는:
- `package.json`에 추가된 `qrcode` 패키지를 설치합니다
- 설치 후 자동으로 `js/qrcode.min.js` 파일을 복사합니다

### 2단계: 확인

설치가 완료되면 다음 명령어로 확인하세요:

```bash
ls -lh js/qrcode.min.js
```

파일 크기가 약 **50KB 이상**이면 정상입니다.

### 3단계: 관리자 페이지 새로고침

브라우저에서 관리자 페이지를 새로고침하면 QR 코드 생성이 작동합니다.

## 수동 실행 (자동 복사가 안 될 경우)

만약 자동 복사가 안 되었다면:

```bash
npm run setup-qrcode
```

또는 직접 복사:

```bash
cp node_modules/qrcode/build/qrcode.min.js js/qrcode.min.js
```

## 참고

- `package.json`에 `qrcode@1.5.3`이 추가되었습니다
- `postinstall` 스크립트가 자동으로 파일을 복사합니다
- `node_modules` 폴더는 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- `js/qrcode.min.js` 파일만 Git에 커밋하면 됩니다

---

**작성일**: 2026년 2월


