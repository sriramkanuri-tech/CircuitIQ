import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'CircuitIQ | Analog Electronics Learning & Certification',
  description:
    'CircuitIQ is an online learning and certification platform for mastering Analog Electronic Circuits through structured lessons, quizzes, assessments, and verified certificates.',
  keywords: [
    'Analog Electronics',
    'Circuit Design',
    'Semiconductors',
    'BJT',
    'MOSFET',
    'Operational Amplifiers',
    'Electrical Engineering Certification',
  ],
  authors: [{ name: 'CircuitIQ Academic Board' }],
  openGraph: {
    title: 'CircuitIQ | Analog Electronics Learning & Certification',
    description:
      'Learn Circuits. Build Intelligence. Earn Certification. Master analog electronic circuits with verified digital credentials.',
    url: 'https://circuitiq.edu',
    siteName: 'CircuitIQ',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
