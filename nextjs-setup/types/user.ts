import { Database } from './database'

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type UserRole = 'admin' | 'teacher' | 'academy_owner' | 'user'
export type UserLevel = 'bronze' | 'silver' | 'gold'

export interface UserProfile extends User {
  // 추가 프로필 필드가 필요하면 여기에 확장
}
