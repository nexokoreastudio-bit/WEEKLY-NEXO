# 이미지 불러오기 문제 해결 가이드

## 🔍 문제 진단

이미지가 로드되지 않는 경우 다음을 확인하세요:

### 1. 이미지 경로 확인

**올바른 경로 형식:**
- 로컬 이미지: `/assets/images/filename.png` (public 폴더 기준)
- 외부 URL: `https://example.com/image.png`

**잘못된 경로 형식:**
- `assets/images/filename.png` (앞에 `/` 없음)
- `./assets/images/filename.png` (상대 경로)
- `../assets/images/filename.png` (상대 경로)

### 2. 파일 존재 확인

터미널에서 확인:
```bash
ls -la public/assets/images/
```

필요한 이미지 파일이 있는지 확인하세요.

### 3. 데이터베이스 경로 확인

Supabase Dashboard에서 `articles` 테이블의 `thumbnail_url` 컬럼을 확인하세요:

```sql
SELECT id, title, thumbnail_url FROM articles WHERE thumbnail_url IS NOT NULL;
```

경로가 올바른지 확인:
- ✅ 올바름: `/assets/images/nexo_news_cover_01.png`
- ❌ 잘못됨: `assets/images/nexo_news_cover_01.png`
- ❌ 잘못됨: `nexo_news_cover_01.png`

## 🛠️ 해결 방법

### 방법 1: SafeImage 컴포넌트 사용 (권장)

이미 적용되어 있습니다. `SafeImage` 컴포넌트는:
- 자동으로 경로를 정규화합니다
- 이미지 로드 실패 시 fallback 이미지를 표시합니다
- 외부 URL과 로컬 이미지를 모두 처리합니다

### 방법 2: 데이터베이스 경로 수정

경로가 잘못된 경우 SQL로 수정:

```sql
-- 앞에 /가 없는 경로에 / 추가
UPDATE articles 
SET thumbnail_url = '/' || thumbnail_url 
WHERE thumbnail_url IS NOT NULL 
  AND thumbnail_url NOT LIKE '/%';

-- assets/images로 시작하는 경로를 /assets/images로 변경
UPDATE articles 
SET thumbnail_url = REPLACE(thumbnail_url, 'assets/images', '/assets/images')
WHERE thumbnail_url LIKE 'assets/images%';
```

### 방법 3: next.config.js 확인

외부 이미지를 사용하는 경우 `next.config.js`에 도메인 추가:

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
    {
      protocol: 'https',
      hostname: 'your-image-domain.com',
    },
  ],
}
```

### 방법 4: 개발 서버 재시작

설정 변경 후 개발 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
# .next 폴더 삭제
rm -rf .next
# 서버 재시작
npm run dev
```

## 📝 이미지 추가 방법

### 새 발행호에 이미지 추가

1. 이미지 파일을 `public/assets/images/` 폴더에 복사
2. 데이터베이스에 경로 저장:
   ```sql
   UPDATE articles 
   SET thumbnail_url = '/assets/images/your-image.png'
   WHERE edition_id = '2026-02-05';
   ```

### 스크립트로 이미지 경로 설정

`scripts/seed-daily-editions.js`에서:
```javascript
thumbnail_url: '/assets/images/nexo_news_cover_01.png', // ✅ 올바름
```

## 🐛 일반적인 오류

### 오류 1: "Invalid src prop"
- **원인**: 경로가 잘못되었거나 파일이 없음
- **해결**: 경로 확인 및 파일 존재 확인

### 오류 2: "Image optimization failed"
- **원인**: 외부 URL이 `next.config.js`에 등록되지 않음
- **해결**: `remotePatterns`에 도메인 추가

### 오류 3: "404 Not Found"
- **원인**: 파일이 `public` 폴더에 없음
- **해결**: 파일을 `public/assets/images/`에 복사

## ✅ 체크리스트

- [ ] 이미지 파일이 `public/assets/images/` 폴더에 있음
- [ ] 데이터베이스의 경로가 `/assets/images/...` 형식임
- [ ] `next.config.js`에 외부 도메인이 등록되어 있음 (외부 이미지 사용 시)
- [ ] 개발 서버를 재시작했음
- [ ] 브라우저 캐시를 지웠음 (Ctrl+Shift+R 또는 Cmd+Shift+R)

## 🔧 추가 도움

문제가 계속되면:
1. 브라우저 개발자 도구의 Network 탭에서 이미지 요청 확인
2. 콘솔에서 에러 메시지 확인
3. `public` 폴더 구조 확인

