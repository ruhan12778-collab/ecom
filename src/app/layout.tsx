import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'CodeEd - Learn to Code',
  description: 'E-Commerce Platform for Coding Courses with AI-Powered Learning',
  keywords: ['coding', 'courses', 'programming', 'learning', 'education'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800&f[]=satoshi@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${jetbrainsMono.variable} font-sans bg-bg-primary min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  )
}
