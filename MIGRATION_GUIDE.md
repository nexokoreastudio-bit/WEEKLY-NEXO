# 데이터 마이그레이션 가이드

## 🚀 하드코딩 제거 및 DB 기반 발행 시스템 구축

이 가이드는 `editions-data.js`의 하드코딩된 데이터를 Supabase 데이터베이스로 마이그레이션하는 방법을 설명합니다.

---

## 📋 사전 준비

### 1. 환경 변수 확인

`.env.local` 파일에 다음 환경 변수가 설정되어 있어야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 데이터베이스 스키마 업데이트

먼저 `edition_id` 컬럼을 추가해야 합니다.

**Supabase Dashboard > SQL Editor**에서 다음 SQL을 실행하세요:

```sql
-- scripts/add-edition-id-column.sql 파일 내용 실행
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS edition_id TEXT;

CREATE INDEX IF NOT EXISTS idx_articles_edition_id ON public.articles(edition_id);

COMMENT ON COLUMN public.articles.edition_id IS '발행호 ID (예: 2026-02-05)';
```

---

## 🔧 마이그레이션 실행

### 방법 1: npm 스크립트 사용 (권장)

```bash
npm run migrate:editions
```

### 방법 2: 직접 실행

```bash
# tsx 설치 (아직 설치되지 않은 경우)
npm install -D tsx

# 마이그레이션 실행
npx tsx scripts/migrate-editions-improved.ts
```

---

## 📊 마이그레이션 과정

스크립트는 다음 작업을 수행합니다:

1. **데이터 파일 로드**: `js/editions-data.js` 파일 읽기
2. **기존 데이터 확인**: 중복 방지를 위해 기존 `edition_id` 확인
3. **메인 article 생성**: 각 발행호의 메인 콘텐츠를 하나의 article로 저장
4. **하위 articles 생성**: `edition.articles` 배열의 각 항목을 별도 article로 저장
5. **결과 요약**: 성공/실패 통계 출력

---

## ✅ 마이그레이션 확인

### Supabase Dashboard에서 확인

1. **Table Editor** 열기
2. `articles` 테이블 선택
3. `edition_id` 컬럼이 추가되었는지 확인
4. 데이터가 제대로 저장되었는지 확인

### 쿼리로 확인

```sql
-- 모든 발행호 목록 확인
SELECT DISTINCT edition_id, COUNT(*) as article_count
FROM articles
WHERE edition_id IS NOT NULL
GROUP BY edition_id
ORDER BY edition_id DESC;

-- 특정 발행호의 articles 확인
SELECT id, title, category, edition_id
FROM articles
WHERE edition_id = '2026-02-05'
ORDER BY id;
```

---

## 🎯 다음 단계

마이그레이션이 완료되면 다음 기능이 자동으로 작동합니다:

### 1. 메인 페이지 (`/`)
- 최신 발행호를 자동으로 불러와 표시
- 발행호 선택 드롭다운에서 지난 호 선택 가능

### 2. 동적 라우팅 페이지 (`/news/[editionId]`)
- URL 예시: `/news/2026-02-05`, `/news/2026-01-29`
- 특정 발행호의 상세 내용 표시
- 메인 article + 하위 articles 모두 표시

### 3. 포인트 시스템
- `lib/actions/point.ts`에 스캐폴딩 완료
- article 읽기 시 +10 포인트 적립 기능 준비됨

---

## 🐛 문제 해결

### 오류: "환경 변수가 설정되지 않았습니다"

**해결**: `.env.local` 파일을 확인하고 환경 변수를 설정하세요.

### 오류: "edition_id 컬럼이 없습니다"

**해결**: `scripts/add-edition-id-column.sql` 파일을 Supabase SQL Editor에서 실행하세요.

### 오류: "파일을 찾을 수 없습니다"

**해결**: `js/editions-data.js` 파일이 프로젝트 루트에 있는지 확인하세요.

### 데이터가 중복으로 저장됨

**해결**: 스크립트는 자동으로 중복을 방지합니다. 이미 존재하는 `edition_id`는 건너뜁니다.
수동으로 삭제하려면:

```sql
-- 특정 발행호 삭제
DELETE FROM articles WHERE edition_id = '2026-02-05';

-- 모든 발행 데이터 삭제 (주의!)
DELETE FROM articles WHERE edition_id IS NOT NULL;
```

---

## 📝 파일 구조

```
scripts/
├── migrate-editions.ts              # 기본 마이그레이션 스크립트
├── migrate-editions-improved.ts    # 개선된 마이그레이션 스크립트 (권장)
└── add-edition-id-column.sql       # edition_id 컬럼 추가 SQL

lib/
├── supabase/
│   └── articles.ts                 # Articles 쿼리 함수
└── actions/
    └── point.ts                    # 포인트 시스템 서버 액션

app/
├── page.tsx                        # 메인 페이지 (최신호 자동 로드)
└── news/
    └── [editionId]/
        └── page.tsx                # 동적 라우팅 페이지
```

---

## 🎉 완료!

마이그레이션이 완료되면:

1. ✅ 하드코딩 제거 완료
2. ✅ DB 기반 발행 시스템 구축 완료
3. ✅ 동적 라우팅 작동
4. ✅ 포인트 시스템 준비 완료

이제 각 발행호를 독립적으로 관리할 수 있으며, 최신호 수정 시 지난호가 덮어써지는 문제가 해결되었습니다!

