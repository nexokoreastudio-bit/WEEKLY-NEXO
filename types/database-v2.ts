/**
 * Supabase 데이터베이스 타입 정의 (v2.0)
 * 
 * 커뮤니티 플랫폼용 확장된 스키마
 * 
 * 자동 생성 명령어 (Supabase CLI 사용 시):
 * npx supabase gen types typescript --project-id icriajfrxwykufhmkfun > types/database-v2.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string // UUID (auth.users 참조)
          email: string | null
          nickname: string | null
          avatar_url: string | null
          role: 'admin' | 'teacher' | 'academy_owner' | 'user' | null
          academy_name: string | null
          referrer_code: string | null
          point: number
          level: 'bronze' | 'silver' | 'gold'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          nickname?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'teacher' | 'academy_owner' | 'user' | null
          academy_name?: string | null
          referrer_code?: string | null
          point?: number
          level?: 'bronze' | 'silver' | 'gold' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          nickname?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'teacher' | 'academy_owner' | 'user' | null
          academy_name?: string | null
          referrer_code?: string | null
          point?: number
          level?: 'bronze' | 'silver' | 'gold' | null
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: number
          title: string
          subtitle: string | null
          content: string | null
          category: 'news' | 'column' | 'update' | 'event' | null
          thumbnail_url: string | null
          author_id: string | null
          published_at: string | null
          is_published: boolean
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          subtitle?: string | null
          content?: string | null
          category?: 'news' | 'column' | 'update' | 'event' | null
          thumbnail_url?: string | null
          author_id?: string | null
          published_at?: string | null
          is_published?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          subtitle?: string | null
          content?: string | null
          category?: 'news' | 'column' | 'update' | 'event' | null
          thumbnail_url?: string | null
          author_id?: string | null
          published_at?: string | null
          is_published?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          board_type: 'free' | 'qna' | 'tip' | 'market' | null
          title: string
          content: string
          author_id: string | null
          images: string[] | null
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          board_type?: 'free' | 'qna' | 'tip' | 'market' | null
          title: string
          content: string
          author_id?: string | null
          images?: string[] | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          board_type?: 'free' | 'qna' | 'tip' | 'market' | null
          title?: string
          content?: string
          author_id?: string | null
          images?: string[] | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          post_id: number
          author_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          post_id: number
          author_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          author_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: number
          post_id: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          post_id: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          user_id?: string
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: number
          title: string
          description: string | null
          file_url: string
          file_type: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null
          access_level: 'bronze' | 'silver' | 'gold'
          download_cost: number
          downloads_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          file_url: string
          file_type?: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null
          access_level?: 'bronze' | 'silver' | 'gold'
          download_cost?: number
          downloads_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          file_url?: string
          file_type?: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null
          access_level?: 'bronze' | 'silver' | 'gold'
          download_cost?: number
          downloads_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      point_logs: {
        Row: {
          id: number
          user_id: string | null
          amount: number
          reason: string | null
          related_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          amount: number
          reason?: string | null
          related_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          amount?: number
          reason?: string | null
          related_id?: number | null
          created_at?: string
        }
      }
      downloads: {
        Row: {
          id: number
          user_id: string
          resource_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          resource_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          resource_id?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'teacher' | 'academy_owner' | 'user'
      article_category: 'news' | 'column' | 'update' | 'event'
      board_type: 'free' | 'qna' | 'tip' | 'market'
      user_level: 'bronze' | 'silver' | 'gold'
      file_type: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx'
    }
  }
}

