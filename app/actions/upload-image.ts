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

    // base64 데이터에서 MIME 타입과 데이터 추출
    const base64Match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match) {
      return { success: false, error: '잘못된 이미지 형식입니다.' }
    }
    
    const imageType = base64Match[1].toLowerCase() // jpeg, png, webp 등
    const base64String = base64Match[2]
    
    // base64를 Buffer로 변환
    let buffer: Buffer
    try {
      buffer = Buffer.from(base64String, 'base64')
    } catch (error) {
      return { success: false, error: '이미지 데이터 변환에 실패했습니다.' }
    }
    
    // 빈 버퍼 체크
    if (!buffer || buffer.length === 0) {
      return { success: false, error: '이미지 데이터가 비어있습니다.' }
    }
    
    // Content-Type 결정
    const contentTypeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    }
    const contentType = contentTypeMap[imageType] || 'image/jpeg'
    
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
      const ext = fileName.split('.').pop()?.toLowerCase() || imageType || 'jpg'
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
      const sanitizedName = sanitizeFileName(nameWithoutExt)
      finalFileName = `field-news/${timestamp}-${cryptoRandom}-${randomStr}-${sanitizedName}.${ext}`
    } else {
      finalFileName = `field-news/${timestamp}-${cryptoRandom}-${randomStr}.${imageType || 'jpg'}`
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
          contentType: contentType,
          upsert: false,
          cacheControl: '3600',
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
          const ext = fileName.split('.').pop()?.toLowerCase() || imageType || 'jpg'
          const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
          const sanitizedName = sanitizeFileName(nameWithoutExt)
          finalFileName = `field-news/${timestamp}-${newCryptoRandom}-${newRandomStr}-${sanitizedName}.${ext}`
        } else {
          finalFileName = `field-news/${timestamp}-${newCryptoRandom}-${newRandomStr}.${imageType || 'jpg'}`
        }
        console.log(`🔄 재시도 ${retryCount}/${maxRetries}: ${finalFileName}`)
      }
    }

    if (uploadError) {
      console.error('❌ 이미지 업로드 실패:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
        name: uploadError.name,
      })
      
      // 버킷이 없는 경우 안내
      if (uploadError.message?.includes('Bucket not found') || uploadError.error === 'Bucket not found') {
        return {
          success: false,
          error: 'Storage 버킷이 없습니다. Supabase 대시보드에서 "field-news" 버킷을 생성해주세요.',
        }
      }
      
      // Bad Request 오류의 경우 더 자세한 정보 제공
      if (uploadError.statusCode === 400 || uploadError.message?.includes('Bad Request')) {
        return {
          success: false,
          error: `이미지 업로드 실패: 잘못된 요청입니다. (파일 크기: ${(buffer.length / 1024).toFixed(2)}KB, 타입: ${contentType})`,
        }
      }
      
      return {
        success: false,
        error: uploadError.message || uploadError.error || '이미지 업로드에 실패했습니다.',
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
