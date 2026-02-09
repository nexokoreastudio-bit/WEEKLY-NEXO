import { Database } from './database'

export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Database['public']['Tables']['articles']['Insert']
export type ArticleUpdate = Database['public']['Tables']['articles']['Update']

export type ArticleCategory = 'news' | 'column' | 'update' | 'event'

export interface ArticleWithAuthor extends Article {
  author?: {
    id: string
    nickname: string | null
    avatar_url: string | null
  }
}
