import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EPG Manager - Electronic Program Guide Management System",
  description: "A comprehensive EPG management system for live TV channel streamers. Create, manage, and host your electronic program guides with ease.",
  keywords: ["EPG", "Electronic Program Guide", "TV streaming", "channel management", "XMLTV", "live TV"],
  authors: [{ name: "EPG Manager Team" }],
  openGraph: {
    title: "EPG Manager",
    description: "Comprehensive EPG management system for live TV channel streamers",
    url: "https://epg-manager.vercel.app",
    siteName: "EPG Manager",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EPG Manager",
    description: "Comprehensive EPG management system for live TV channel streamers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
