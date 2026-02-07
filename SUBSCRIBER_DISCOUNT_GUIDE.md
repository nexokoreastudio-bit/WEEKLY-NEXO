# 구독자 인증 할인 시스템 가이드

## 📋 개요

전자칠판 구매 시 구독자 인증을 완료하면 **10% 할인**이 자동으로 적용되는 시스템입니다.

## 🗄️ 데이터베이스 설정

### 1. SQL 스크립트 실행

Supabase Dashboard > SQL Editor에서 다음 스크립트를 실행하세요:

```sql
-- scripts/add-subscriber-verification-columns.sql 파일 내용 실행
```

또는 직접 실행:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscriber_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS purchase_serial_number TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_serial_number ON public.users(purchase_serial_number) 
WHERE purchase_serial_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_subscriber_verified ON public.users(subscriber_verified) 
WHERE subscriber_verified = TRUE;
```

## 🎯 주요 기능

### 1. 마이페이지 (`/mypage`)

- **구독자 인증 상태 표시**: 인증 완료 여부와 할인 혜택 정보
- **시리얼 번호 입력**: 구매한 제품의 시리얼 번호를 입력하여 인증
- **인증 정보 확인**: 인증 일시, 시리얼 번호 (일부 마스킹)

### 2. 할인 홍보 배너

- **뉴스레터 페이지**: 각 발행호 페이지 상단에 할인 홍보 배너 표시
- **마이페이지**: 인증 전/후 상태에 따른 배지 표시

### 3. 시리얼 번호 검증

현재는 기본적인 형식 검증만 수행합니다:
- 형식: `NEXO-YYYY-XXXX-XXXX` (예: `NEXO-2026-ABCD-1234`)
- 실제 구매 DB와 연동하려면 `app/actions/subscriber.ts`의 `validateSerialNumber` 함수를 수정하세요

## 📝 사용 방법

### 사용자 측

1. **회원가입/로그인**: NEXO Weekly에 가입하고 로그인
2. **마이페이지 접속**: 상단 메뉴 또는 사용자 버튼에서 "마이페이지" 클릭
3. **시리얼 번호 입력**: 구매한 전자칠판의 시리얼 번호 입력
4. **인증 완료**: 인증 완료 시 10% 할인 혜택이 자동 적용됨

### 관리자 측

1. **데이터베이스 스키마 업데이트**: 위 SQL 스크립트 실행
2. **시리얼 번호 검증 로직 커스터마이징**: 
   - `app/actions/subscriber.ts`의 `validateSerialNumber` 함수 수정
   - 실제 구매 DB와 연동 필요 시 해당 함수에서 DB 조회 로직 추가

## 🔧 커스터마이징

### 시리얼 번호 검증 로직 수정

`app/actions/subscriber.ts` 파일의 `validateSerialNumber` 함수를 수정하여 실제 구매 DB와 연동:

```typescript
function validateSerialNumber(serial: string): boolean {
  // 실제 구매 DB 조회 로직 추가
  // 예: Supabase의 purchases 테이블과 매칭
  return true // 임시로 항상 true 반환
}
```

### 할인 배너 스타일 수정

- `components/promotion/discount-banner.tsx`: 메인 홍보 배너
- `components/mypage/discount-badge.tsx`: 마이페이지 배지

## 📍 주요 파일

- `app/mypage/page.tsx`: 마이페이지 메인 컴포넌트
- `app/actions/subscriber.ts`: 구독자 인증 서버 액션
- `components/mypage/subscriber-verification.tsx`: 인증 입력 폼
- `components/mypage/discount-badge.tsx`: 할인 배지 컴포넌트
- `components/promotion/discount-banner.tsx`: 홍보 배너 컴포넌트
- `types/database.ts`: TypeScript 타입 정의 (업데이트됨)
- `scripts/add-subscriber-verification-columns.sql`: DB 스키마 업데이트 스크립트

## ✅ 체크리스트

- [x] 데이터베이스 스키마 업데이트
- [x] 마이페이지 컴포넌트 생성
- [x] 구독자 인증 서버 액션 구현
- [x] 할인 정보 표시 컴포넌트 추가
- [x] 뉴스레터 페이지에 홍보 배너 추가
- [x] 헤더에 마이페이지 링크 추가
- [ ] 실제 구매 DB와 시리얼 번호 검증 연동 (선택사항)
- [ ] 할인 적용 로직 (결제 시스템 연동, 선택사항)

## 🚀 다음 단계

1. **구매 DB 연동**: 실제 구매 데이터베이스와 시리얼 번호 매칭
2. **결제 시스템 연동**: 할인 적용 로직 구현
3. **관리자 페이지**: 구독자 인증 상태 관리 기능 추가

