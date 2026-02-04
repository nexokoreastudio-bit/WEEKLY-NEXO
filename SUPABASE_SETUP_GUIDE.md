# Supabase 도입 준비 가이드

## 📋 개요

NEXO Platform V2.0의 핵심 기능(회원 시스템, 포인트, 커뮤니티)을 구현하기 위해 Supabase를 도입합니다.

## 🎯 Supabase 도입 목표

1. **회원 시스템**: 카카오 로그인, 회원 관리
2. **데이터베이스**: 회원 정보, 포인트, 게시글, 주문 등 저장
3. **파일 스토리지**: 구독자 전용 자료 저장 및 접근 제어
4. **실시간 기능**: 알림, 댓글 실시간 업데이트

---

## 📦 Supabase란?

**Supabase**는 Firebase의 오픈소스 대안으로, PostgreSQL 데이터베이스와 인증 시스템을 제공하는 Backend-as-a-Service(BaaS)입니다.

### 장점
- ✅ 무료 티어 넉넉함 (월 50,000명까지)
- ✅ PostgreSQL (관계형 DB)
- ✅ 실시간 기능 내장
- ✅ 파일 스토리지 제공
- ✅ Netlify와 호환성 좋음

---

## 🚀 1단계: Supabase 프로젝트 생성

### 1.1 계정 생성
1. [Supabase](https://supabase.com) 접속
2. GitHub 계정으로 로그인 (권장)
3. "New Project" 클릭

### 1.2 프로젝트 설정
- **Organization**: 새로 생성 또는 기존 사용
- **Project Name**: `nexo-weekly-platform`
- **Database Password**: 강력한 비밀번호 설정 (저장 필수!)
- **Region**: `Northeast Asia (Seoul)` 선택
- **Pricing Plan**: Free (무료 티어)

### 1.3 프로젝트 생성 완료
- 생성까지 1-2분 소요
- 프로젝트 대시보드 접속

---

## 🗄️ 2단계: 데이터베이스 스키마 생성

### 2.1 SQL Editor 접속
1. Supabase 대시보드 → **SQL Editor** 클릭
2. "New Query" 클릭

### 2.2 테이블 생성 스크립트 실행

`TECHNICAL_SPEC_V2.md`에 정의된 스키마를 참고하여 다음 테이블들을 생성합니다:

#### 필수 테이블 (우선순위)
1. `users` - 사용자 정보
2. `point_logs` - 포인트 내역
3. `posts` - 게시글
4. `orders` - 주문/상담 신청

#### 선택 테이블 (나중에 추가)
5. `comments` - 댓글
6. `events` - 이벤트
7. `downloads` - 다운로드 이력
8. `referral_codes` - 추천인 코드

**스크립트 위치**: `TECHNICAL_SPEC_V2.md`의 "데이터베이스 스키마" 섹션 참고

### 2.3 Row Level Security (RLS) 설정
- 각 테이블에 RLS 정책 설정
- 사용자는 자신의 데이터만 조회/수정 가능
- 관리자는 모든 데이터 접근 가능

---

## 🔐 3단계: 인증 설정

### 3.1 카카오 로그인 연동
1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Kakao** 활성화
3. 카카오 개발자 앱 설정:
   - [Kakao Developers](https://developers.kakao.com) 접속
   - 앱 생성 또는 기존 앱 사용
   - Redirect URI 추가: `https://[your-project].supabase.co/auth/v1/callback`
   - REST API 키 복사
4. Supabase에 REST API 키 입력

### 3.2 이메일 로그인 (선택)
- 이메일/비밀번호 로그인도 활성화 가능
- 현재는 카카오 로그인만 사용

---

## 📁 4단계: 파일 스토리지 설정

### 4.1 Storage 버킷 생성
1. Supabase 대시보드 → **Storage**
2. "New bucket" 클릭
3. 버킷 생성:
   - **Name**: `premium-files`
   - **Public**: `false` (구독자만 접근)
   - **File size limit**: 10MB
   - **Allowed MIME types**: `application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### 4.2 Storage 정책 설정
- 구독자만 파일 다운로드 가능하도록 RLS 정책 설정

---

## 🔗 5단계: Netlify와 연동

### 5.1 Supabase 클라이언트 라이브러리 추가
```html
<!-- index.html에 추가 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 5.2 환경 변수 설정
Netlify 대시보드에서 다음 환경 변수 추가:

```
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
```

**참고**: Supabase 대시보드 → Settings → API에서 확인

### 5.3 Supabase 클라이언트 초기화
```javascript
// js/supabase-client.js (신규 파일)
const supabaseUrl = 'https://[your-project].supabase.co';
const supabaseAnonKey = '[your-anon-key]';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
```

---

## 📊 6단계: 기존 데이터 마이그레이션

### 6.1 Google Sheets 데이터 → Supabase
- 기존 주문 데이터를 Supabase `orders` 테이블로 마이그레이션
- 회원 가입 폼 데이터를 `users` 테이블로 마이그레이션

### 6.2 마이그레이션 스크립트
- Google Sheets API로 데이터 읽기
- Supabase API로 데이터 삽입
- 일회성 스크립트 작성

---

## 🧪 7단계: 테스트

### 7.1 로컬 테스트
1. Supabase 클라이언트 초기화 확인
2. 카카오 로그인 테스트
3. 데이터베이스 CRUD 테스트

### 7.2 배포 후 테스트
1. Netlify에 배포
2. 환경 변수 설정 확인
3. 실제 카카오 로그인 테스트
4. 데이터 저장/조회 테스트

---

## 📝 체크리스트

### Supabase 프로젝트 설정
- [ ] Supabase 계정 생성
- [ ] 프로젝트 생성 (Seoul 리전)
- [ ] 프로젝트 URL 및 API 키 확인

### 데이터베이스
- [ ] `users` 테이블 생성
- [ ] `point_logs` 테이블 생성
- [ ] `posts` 테이블 생성
- [ ] `orders` 테이블 생성
- [ ] RLS 정책 설정

### 인증
- [ ] 카카오 개발자 앱 생성
- [ ] Supabase에 카카오 Provider 설정
- [ ] Redirect URI 설정
- [ ] 카카오 로그인 테스트

### 파일 스토리지
- [ ] `premium-files` 버킷 생성
- [ ] Storage 정책 설정
- [ ] 테스트 파일 업로드

### Netlify 연동
- [ ] Supabase 클라이언트 라이브러리 추가
- [ ] 환경 변수 설정
- [ ] 클라이언트 초기화 코드 작성

### 데이터 마이그레이션
- [ ] Google Sheets 데이터 추출
- [ ] Supabase로 데이터 이관
- [ ] 데이터 검증

---

## 🚨 주의사항

### 보안
- ✅ **절대 공개하지 말 것**: `SUPABASE_ANON_KEY`는 공개되어도 되지만, `SERVICE_ROLE_KEY`는 절대 공개 금지
- ✅ RLS 정책을 반드시 설정하여 데이터 보호
- ✅ 환경 변수는 Netlify 대시보드에서만 관리

### 비용
- 무료 티어 제한:
  - 월 50,000명까지 무료
  - 데이터베이스 크기: 500MB
  - 파일 스토리지: 1GB
  - 대역폭: 5GB/월

### 성능
- 서울 리전 선택으로 한국 사용자에게 빠른 응답
- CDN 자동 제공

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [카카오 로그인 연동 가이드](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
- `TECHNICAL_SPEC_V2.md`: 데이터베이스 스키마 상세

---

## 🎯 다음 단계

Supabase 도입 후:
1. 카카오 로그인 UI 구현
2. 회원 가입/로그인 플로우 완성
3. 구독자 전용 자료 인증 연동
4. 포인트 시스템 구현
5. 커뮤니티 게시판 구현

---

**작성일**: 2026년 2월  
**버전**: 1.0

