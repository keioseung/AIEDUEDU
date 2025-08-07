import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import PWARegister from '@/components/pwa-register'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Mastery Hub',
  description: 'AI 학습을 위한 종합 플랫폼',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  // Android 15 호환성을 위한 메타 태그
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'AI Hub',
    'application-name': 'AI Mastery Hub',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
  },
  // 보안 강화
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Android 15 호환성을 위한 추가 메타 태그 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Hub" />
        
        {/* 보안 강화 */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* PWA 아이콘 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <PWARegister />
      </body>
    </html>
  )
} 