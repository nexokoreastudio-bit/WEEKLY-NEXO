# NEXO Platform V2.0 상세 기술 명세서

## 📋 목차
1. [시스템 아키텍처](#시스템-아키텍처)
2. [데이터베이스 스키마](#데이터베이스-스키마)
3. [API 설계](#api-설계)
4. [인증 및 권한 관리](#인증-및-권한-관리)
5. [포인트 시스템 상세 설계](#포인트-시스템-상세-설계)
6. [알림 시스템 설계](#알림-시스템-설계)
7. [파일 업로드 및 스토리지](#파일-업로드-및-스토리지)

---

## 시스템 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Netlify)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  index.html  │  │  admin.html  │  │  member.html │ │
│  │  (정적 페이지) │  │  (관리자)    │  │  (회원 전용) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         JavaScript (Vanilla JS / React)         │   │
│  │  - EditionManager                               │   │
│  │  - AuthManager                                  │   │
│  │  - PointManager                                 │   │
│  │  - CommunityManager                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Services (Supabase)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Auth API   │  │   Database   │  │   Storage    │ │
│  │  (카카오 로그인) │  │ (PostgreSQL) │  │   (파일 저장) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Edge Functions│  │  Realtime    │  │   Triggers   │ │
│  │  (서버리스 함수) │  │  (실시간)    │  │  (자동 실행)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API
                          ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  알림톡 API   │  │  Google Sheets│  │  카카오 API  │ │
│  │  (Solapi)    │  │  (주문 데이터) │  │  (로그인)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 기술 스택

#### 프론트엔드
- **현재**: HTML5, CSS3, Vanilla JavaScript
- **향후 고려**: React/Next.js (규모 확대 시)

#### 백엔드
- **Supabase**: Backend-as-a-Service
  - PostgreSQL 데이터베이스
  - 인증 시스템 (Auth)
  - 파일 스토리지 (Storage)
  - 실시간 기능 (Realtime)
  - Edge Functions (서버리스 함수)

#### 호스팅
- **Netlify**: 정적 사이트 + Functions
- **Supabase**: 백엔드 인프라

#### 외부 서비스
- **알림톡**: Solapi 또는 알리고
- **Google Sheets**: 주문 데이터 백업 (기존 유지)

---

## 데이터베이스 스키마

### 테이블 구조

#### 1. users (사용자)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  academy_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin', 'verified_buyer')),
  referrer_code TEXT, -- 유입 경로 (기사님 코드 등)
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_started_at TIMESTAMP,
  total_points INTEGER DEFAULT 0,
  current_level TEXT DEFAULT 'bronze' CHECK (current_level IN ('bronze', 'silver', 'gold', 'platinum')),
  notification_enabled BOOLEAN DEFAULT true,
  notification_method TEXT DEFAULT 'sms' CHECK (notification_method IN ('sms', 'kakao', 'email')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referrer_code ON users(referrer_code);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
```

#### 2. point_logs (포인트 내역)

```sql
CREATE TABLE point_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 양수(적립) 또는 음수(사용)
  action_type TEXT NOT NULL, -- 'read_weekly', 'write_review', 'write_comment', 'event_entry', 'purchase'
  description TEXT,
  related_id UUID, -- 관련 항목 ID (게시글, 이벤트 등)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_point_logs_user_id ON point_logs(user_id);
CREATE INDEX idx_point_logs_action_type ON point_logs(action_type);
CREATE INDEX idx_point_logs_created_at ON point_logs(created_at DESC);
```

#### 3. posts (게시글)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('review', 'community', 'question')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[], -- 이미지 URL 배열
  is_verified BOOLEAN DEFAULT false, -- 구매 인증 여부
  is_best BOOLEAN DEFAULT false, -- 베스트 후기 여부
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'deleted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_is_best ON posts(is_best) WHERE is_best = true;
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

#### 4. comments (댓글)

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id), -- 대댓글 지원
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

#### 5. post_likes (게시글 좋아요)

```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- 중복 좋아요 방지
);
```

#### 6. events (이벤트)

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  entry_cost_points INTEGER DEFAULT 0, -- 응모 비용 (포인트)
  max_entries INTEGER, -- 최대 응모 인원
  prize_description TEXT, -- 경품 설명
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  draw_date TIMESTAMP, -- 추첨일
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended', 'drawn')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. event_entries (이벤트 응모)

```sql
CREATE TABLE event_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_used INTEGER NOT NULL,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- 중복 응모 방지
);

-- 인덱스
CREATE INDEX idx_event_entries_event_id ON event_entries(event_id);
CREATE INDEX idx_event_entries_user_id ON event_entries(user_id);
```

#### 8. orders (주문/상담 신청)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id), -- 구독자일 경우
  customer_name TEXT NOT NULL,
  academy_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  referrer_code TEXT, -- 유입 경로
  product_interest TEXT, -- 관심 제품
  size TEXT, -- 인치
  mount_type TEXT, -- 설치 방식
  quantity INTEGER,
  unit_price INTEGER,
  total_price INTEGER,
  discount_amount INTEGER DEFAULT 0, -- 할인 금액
  discount_reason TEXT, -- 할인 사유 (구독자 특가 등)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'purchased', 'cancelled')),
  source TEXT DEFAULT 'weekly_nexo' CHECK (source IN ('weekly_nexo', 'direct', 'referral')),
  notes TEXT, -- 메모
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_referrer_code ON orders(referrer_code);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

#### 9. downloads (다운로드 이력)

```sql
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'pdf', 'excel', 'image'
  category TEXT, -- 'premium', 'template', 'guide'
  downloaded_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_downloads_downloaded_at ON downloads(downloaded_at DESC);
```

#### 10. referral_codes (추천인 코드)

```sql
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 고유 코드
  owner_type TEXT NOT NULL CHECK (owner_type IN ('staff', 'member', 'partner')),
  owner_id TEXT, -- 소유자 ID (기사님 ID, 회원 ID 등)
  owner_name TEXT, -- 소유자 이름
  total_referrals INTEGER DEFAULT 0, -- 총 추천 수
  total_points_given INTEGER DEFAULT 0, -- 지급한 총 포인트
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_owner ON referral_codes(owner_type, owner_id);
```

#### 11. weekly_reads (위클리 읽기 이력)

```sql
CREATE TABLE weekly_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edition_id TEXT NOT NULL, -- 발행물 ID (YYYY-MM-DD)
  read_completed BOOLEAN DEFAULT false, -- 끝까지 읽었는지
  points_earned INTEGER DEFAULT 0, -- 획득한 포인트
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, edition_id) -- 중복 읽기 방지
);

-- 인덱스
CREATE INDEX idx_weekly_reads_user_id ON weekly_reads(user_id);
CREATE INDEX idx_weekly_reads_edition_id ON weekly_reads(edition_id);
```

### 트리거 및 함수

#### 포인트 자동 업데이트 트리거

```sql
-- 포인트 로그 추가 시 사용자 총 포인트 자동 업데이트
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET total_points = (
    SELECT COALESCE(SUM(amount), 0)
    FROM point_logs
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_points
AFTER INSERT ON point_logs
FOR EACH ROW
EXECUTE FUNCTION update_user_total_points();
```

#### 레벨 자동 업그레이드 함수

```sql
-- 포인트에 따라 레벨 자동 업그레이드
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET current_level = CASE
    WHEN total_points >= 10000 THEN 'platinum'
    WHEN total_points >= 5000 THEN 'gold'
    WHEN total_points >= 2000 THEN 'silver'
    ELSE 'bronze'
  END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
AFTER UPDATE OF total_points ON users
FOR EACH ROW
WHEN (NEW.total_points <> OLD.total_points)
EXECUTE FUNCTION update_user_level();
```

---

## API 설계

### 인증 API

#### POST /auth/kakao
카카오 로그인

**Request:**
```json
{
  "access_token": "카카오 액세스 토큰"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "academy_name": "넥소학원",
    "role": "subscriber",
    "total_points": 1500,
    "current_level": "silver"
  },
  "session": {
    "access_token": "supabase_access_token",
    "refresh_token": "supabase_refresh_token"
  }
}
```

#### POST /auth/logout
로그아웃

**Response:**
```json
{
  "success": true
}
```

### 포인트 API

#### GET /points/history
포인트 내역 조회

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 100,
      "action_type": "read_weekly",
      "description": "위클리 읽기",
      "created_at": "2026-02-05T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

#### POST /points/earn
포인트 적립 (시스템 자동 호출)

**Request:**
```json
{
  "action_type": "read_weekly",
  "description": "위클리 읽기 완료",
  "related_id": "2026-02-05"
}
```

**Response:**
```json
{
  "success": true,
  "points_earned": 100,
  "total_points": 1600
}
```

### 게시판 API

#### GET /posts
게시글 목록 조회

**Query Parameters:**
- `type`: 게시글 타입 ('review', 'community', 'question')
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수
- `sort`: 정렬 방식 ('latest', 'popular', 'best')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "review",
      "title": "넥소 전자칠판 후기",
      "content": "정말 좋습니다...",
      "author": {
        "id": "uuid",
        "name": "홍길동",
        "academy_name": "넥소학원"
      },
      "is_verified": true,
      "is_best": false,
      "likes_count": 15,
      "comments_count": 5,
      "created_at": "2026-02-05T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### POST /posts
게시글 작성

**Request:**
```json
{
  "type": "review",
  "title": "넥소 전자칠판 후기",
  "content": "정말 좋습니다...",
  "images": ["url1", "url2"]
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "type": "review",
    "title": "넥소 전자칠판 후기",
    "points_earned": 500
  }
}
```

### 다운로드 API

#### GET /downloads/files
구독자 전용 파일 목록

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "id": "uuid",
      "name": "상담일지 템플릿.xlsx",
      "category": "premium",
      "file_type": "excel",
      "file_size": 1024000,
      "download_url": "/downloads/premium/상담일지_템플릿.xlsx",
      "is_available": true
    }
  ]
}
```

#### POST /downloads/download
파일 다운로드 (이력 기록)

**Request:**
```json
{
  "file_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "download_url": "signed_url",
  "expires_at": "2026-02-05T11:00:00Z"
}
```

### 주문 API

#### POST /orders
주문/상담 신청

**Request:**
```json
{
  "customer_name": "홍길동",
  "academy_name": "넥소학원",
  "phone": "010-1234-5678",
  "email": "user@example.com",
  "referrer_code": "STAFF001",
  "product_interest": "전자칠판",
  "size": "75",
  "mount_type": "wall",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "status": "pending",
    "total_price": 5500000,
    "discount_amount": 500000,
    "discount_reason": "구독자 특가"
  }
}
```

### 이벤트 API

#### GET /events
이벤트 목록

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "uuid",
      "title": "아이패드 이벤트",
      "entry_cost_points": 1000,
      "max_entries": 100,
      "prize_description": "아이패드 에어 1대",
      "start_date": "2026-02-01T00:00:00Z",
      "end_date": "2026-02-28T23:59:59Z",
      "status": "active",
      "my_entry": {
        "entered": true,
        "entry_date": "2026-02-05T10:00:00Z"
      }
    }
  ]
}
```

#### POST /events/:id/enter
이벤트 응모

**Response:**
```json
{
  "success": true,
  "entry": {
    "id": "uuid",
    "points_used": 1000,
    "remaining_points": 500
  }
}
```

---

## 인증 및 권한 관리

### 인증 플로우

```
1. 사용자가 카카오 로그인 버튼 클릭
   ↓
2. 카카오 인증 페이지로 리다이렉트
   ↓
3. 사용자 인증 완료 후 액세스 토큰 발급
   ↓
4. 액세스 토큰을 Supabase Auth API로 전송
   ↓
5. Supabase가 카카오 사용자 정보 조회
   ↓
6. users 테이블에 회원 정보 저장/업데이트
   ↓
7. Supabase 세션 토큰 발급
   ↓
8. 클라이언트에 세션 저장 (localStorage)
```

### 권한 레벨

#### subscriber (구독자)
- 기본 회원
- 구독자 전용 자료 다운로드
- 게시판 작성/댓글
- 포인트 적립/사용
- 이벤트 응모

#### verified_buyer (구매 인증 회원)
- 구매 완료 회원
- subscriber 권한 + 구매 인증 마크
- 베스트 후기 선정 가능

#### admin (관리자)
- 모든 권한
- 게시글 관리
- 이벤트 관리
- 통계 조회

### 세션 관리

- **저장 위치**: localStorage
- **토큰 타입**: JWT (Supabase)
- **만료 시간**: 7일 (자동 갱신)
- **로그아웃**: 토큰 삭제

---

## 포인트 시스템 상세 설계

### 포인트 적립 규칙

| 액션 | 포인트 | 조건 |
|------|--------|------|
| 회원가입 | +1,000 | 최초 1회만 |
| 위클리 읽기 | +100 | 끝까지 스크롤 완료 |
| 후기 작성 | +500 | 기본 |
| 후기 작성 (사진 포함) | +1,000 | 사진 1장 이상 |
| 댓글 작성 | +50 | 기본 |
| 베스트 후기 선정 | +2,000 | 관리자 선정 |
| 이벤트 당첨 | +5,000 | 경품 수령 시 |

### 포인트 사용처

| 항목 | 비용 | 제한 |
|------|------|------|
| 이벤트 응모 | 1,000P | 이벤트별 1회 |
| 레벨 업그레이드 | - | 자동 (포인트 기준) |

### 레벨 시스템

| 레벨 | 필요 포인트 | 혜택 |
|------|------------|------|
| Bronze | 0-1,999 | 기본 자료 다운로드 |
| Silver | 2,000-4,999 | 프리미엄 자료 일부 |
| Gold | 5,000-9,999 | 프리미엄 자료 전체 |
| Platinum | 10,000+ | 특별 혜택 + 우선 상담 |

---

## 알림 시스템 설계

### 알림 타입

1. **위클리 발행 알림** (매주 목요일)
   - 발행물 제목
   - 주요 내용 요약
   - 링크

2. **포인트 적립 알림** (실시간)
   - 적립 포인트
   - 적립 사유
   - 총 포인트

3. **이벤트 알림** (선택)
   - 새 이벤트 시작
   - 당첨 발표

4. **댓글 알림** (선택)
   - 내 게시글에 댓글 달림

### 알림 발송 플로우

```
1. 이벤트 발생 (발행, 포인트 적립 등)
   ↓
2. Supabase Trigger 실행
   ↓
3. Edge Function 호출
   ↓
4. 알림톡 API 호출 (Solapi)
   ↓
5. 발송 완료 로그 기록
```

### 알림 설정 관리

- 사용자가 알림 수신 방법 선택 (SMS/카카오톡/이메일)
- 알림 타입별 on/off 설정
- 알림 내역 조회

---

## 파일 업로드 및 스토리지

### 파일 구조

```
Supabase Storage
├── premium/
│   ├── templates/
│   │   ├── 상담일지_템플릿.xlsx
│   │   └── 수업계획서_템플릿.xlsx
│   └── guides/
│       └── 학원운영_가이드.pdf
├── reviews/
│   └── {post_id}/
│       ├── image1.jpg
│       └── image2.jpg
└── events/
    └── {event_id}/
        └── banner.jpg
```

### 접근 제어

- **premium/**: 구독자만 접근 가능
- **reviews/**: 게시글 작성자 + 관리자
- **events/**: 공개 (모든 사용자)

### 파일 업로드 플로우

```
1. 사용자가 파일 선택
   ↓
2. 클라이언트에서 파일 검증 (크기, 형식)
   ↓
3. Supabase Storage에 업로드
   ↓
4. 업로드된 URL을 DB에 저장
   ↓
5. 다운로드 시 서명된 URL 생성 (만료 시간 설정)
```

---

## 보안 고려사항

### 데이터 보호
- 모든 API 요청에 인증 토큰 필요
- 민감 정보는 환경 변수로 관리
- SQL Injection 방지 (Supabase 자동 처리)

### 파일 보안
- 파일 업로드 시 바이러스 스캔 (선택사항)
- 파일 크기 제한
- 허용된 파일 형식만 업로드

### 사용자 데이터
- 개인정보 암호화 저장
- GDPR 준수 (개인정보 삭제 요청 처리)

---

**작성일**: 2026년 2월  
**버전**: 1.0  
**작성자**: NEXO Platform 개발팀

© 2026 주식회사 넥소 (NEXO). All rights reserved.


