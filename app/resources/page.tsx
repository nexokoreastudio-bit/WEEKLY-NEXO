import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllResources } from '@/lib/supabase/resources'
import { Database } from '@/types/database'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Download, Lock, FileText, FileSpreadsheet, File, FileImage } from 'lucide-react'
import { DownloadResourceButton } from '@/components/resources/download-button'
import { ImageDownloadButton } from '@/components/resources/image-download-button'
import { SafeImage } from '@/components/safe-image'
import styles from './resources.module.css'

type UserRow = Database['public']['Tables']['users']['Row']

const FILE_TYPE_ICONS = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  hwp: File,
  docx: FileText,
  pptx: FileImage,
}

const FILE_TYPE_LABELS = {
  pdf: 'PDF',
  xlsx: 'Excel',
  hwp: '한글',
  docx: 'Word',
  pptx: 'PowerPoint',
}

const LEVEL_LABELS = {
  bronze: '🥉 브론즈',
  silver: '🥈 실버',
  gold: '🥇 골드',
}

export default async function ResourcesPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 사용자 레벨 가져오기
  const { data: profileData } = await supabase
    .from('users')
    .select('level, point')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<UserRow, 'level' | 'point'> | null

  const userLevel = (profile?.level || 'bronze') as 'bronze' | 'silver' | 'gold'
  const userPoint = profile?.point || 0

  // 자료 목록 가져오기
  const resources = await getAllResources(userLevel, user.id)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📚 자료실</h1>
        <p className={styles.subtitle}>
          넥소 관련 유용한 자료를 다운로드하세요
        </p>
        <div className={styles.userInfo}>
          <div className={styles.levelBadge}>
            {LEVEL_LABELS[userLevel]}
          </div>
          <div className={styles.pointInfo}>
            보유 포인트: <strong>{userPoint.toLocaleString()}P</strong>
          </div>
        </div>
      </div>

      {/* 자료 목록 */}
      {resources.length === 0 ? (
        <div className={styles.empty}>
          <p>아직 등록된 자료가 없습니다.</p>
        </div>
      ) : (
        <div className={styles.resourcesGrid}>
          {resources.map((resource) => {
            const FileIcon = resource.file_type
              ? FILE_TYPE_ICONS[resource.file_type] || File
              : File

            const thumbnailUrl = (resource as any).thumbnail_url

            return (
              <div
                key={resource.id}
                className={`${styles.resourceCard} ${
                  !resource.canAccess ? styles.locked : ''
                }`}
              >
                {/* 썸네일 이미지 */}
                {thumbnailUrl && (
                  <div className={styles.thumbnailContainer}>
                    <SafeImage
                      src={thumbnailUrl}
                      alt={resource.title}
                      className={styles.thumbnail}
                      fill
                    />
                  </div>
                )}

                <div className={styles.cardHeader}>
                  <div className={styles.fileType}>
                    <FileIcon className={styles.fileIcon} />
                    <span>{resource.file_type ? FILE_TYPE_LABELS[resource.file_type] : '파일'}</span>
                  </div>
                  {!resource.canAccess && (
                    <div className={styles.lockBadge}>
                      <Lock className={styles.lockIcon} />
                      {LEVEL_LABELS[resource.access_level]} 필요
                    </div>
                  )}
                </div>

                <h2 className={styles.resourceTitle}>{resource.title}</h2>
                {resource.description && (
                  <p className={styles.resourceDescription}>{resource.description}</p>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.resourceMeta}>
                    <span className={styles.accessLevel}>
                      {LEVEL_LABELS[resource.access_level]}
                    </span>
                    {resource.download_cost > 0 && (
                      <span className={styles.cost}>
                        💰 {resource.download_cost}P
                      </span>
                    )}
                    <span className={styles.downloads}>
                      📥 {resource.downloads_count}회 다운로드
                    </span>
                  </div>

                  {resource.canAccess ? (
                    <div className="space-y-2">
                      <DownloadResourceButton
                        resourceId={resource.id}
                        downloadCost={resource.download_cost}
                        hasDownloaded={resource.hasDownloaded}
                        userPoint={userPoint}
                      />
                      {thumbnailUrl && (
                        <ImageDownloadButton
                          imageUrl={thumbnailUrl}
                          fileName={resource.title}
                        />
                      )}
                    </div>
                  ) : (
                    <div className={styles.lockedButton}>
                      <Lock className={styles.lockIcon} />
                      레벨 업 필요
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

