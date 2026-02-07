# 기존 발행호 데이터 삭제 가이드

## ⚠️ 주의사항

이 작업은 **모든 발행호 데이터를 영구적으로 삭제**합니다. 삭제 전에 반드시 백업을 권장합니다.

## 방법 1: Supabase Dashboard에서 직접 삭제 (권장)

### Step 1: Supabase Dashboard 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택

### Step 2: SQL Editor 열기
1. 왼쪽 사이드바에서 **"SQL Editor"** 클릭
2. **"New query"** 클릭

### Step 3: 삭제 쿼리 실행
다음 SQL을 복사하여 실행:

```sql
-- 기존 articles 데이터 모두 삭제
DELETE FROM articles;

-- 삭제 확인
SELECT COUNT(*) as remaining_articles FROM articles;
```

### Step 4: 확인
- 결과가 `remaining_articles: 0`이면 삭제 완료

## 방법 2: SQL 파일 사용

### Step 1: SQL 파일 확인
```bash
cat scripts/clear-articles.sql
```

### Step 2: Supabase Dashboard에서 실행
1. Supabase Dashboard > SQL Editor 이동
2. `scripts/clear-articles.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행

## 방법 3: 특정 발행호만 삭제

특정 발행호만 삭제하려면:

```sql
-- 특정 발행호만 삭제 (예: 2026-02-05)
DELETE FROM articles WHERE edition_id = '2026-02-05';

-- 삭제 확인
SELECT edition_id, COUNT(*) as count 
FROM articles 
GROUP BY edition_id;
```

## 삭제 후 다음 단계

1. ✅ 데이터 삭제 확인
2. ✅ 새로운 발행호 데이터 추가 준비
3. ✅ 마이그레이션 스크립트 실행 (필요시)

## 새로운 발행호 추가 방법

### 방법 1: 마이그레이션 스크립트 사용
```bash
npm run migrate:editions:simple
```

### 방법 2: Supabase Dashboard에서 직접 추가
1. Table Editor > `articles` 테이블 선택
2. "Insert row" 클릭
3. 필수 필드 입력:
   - `title`: 발행호 제목
   - `edition_id`: 발행일 (예: '2026-02-12')
   - `is_published`: true
   - `published_at`: 발행일시 (ISO 형식)
   - `content`: HTML 콘텐츠 (선택사항)

## 백업 방법 (선택사항)

삭제 전에 데이터를 백업하려면:

```sql
-- 백업 테이블 생성
CREATE TABLE articles_backup AS SELECT * FROM articles;

-- 백업 확인
SELECT COUNT(*) FROM articles_backup;
```

