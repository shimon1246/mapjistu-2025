import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'MapJitsu - AI-Powered Location Intelligence',
    template: '%s | MapJitsu'
  },
  description: 'Context-aware navigation platform that surfaces trust, safety, digital hygiene, and public reputation signals about real-world locations.',
  keywords: [
    'location intelligence',
    'safety scores',
    'AI navigation',
    'trust signals',
    'reputation analysis',
    'mapbox',
    'real-time data',
    'location safety'
  ],
  authors: [
    {
      name: 'MapJitsu Team',
      url: 'https://github.com/shimon1246/mapjitsu-2025'
    }
  ],
  creator: 'MapJitsu Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mapjitsu.vercel.app',
    title: 'MapJitsu - AI-Powered Location Intelligence',
    description: 'Context-aware navigation platform with safety and reputation insights.',
    siteName: 'MapJitsu',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MapJitsu - AI-Powered Location Intelligence'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MapJitsu - AI-Powered Location Intelligence',
    description: 'Context-aware navigation platform with safety and reputation insights.',
    images: ['/og-image.png']
  },
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
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Mapbox GL CSS */}
        <link 
          href="https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css" 
          rel="stylesheet" 
        />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://tiles.mapbox.com" />
        
        {/* Viewport meta tag for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#2563eb" />
        
        {/* Apple specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MapJitsu" />
        
        {/* Microsoft specific meta tags */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            {children}
          </div>
        </div>
        
        {/* Analytics and performance monitoring would go here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Add Google Analytics, Vercel Analytics, etc. here */}
          </>
        )}
      </body>
    </html>
  )
}
