-- 고객 후기 시스템 개선
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. posts 테이블에 review board_type 추가 및 평점 필드 추가
-- ============================================

-- board_type CHECK 제약 조건 업데이트 (review 추가)
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_board_type_check;

ALTER TABLE public.posts
ADD CONSTRAINT posts_board_type_check 
CHECK (board_type IN ('free', 'qna', 'tip', 'market', 'review'));

-- 평점 필드 추가 (1-5점)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- 베스트 후기 필드 추가
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS is_best BOOLEAN DEFAULT FALSE;

-- 구매 인증 후기 필드 추가 (subscriber_verified와 연동)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS is_verified_review BOOLEAN DEFAULT FALSE;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_board_type_review ON public.posts(board_type) WHERE board_type = 'review';
CREATE INDEX IF NOT EXISTS idx_posts_is_best ON public.posts(is_best) WHERE is_best = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_rating ON public.posts(rating) WHERE board_type = 'review';

-- ============================================
-- 2. 후기 작성 시 포인트 지급 트리거 업데이트
-- ============================================

-- 후기 작성 시 포인트 지급 함수 (기존 함수 업데이트)
CREATE OR REPLACE FUNCTION public.add_points_for_review()
RETURNS TRIGGER AS $$
BEGIN
  -- review 타입 게시글 작성 시 포인트 지급
  IF NEW.board_type = 'review' THEN
    -- 기본 후기 작성: +500 포인트
    INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
    VALUES (NEW.author_id, 500, 'write_review', NEW.id, 'post');
    
    UPDATE public.users
    SET point = point + 500
    WHERE id = NEW.author_id;
    
    -- 사진이 포함된 경우 추가 포인트 (+500)
    IF NEW.images IS NOT NULL AND array_length(NEW.images, 1) > 0 THEN
      INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
      VALUES (NEW.author_id, 500, 'write_review_with_images', NEW.id, 'post');
      
      UPDATE public.users
      SET point = point + 500
      WHERE id = NEW.author_id;
    END IF;
    
    -- 구매 인증 후기인 경우 추가 포인트 (+500)
    IF NEW.is_verified_review = TRUE THEN
      INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
      VALUES (NEW.author_id, 500, 'write_verified_review', NEW.id, 'post');
      
      UPDATE public.users
      SET point = point + 500
      WHERE id = NEW.author_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거가 있으면 삭제하고 새로 생성
DROP TRIGGER IF EXISTS on_review_created ON public.posts;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.posts
  FOR EACH ROW
  WHEN (NEW.board_type = 'review')
  EXECUTE FUNCTION public.add_points_for_review();

-- ============================================
-- 3. 베스트 후기 선정 시 포인트 지급 함수
-- ============================================

CREATE OR REPLACE FUNCTION public.add_points_for_best_review()
RETURNS TRIGGER AS $$
BEGIN
  -- 베스트 후기로 선정된 경우 +2000 포인트
  IF NEW.is_best = TRUE AND OLD.is_best = FALSE THEN
    INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
    VALUES (NEW.author_id, 2000, 'best_review_selected', NEW.id, 'post');
    
    UPDATE public.users
    SET point = point + 2000
    WHERE id = NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_best_review_selected ON public.posts;
CREATE TRIGGER on_best_review_selected
  AFTER UPDATE OF is_best ON public.posts
  FOR EACH ROW
  WHEN (NEW.is_best = TRUE AND OLD.is_best = FALSE)
  EXECUTE FUNCTION public.add_points_for_best_review();

-- ============================================
-- 4. 구매 인증 후기 자동 설정 함수
-- ============================================

CREATE OR REPLACE FUNCTION public.set_verified_review()
RETURNS TRIGGER AS $$
BEGIN
  -- 작성자가 구독자 인증을 완료한 경우 자동으로 인증 후기로 설정
  IF NEW.board_type = 'review' THEN
    SELECT subscriber_verified INTO NEW.is_verified_review
    FROM public.users
    WHERE id = NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_before_insert ON public.posts;
CREATE TRIGGER on_review_before_insert
  BEFORE INSERT ON public.posts
  FOR EACH ROW
  WHEN (NEW.board_type = 'review')
  EXECUTE FUNCTION public.set_verified_review();


