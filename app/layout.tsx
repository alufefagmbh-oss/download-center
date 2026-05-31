import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin'
import { extractRouterConfig } from 'uploadthing/server'
import { uploadRouter } from '@/app/api/uploadthing/core'
import './globals.css'

export const metadata: Metadata = {
  title: 'ALUFEFA Downloadcenter',
  description: 'Produktkataloge, Datenblätter und technische Dokumentationen der ALUFEFA GmbH',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="de" className="h-full">
        <body className="h-full">
          <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
