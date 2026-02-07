# 🆕 새로 시작하기 가이드

기존 발행호 데이터를 모두 삭제하고 새로운 발행호로 시작하는 방법입니다.

## ⚠️ 주의사항

- **모든 기존 발행호 데이터가 영구적으로 삭제됩니다**
- 삭제 전에 필요한 데이터가 있다면 백업하세요
- 삭제 후에는 복구할 수 없습니다

## 📋 작업 순서

### 1단계: 기존 데이터 삭제

#### 방법 A: 스크립트 사용 (권장)

```bash
npm run clear:articles
```

스크립트가 다음을 수행합니다:
- 현재 데이터 확인 및 표시
- 삭제 확인 (두 번 확인)
- 모든 articles 데이터 삭제
- 삭제 결과 확인

#### 방법 B: Supabase Dashboard에서 직접 삭제

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. SQL Editor 열기
3. 다음 SQL 실행:

```sql
DELETE FROM articles;
```

4. 확인:
```sql
SELECT COUNT(*) FROM articles;
```

### 2단계: 새로운 발행호 추가

#### 방법 A: 대화형 스크립트 사용 (권장)

```bash
npm run add:edition
```

스크립트가 다음 정보를 입력받습니다:
- 발행일 (YYYY-MM-DD 형식)
- 발행호 제목
- 부제목 (선택사항)
- 카테고리 (news/column/update/event)
- 콘텐츠 (HTML 가능, 선택사항)

#### 방법 B: Supabase Dashboard에서 직접 추가

1. Supabase Dashboard > Table Editor > `articles` 테이블 선택
2. "Insert row" 클릭
3. 필수 필드 입력:
   - `title`: 발행호 제목
   - `edition_id`: 발행일 (예: '2026-02-12')
   - `is_published`: true
   - `published_at`: 발행일시 (ISO 형식, 예: '2026-02-12T00:00:00Z')
   - `category`: 'news' (또는 'column', 'update', 'event')
   - `views`: 0
4. 선택 필드:
   - `subtitle`: 부제목
   - `content`: HTML 콘텐츠
   - `thumbnail_url`: 썸네일 이미지 URL

### 3단계: 확인

브라우저에서 확인:
```
http://localhost:3001/news/[발행일]
```

예: `http://localhost:3001/news/2026-02-12`

## 📝 예시: 새로운 발행호 추가

### 스크립트 사용 예시

```bash
$ npm run add:edition

📰 새로운 발행호 추가

발행일 (YYYY-MM-DD): 2026-02-12
발행호 제목: 전자칠판 활용 가이드
부제목 (선택사항, Enter로 건너뛰기): 실전 활용법
카테고리 (news/column/update/event, 기본값: news): news
콘텐츠 (HTML, Enter로 건너뛰기): <p>새로운 발행호 내용입니다.</p>

📝 입력된 정보:
  발행일: 2026-02-12
  제목: 전자칠판 활용 가이드
  부제목: 실전 활용법
  카테고리: news
  콘텐츠: <p>새로운 발행호 내용입니다.</p>...

위 정보로 추가하시겠습니까? (y/n): y

✅ 발행호가 성공적으로 추가되었습니다!
   ID: 1
   Edition ID: 2026-02-12
   제목: 전자칠판 활용 가이드

🌐 확인: http://localhost:3001/news/2026-02-12
```

## 🔄 기존 editions-data.js에서 다시 마이그레이션

만약 `js/editions-data.js` 파일에 데이터가 있고 다시 마이그레이션하고 싶다면:

```bash
# 1. 기존 데이터 삭제
npm run clear:articles

# 2. 마이그레이션 실행
npm run migrate:editions:simple
```

## 💡 팁

### HTML 콘텐츠 작성

콘텐츠는 HTML 형식으로 작성할 수 있습니다:

```html
<h3>주요 내용</h3>
<p>첫 번째 문단입니다.</p>
<p>두 번째 문단입니다.</p>
<ul>
  <li>항목 1</li>
  <li>항목 2</li>
</ul>
```

### 이미지 추가

이미지는 Supabase Storage에 업로드하거나 외부 URL을 사용할 수 있습니다:

```html
<img src="/assets/images/example.png" alt="예시 이미지" />
```

또는:

```html
<img src="https://example.com/image.jpg" alt="외부 이미지" />
```

## 🆘 문제 해결

### 삭제가 안 되는 경우

1. Supabase Dashboard에서 직접 확인:
   ```sql
   SELECT * FROM articles;
   ```

2. 외래 키 제약 조건 확인:
   ```sql
   SELECT COUNT(*) FROM point_logs WHERE related_id IN (SELECT id FROM articles);
   ```

### 새 발행호가 보이지 않는 경우

1. `is_published`가 `true`인지 확인
2. `edition_id` 형식이 올바른지 확인 (YYYY-MM-DD)
3. 브라우저 캐시 삭제 및 새로고침

