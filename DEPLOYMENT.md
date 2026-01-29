# 배포 가이드

## GitHub Pages 배포 방법

### 1. GitHub 저장소 설정

1. GitHub 저장소 (`https://github.com/nexokoreastudio-bit/WEEKLY-NEXO`)에 접속
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 선택
4. **Source** 섹션에서:
   - **Branch**: `main` 선택
   - **Folder**: `/ (root)` 선택
5. **Save** 클릭

### 2. 배포 확인

- 배포 완료 후 약 1-2분 후에 사이트가 활성화됩니다
- 배포된 URL: `https://nexokoreastudio-bit.github.io/WEEKLY-NEXO/`
- 또는 커스텀 도메인 설정 가능

### 3. 자동 배포

- `main` 브랜치에 푸시할 때마다 자동으로 배포됩니다
- 배포 상태는 저장소의 **Actions** 탭에서 확인 가능

## 배포 전 체크리스트

- [ ] 모든 변경사항 커밋 및 푸시 완료
- [ ] 이미지 파일들이 `assets/images/` 폴더에 모두 포함되어 있는지 확인
- [ ] `index.html`이 루트 디렉토리에 있는지 확인
- [ ] 모든 링크가 올바르게 작동하는지 확인

## 커스텀 도메인 설정 (선택사항)

1. GitHub Pages 설정에서 **Custom domain** 입력
2. 도메인 DNS 설정:
   - Type: `CNAME`
   - Name: `@` 또는 `www`
   - Value: `nexokoreastudio-bit.github.io`
3. **Enforce HTTPS** 체크

## 문제 해결

### 배포가 안 될 때
- GitHub Actions에서 에러 확인
- 파일 경로가 올바른지 확인 (대소문자 구분)
- `index.html`이 루트에 있는지 확인

### 이미지가 안 보일 때
- 이미지 경로가 상대 경로인지 확인 (`assets/images/filename.png`)
- 이미지 파일이 Git에 포함되어 있는지 확인
