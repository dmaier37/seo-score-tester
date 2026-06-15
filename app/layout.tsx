import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Free SEO Score Tester | ESMIAN Web Solutions',
  description: 'Find out why your competitors outrank you. Get your free SEO score in 30 seconds — no signup required.',
  openGraph: {
    title: 'Free SEO Score Tester | ESMIAN',
    description: 'Scan 40+ SEO signals and get your real score in under 30 seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
