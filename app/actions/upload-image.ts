'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { randomBytes } from 'crypto'

type UserRow = Database['public']['Tables']['users']['Row']

/**
 * 이미지를 Supabase Storage에 업로드하고 공개 URL 반환
 */
export async function uploadImageToStorage(
  base64Data: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // base64 데이터에서 데이터 URL 부분 제거
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '')
    
    // base64를 Buffer로 변환
    const buffer = Buffer.from(base64String, 'base64')
    
    // 더 고유한 파일명 생성 (타임스탬프 + crypto 랜덤 + 추가 랜덤)
    const timestamp = Date.now()
    const cryptoRandom = randomBytes(8).toString('hex') // 16자리 hex 문자열
    const randomStr = Math.random().toString(36).substring(2, 10) // 추가 랜덤 문자열
    
    // 파일명에서 특수문자 제거 및 정리
    const sanitizeFileName = (name: string): string => {
      return name
        .replace(/[^a-zA-Z0-9.-]/g, '-') // 특수문자를 하이픈으로 변경
        .replace(/-+/g, '-') // 연속된 하이픈을 하나로
        .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
    }
    
    let finalFileName: string
    if (fileName) {
      // 파일명이 제공되면 확장자 추출 후 고유한 이름 생성
      const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg'
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
      const sanitizedName = sanitizeFileName(nameWithoutExt)
      finalFileName = `field-news/${timestamp}-${cryptoRandom}-${randomStr}-${sanitizedName}.${ext}`
    } else {
      finalFileName = `field-news/${timestamp}-${cryptoRandom}-${randomStr}.jpg`
    }
    
    console.log('📤 업로드 시도 파일명:', finalFileName)
    
    // 관리자 클라이언트로 Storage에 업로드 (RLS 우회)
    const adminSupabase = await createAdminClient()
    
    // Storage에 업로드 (최대 3회 재시도)
    let uploadError: any = null
    let uploadData: any = null
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      const { data, error } = await adminSupabase.storage
        .from('field-news')
        .upload(finalFileName, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        })
      
      uploadData = data
      uploadError = error
      
      // 성공하거나 "already exists"가 아닌 다른 오류면 중단
      if (!error || !error.message?.includes('already exists')) {
        break
      }
      
      // "already exists" 오류면 파일명을 변경하여 재시도
      retryCount++
      if (retryCount < maxRetries) {
        const newCryptoRandom = randomBytes(8).toString('hex')
        const newRandomStr = Math.random().toString(36).substring(2, 10)
        if (fileName) {
          const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg'
          const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
          const sanitizedName = sanitizeFileName(nameWithoutExt)
          finalFileName = `field-news/${timestamp}-${newCryptoRandom}-${newRandomStr}-${sanitizedName}.${ext}`
        } else {
          finalFileName = `field-news/${timestamp}-${newCryptoRandom}-${newRandomStr}.jpg`
        }
        console.log(`🔄 재시도 ${retryCount}/${maxRetries}: ${finalFileName}`)
      }
    }

    if (uploadError) {
      console.error('❌ 이미지 업로드 실패:', uploadError.message)
      
      // 버킷이 없는 경우 안내
      if (uploadError.message?.includes('Bucket not found')) {
        return {
          success: false,
          error: 'Storage 버킷이 없습니다. Supabase 대시보드에서 "field-news" 버킷을 생성해주세요.',
        }
      }
      
      return {
        success: false,
        error: uploadError.message,
      }
    }

    // 공개 URL 생성
    const { data: urlData } = adminSupabase.storage
      .from('field-news')
      .getPublicUrl(finalFileName)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error: any) {
    console.error('❌ 이미지 업로드 오류:', error)
    return {
      success: false,
      error: error.message || '이미지 업로드 중 오류가 발생했습니다.',
    }
  }
}
