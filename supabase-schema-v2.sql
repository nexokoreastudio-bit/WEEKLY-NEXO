-- WEEKLY-NEXO 커뮤니티 플랫폼 데이터베이스 스키마 (v2.0)
-- 실행 순서: Supabase Dashboard > SQL Editor에서 순서대로 실행

-- ============================================
-- 1. 사용자 프로필 (확장된 프로필)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'teacher', 'academy_owner', 'user')) DEFAULT 'user',
  academy_name TEXT, -- 학원명
  referrer_code TEXT, -- 유입 경로 (설치기사 코드 등)
  point INTEGER DEFAULT 0, -- 활동 포인트
  level TEXT CHECK (level IN ('bronze', 'silver', 'gold')) DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 뉴스/매거진 (기존 editions-data.js 대체)
-- ============================================
CREATE TABLE IF NOT EXISTS public.articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT, -- HTML or Markdown
  category TEXT CHECK (category IN ('news', 'column', 'update', 'event')),
  thumbnail_url TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 커뮤니티 게시글
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  board_type TEXT CHECK (board_type IN ('free', 'qna', 'tip', 'market')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  images TEXT[], -- Supabase Storage URL 배열
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. 댓글
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. 좋아요
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- 6. 자료실 (다운로드 리소스)
-- ============================================
CREATE TABLE IF NOT EXISTS public.resources (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_type TEXT CHECK (file_type IN ('pdf', 'xlsx', 'hwp', 'docx', 'pptx')),
  access_level TEXT CHECK (access_level IN ('bronze', 'silver', 'gold')) DEFAULT 'bronze',
  download_cost INTEGER DEFAULT 0, -- 차감 포인트
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. 포인트 로그
-- ============================================
CREATE TABLE IF NOT EXISTS public.point_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- (+/-)
  reason TEXT, -- 'login', 'write_post', 'download_resource', 'daily_checkin', 'write_comment'
  related_id INTEGER, -- 관련 리소스 ID (선택사항)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. 다운로드 이력
-- ============================================
CREATE TABLE IF NOT EXISTS public.downloads (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  resource_id INTEGER REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_author ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_board_type ON public.posts(board_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_access_level ON public.resources(access_level);
CREATE INDEX IF NOT EXISTS idx_point_logs_user ON public.point_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON public.downloads(user_id);

-- ============================================
-- RLS (Row Level Security) 활성화
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책: 기존 정책 삭제 (이미 존재하는 경우)
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
DROP POLICY IF EXISTS "Admins can manage all articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can manage own articles" ON public.articles;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can manage likes" ON public.likes;
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
DROP POLICY IF EXISTS "Users can view own point logs" ON public.point_logs;
DROP POLICY IF EXISTS "Users can view own downloads" ON public.downloads;

-- ============================================
-- RLS 정책: 사용자 (users)
-- ============================================
-- 사용자는 자신의 프로필을 읽고 수정 가능
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 사용자는 자신의 프로필 수정 가능
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 모든 사용자는 다른 사용자의 프로필 조회 가능 (닉네임, 아바타 등)
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

-- ============================================
-- RLS 정책: 아티클 (articles)
-- ============================================
-- 모든 사용자는 게시된 아티클을 읽을 수 있음
CREATE POLICY "Published articles are viewable by everyone" ON public.articles
  FOR SELECT USING (is_published = TRUE);

-- 관리자는 모든 아티클 관리 가능
CREATE POLICY "Admins can manage all articles" ON public.articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 작성자는 자신의 아티클 관리 가능
CREATE POLICY "Authors can manage own articles" ON public.articles
  FOR ALL USING (auth.uid() = author_id);

-- ============================================
-- RLS 정책: 게시글 (posts)
-- ============================================
-- 모든 사용자는 게시글을 읽을 수 있음
CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

-- 인증된 사용자는 게시글 작성 가능
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 작성자는 자신의 게시글 수정/삭제 가능
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- RLS 정책: 댓글 (comments)
-- ============================================
-- 모든 사용자는 댓글을 읽을 수 있음
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

-- 인증된 사용자는 댓글 작성 가능
CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 작성자는 자신의 댓글 수정/삭제 가능
CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- RLS 정책: 좋아요 (likes)
-- ============================================
-- 모든 사용자는 좋아요를 읽을 수 있음
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

-- 인증된 사용자는 좋아요 추가/삭제 가능
CREATE POLICY "Authenticated users can manage likes" ON public.likes
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- RLS 정책: 자료실 (resources)
-- ============================================
-- 모든 사용자는 자료를 읽을 수 있음 (접근 레벨은 애플리케이션 레벨에서 체크)
CREATE POLICY "Resources are viewable by everyone" ON public.resources
  FOR SELECT USING (true);

-- ============================================
-- RLS 정책: 포인트 로그 (point_logs)
-- ============================================
-- 사용자는 자신의 포인트 로그만 조회 가능
CREATE POLICY "Users can view own point logs" ON public.point_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- RLS 정책: 다운로드 이력 (downloads)
-- ============================================
-- 사용자는 자신의 다운로드 이력만 조회 가능
CREATE POLICY "Users can view own downloads" ON public.downloads
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 함수: 새 사용자 생성 시 프로필 자동 생성
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, role, academy_name, referrer_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::TEXT, 'user'),
    COALESCE(NEW.raw_user_meta_data->>'academy_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'referrer_code', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: auth.users에 새 사용자가 생성되면 public.users에도 추가
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 함수: 게시글 작성 시 포인트 지급
-- ============================================
CREATE OR REPLACE FUNCTION public.add_points_for_post()
RETURNS TRIGGER AS $$
BEGIN
  -- 게시글 작성 시 +10 포인트
  INSERT INTO public.point_logs (user_id, amount, reason, related_id)
  VALUES (NEW.author_id, 10, 'write_post', NEW.id);
  
  UPDATE public.users
  SET point = point + 10
  WHERE id = NEW.author_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 게시글 작성 시 포인트 지급
DROP TRIGGER IF EXISTS on_post_created ON public.posts;
CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.add_points_for_post();

-- ============================================
-- 함수: 댓글 작성 시 포인트 지급 및 게시글 댓글 수 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_comment_created()
RETURNS TRIGGER AS $$
BEGIN
  -- 댓글 작성 시 +5 포인트
  INSERT INTO public.point_logs (user_id, amount, reason, related_id)
  VALUES (NEW.author_id, 5, 'write_comment', NEW.post_id);
  
  UPDATE public.users
  SET point = point + 5
  WHERE id = NEW.author_id;
  
  -- 게시글 댓글 수 증가
  UPDATE public.posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_created();

-- ============================================
-- 함수: 댓글 삭제 시 게시글 댓글 수 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_comment_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- 게시글 댓글 수 감소
  UPDATE public.posts
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = OLD.post_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_deleted ON public.comments;
CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_deleted();

-- ============================================
-- 함수: 좋아요 시 게시글 좋아요 수 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_like_toggle()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_insert ON public.likes;
CREATE TRIGGER on_like_insert
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_toggle();

DROP TRIGGER IF EXISTS on_like_delete ON public.likes;
CREATE TRIGGER on_like_delete
  AFTER DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_toggle();

-- ============================================
-- 함수: 포인트에 따른 레벨 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  -- 포인트에 따라 레벨 자동 업데이트
  UPDATE public.users
  SET level = CASE
    WHEN NEW.point >= 1000 THEN 'gold'
    WHEN NEW.point >= 500 THEN 'silver'
    ELSE 'bronze'
  END
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_point_updated ON public.users;
CREATE TRIGGER on_user_point_updated
  AFTER UPDATE OF point ON public.users
  FOR EACH ROW
  WHEN (OLD.point IS DISTINCT FROM NEW.point)
  EXECUTE FUNCTION public.update_user_level();


