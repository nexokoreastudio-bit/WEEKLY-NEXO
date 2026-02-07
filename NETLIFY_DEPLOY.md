# Netlify 배포 가이드

## 현재 상태
- 프로젝트: `weekly-nexo`
- 배포 URL: `weekly-nexo.netlify.app`
- GitHub 연동: 활성화됨

## Next.js 배포 설정

### 1. Netlify Dashboard 설정

1. **Netlify Dashboard 접속**
   - https://app.netlify.com/projects/weekly-nexo/configuration

2. **Build settings 확인/수정**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Base directory:** (비워둠)

3. **Environment variables 설정**
   다음 환경 변수를 추가하세요:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 2. GitHub 연동 확인

현재 GitHub에서 자동 배포가 설정되어 있으므로:
- `main` 브랜치에 푸시하면 프로덕션 배포
- `develop` 브랜치에 푸시하면 개발 배포 (또는 PR 미리보기)

### 3. 배포 프로세스

#### 방법 1: 자동 배포 (권장)
```bash
# develop 브랜치에서 작업 후
git push origin develop

# main 브랜치로 머지 후
git checkout main
git merge develop
git push origin main
```

#### 방법 2: 수동 배포
1. Netlify Dashboard > Deploys
2. "Trigger deploy" > "Deploy site" 클릭

### 4. 빌드 확인사항

배포 후 확인:
- ✅ 빌드가 성공적으로 완료되는지
- ✅ 환경 변수가 올바르게 설정되었는지
- ✅ Next.js 라우팅이 정상 작동하는지
- ✅ Supabase 연결이 정상인지

### 5. 문제 해결

#### 빌드 실패 시
1. Netlify Dashboard > Deploys > 실패한 배포 클릭
2. "Deploy log" 확인
3. 일반적인 원인:
   - 환경 변수 누락
   - Node.js 버전 불일치
   - 의존성 설치 실패

#### 환경 변수 설정
- Settings > Environment variables
- 각 변수를 추가하고 "Deploy site" 클릭

### 6. Next.js 특화 설정

`netlify.toml` 파일이 이미 업데이트되었습니다:
- 빌드 명령어: `npm run build`
- Publish 디렉토리: `.next`
- 정적 파일 캐싱 설정
- Next.js 라우팅 지원

## 참고사항

- Next.js는 서버 사이드 렌더링을 지원하지만, Netlify는 정적 사이트 호스팅을 기본으로 합니다.
- `next export`를 사용하려면 `next.config.js`에 `output: 'export'` 설정이 필요합니다.
- 현재 설정은 Next.js의 기본 빌드 방식을 사용합니다.

