# NEXO Daily 전환 가이드

## 📋 개요

NEXO Weekly에서 **NEXO Daily**로 전환하고, 4일치 큐레이션을 일별 발행물로 분리하며, 현장 소식 페이지를 추가했습니다.

## 🗄️ 데이터베이스 설정

### 1. 현장 소식 테이블 생성

Supabase Dashboard > SQL Editor에서 다음 스크립트를 실행하세요:

```sql
-- scripts/add-field-news-table.sql 파일 내용 실행
```

또는 직접 실행:

```sql
CREATE TABLE IF NOT EXISTS public.field_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  location TEXT,
  installation_date DATE,
  images TEXT[],
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_news_published ON public.field_news(published_at DESC) 
WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_field_news_location ON public.field_news(location);

ALTER TABLE public.field_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published field news"
  ON public.field_news FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Users can insert their own field news"
  ON public.field_news FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own field news"
  ON public.field_news FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own field news"
  ON public.field_news FOR DELETE
  USING (auth.uid() = author_id);
```

## 📝 일별 발행물 데이터 삽입

### 4일치 큐레이션을 일별 발행물로 분리

터미널에서 다음 명령어를 실행하세요:

```bash
npm run seed:daily
```

이 스크립트는 다음 4개의 일별 발행물을 생성합니다:

1. **2026-02-05**: 입시 전략 - '사탐런'과 과목 선택의 딜레마
2. **2026-02-06**: 의대 증원 & 지역인재 전형
3. **2026-02-07**: 교육 정책 변화 & 고교학점제
4. **2026-02-08**: 학부모님 상담용 인사이트

각 발행물은 `edition_id`로 날짜를 구분합니다 (예: `2026-02-05`).

## 🎨 변경 사항

### 브랜드명 변경

- **WEEKLY** → **DAILY**
- "매주 목요일" → "매일 아침"
- 모든 UI 텍스트 업데이트 완료

### 새로운 페이지

- **`/field`**: 현장 소식 페이지
  - 전국 각지의 넥소 전자칠판 설치 현장 소식
  - 설치 사진, 위치, 설치 일자 표시
  - 헤더 네비게이션에 "현장 소식" 링크 추가

### 일별 발행물 구조

- 기존: 1주치 큐레이션을 하나의 발행호로 관리
- 변경: 각 날짜별로 독립적인 발행물로 관리
- URL 구조: `/news/2026-02-05`, `/news/2026-02-06` 등

## 📍 주요 파일

### 새로 생성된 파일

- `scripts/add-field-news-table.sql`: 현장 소식 테이블 생성 스크립트
- `scripts/seed-daily-editions.js`: 4일치 일별 발행물 데이터 삽입 스크립트
- `app/field/page.tsx`: 현장 소식 페이지 컴포넌트
- `app/field/field.module.css`: 현장 소식 페이지 스타일
- `types/database.ts`: `field_news` 테이블 타입 추가

### 수정된 파일

- `app/page.tsx`: WEEKLY → DAILY 변경
- `app/news/[editionId]/page.tsx`: WEEKLY → DAILY 변경
- `app/layout.tsx`: 메타데이터 업데이트
- `components/layout/header.tsx`: 브랜드명 및 네비게이션 업데이트
- `app/(auth)/login/page.tsx`: 브랜드명 업데이트
- `app/(auth)/signup/page.tsx`: 브랜드명 업데이트
- `package.json`: `seed:daily` 스크립트 추가

## ✅ 체크리스트

- [x] 브랜드명 변경 (WEEKLY → DAILY)
- [x] 4일치 큐레이션을 일별 발행물로 분리
- [x] 현장 소식 테이블 생성
- [x] 현장 소식 페이지 생성
- [x] 헤더 네비게이션에 현장 소식 링크 추가
- [x] TypeScript 타입 정의 업데이트
- [ ] 데이터베이스 스키마 실행 (필수)
- [ ] 일별 발행물 데이터 삽입 실행 (필수)

## 🚀 실행 순서

1. **데이터베이스 스키마 업데이트**
   ```bash
   # Supabase Dashboard > SQL Editor에서 실행
   # scripts/add-field-news-table.sql 파일 내용 실행
   ```

2. **일별 발행물 데이터 삽입**
   ```bash
   npm run seed:daily
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **확인**
   - 메인 페이지: `/` (최신 일별 발행물로 리다이렉트)
   - 일별 발행물: `/news/2026-02-05`, `/news/2026-02-06` 등
   - 현장 소식: `/field`

## 📝 현장 소식 추가 방법

현장 소식을 추가하려면 Supabase Dashboard에서 직접 INSERT하거나, 향후 관리자 페이지에서 추가할 수 있습니다:

```sql
INSERT INTO public.field_news (
  title,
  content,
  location,
  installation_date,
  images,
  is_published,
  published_at
) VALUES (
  '서울 강남구 XX학원 설치 완료',
  '<p>설치 내용 설명...</p>',
  '서울 강남구 XX학원',
  '2026-02-05',
  ARRAY['https://example.com/image1.jpg'],
  true,
  NOW()
);
```

## 🎯 다음 단계

1. **관리자 페이지**: 현장 소식 작성/수정 기능 추가
2. **이미지 업로드**: Supabase Storage 연동
3. **현장 소식 상세 페이지**: 개별 현장 소식 상세 보기
4. **일별 발행물 자동화**: 매일 자동으로 발행물 생성

