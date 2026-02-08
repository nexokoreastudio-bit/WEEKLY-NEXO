import { MetadataRoute } from 'next'
import { getAllEditions } from '@/lib/supabase/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  
  // 기본 페이지
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/field`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ]

  // 발행호 페이지
  try {
    const editions = await getAllEditions()
    const editionRoutes = editions.map((editionId) => ({
      url: `${baseUrl}/news/${editionId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    
    return [...routes, ...editionRoutes]
  } catch (error) {
    console.error('Sitemap 생성 오류:', error)
    return routes
  }
}

