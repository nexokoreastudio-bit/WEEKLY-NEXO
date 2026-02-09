/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'weekly-nexo.netlify.app',
      'supabase.co',
      // Supabase Storage 도메인 추가 필요
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // 환경 변수 검증
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // 실험적 기능 (필요시)
  experimental: {
    // 서버 액션 사용
    serverActions: true,
  },
}

module.exports = nextConfig
