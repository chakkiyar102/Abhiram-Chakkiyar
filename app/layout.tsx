import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space",
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    template: '%s | Abhiram Chakkiyar',
    default: 'Abhiram Chakkiyar - Developer, Writer & Creator',
  },
  description: 'A self-taught developer, writer & creator who loves to read, write and learn about tech.',
  keywords: ['developer', 'writer', 'creator', 'blog', 'tech'],
  authors: [{ name: 'Abhiram Chakkiyar' }],
  creator: 'Abhiram Chakkiyar',
  openGraph: {
    title: 'Abhiram Chakkiyar - Developer, Writer & Creator',
    description: 'A self-taught developer, writer & creator who loves to read, write and learn about tech.',
    url: 'http://localhost:3000',
    siteName: 'Your Name',
    type: 'website',
    images: [
      {
        url: '/static/images/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Name - Developer, Writer & Creator',
    description: 'A self-taught developer, writer & creator who loves to read, write and learn about tech.',
    images: ['/static/images/twitter-card.png'],
    creator: '@yourhandle',
  },
  icons: {
    icon: [
      { url: '/static/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/static/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/static/favicons/apple-touch-icon.png', sizes: '76x76', type: 'image/png' },
    ],
  },
  manifest: '/static/favicons/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  alternates: {
    types: {
      'application/rss+xml': [{ title: 'RSS Feed', url: '/feed.xml' }],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
