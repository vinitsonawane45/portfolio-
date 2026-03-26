import type { Metadata } from 'next';
import { DM_Mono, Syne, DM_Sans } from 'next/font/google';
import './globals.css';

// --- Configure Next.js Local Fonts ---
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vinit Sonawane | AI Engineer',
  description: 'Portfolio of Vinit Sonawane, an AI Engineer and Data Scientist specialising in LLMs, LangChain, and scalable cloud deployments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>
      <body
        className={`${dmMono.variable} ${syne.variable} ${dmSans.variable}`}
        data-theme="dark"
      >
        {children}
      </body>
    </html>
  );
}