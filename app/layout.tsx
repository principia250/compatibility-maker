import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ErrorProvider from '@/components/ErrorProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SOUKOKU',
  description: 'Create and manage compatibility charts',
  keywords: 'compatibility chart, chart maker, relationship analysis',
  authors: [{ name: 'SOUKOKU Team' }],
  robots: "index, follow",
  openGraph: {
    title: 'SOUKOKU - Compatibility Maker',
    description: 'Create and manage compatibility charts',
    type: 'website',
    url: 'https://soukoku.vercel.app',
    siteName: 'SOUKOKU',
    images: [
      {
        url: '/images/open-graph/open-graph.png',
        width: 1200,
        height: 630,
        alt: 'SOUKOKU - Compatibility Chart Maker',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} text-sm sm:text-base bg-background min-h-screen flex flex-col`}
      >
        <ErrorProvider>
          <Header />
          <main className="flex-1 my-8 mx-4">
            <div className="max-w-[900px] mx-auto">{children}</div>
          </main>
          <Footer />
        </ErrorProvider>
      </body>
    </html>
  );
}
