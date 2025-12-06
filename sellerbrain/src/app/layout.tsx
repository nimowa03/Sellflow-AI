import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SellerBrain AI - 법적으로 안전한 완전 자동화 플랫폼',
  description: 'AI가 상표권/저작권/금지어를 자동으로 검사하고, 상품 소싱부터 업로드까지 95% 자동화합니다. 1인 셀러를 위한 스마트한 선택.',
  keywords: ['셀러브레인', 'AI', '이커머스', '스마트스토어', '쿠팡', '자동화', '상표권', '금지어'],
  authors: [{ name: 'SellerBrain AI' }],
  openGraph: {
    title: 'SellerBrain AI - 법적으로 안전한 완전 자동화 플랫폼',
    description: 'AI가 상표권/저작권/금지어를 자동으로 검사하고, 상품 소싱부터 업로드까지 95% 자동화합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
