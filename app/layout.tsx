import type { Metadata } from 'next'
import { Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-sans',
})

const notoSerif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'NEXO Daily - 매일 아침 발행',
  description: '넥소 전자신문 플랫폼. 매주 목요일 발행, 전자칠판과 스마트 교육 정보를 전달합니다.',
  openGraph: {
    title: 'NEXO Daily Edition - 매일 아침 발행',
    description: '넥소 전자신문 플랫폼. 매주 목요일 발행, 전자칠판과 스마트 교육 정보를 전달합니다.',
    images: ['/assets/images/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  )
}

