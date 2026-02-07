/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'weekly-nexo.netlify.app',
      'supabase.co',
      'icriajfrxwykufhmkfun.supabase.co',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.storage',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
    // 개발 환경에서 이미지 최적화 비활성화 (선택사항)
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // 환경 변수 검증
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // 실험적 기능 (Next.js 14에서는 serverActions가 기본 활성화됨)
  // 기존 HTML 파일과 병행 사용
  async rewrites() {
    return [
      {
        source: '/legacy/:path*',
        destination: '/:path*',
      },
    ]
  },
}

module.exports = nextConfig

