/**
 * Supabase 데이터베이스 타입 정의
 * 
 * Supabase CLI로 자동 생성된 타입을 여기에 붙여넣거나,
 * 수동으로 정의합니다.
 * 
 * 생성 명령어:
 * npx supabase gen types typescript --project-id your-project-id > types/database.ts
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
        }
      }
      resources: {
        Row: {
          id: number
          title: string
          description: string | null
          file_url: string
          file_type: 'pdf' | 'xlsx' | 'hwp' | null
          access_level: 'bronze' | 'silver' | 'gold'
          download_cost: number
          downloads_count: number
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          file_url: string
          file_type?: 'pdf' | 'xlsx' | 'hwp' | null
          access_level?: 'bronze' | 'silver' | 'gold'
          download_cost?: number
          downloads_count?: number
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          file_url?: string
          file_type?: 'pdf' | 'xlsx' | 'hwp' | null
          access_level?: 'bronze' | 'silver' | 'gold'
          download_cost?: number
          downloads_count?: number
          created_at?: string
        }
      }
      point_logs: {
        Row: {
          id: number
          user_id: string | null
          amount: number
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          amount: number
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          amount?: number
          reason?: string | null
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
      file_type: 'pdf' | 'xlsx' | 'hwp'
    }
  }
}
