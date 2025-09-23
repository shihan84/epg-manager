import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'EPG Manager - Electronic Program Guide Management System',
  description:
    'A comprehensive EPG management system for live TV channel streamers. Create, manage, and host your electronic program guides with ease.',
  keywords: [
    'EPG',
    'Electronic Program Guide',
    'TV streaming',
    'channel management',
    'XMLTV',
    'live TV',
  ],
  authors: [{ name: 'Ultimate News Web Media Production Pvt Ltd' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'EPG Manager',
    description:
      'Comprehensive EPG management system for live TV channel streamers',
    url: 'https://epg-manager.vercel.app',
    siteName: 'EPG Manager',
    type: 'website',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'EPG Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPG Manager',
    description:
      'Comprehensive EPG management system for live TV channel streamers',
    images: ['/icon-512.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
