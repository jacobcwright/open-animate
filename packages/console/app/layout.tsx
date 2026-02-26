import type { Metadata } from 'next';
import { Inter, Instrument_Serif, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-instrument-serif',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'oanim',
    template: '%s | oanim',
  },
  description: 'Motion graphics platform — create, render, and manage video content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{ baseTheme: dark }}
      afterSignOutUrl="/sign-in"
      dynamic
    >
      <html
        lang="en"
        className={`dark ${inter.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
      >
        <body className="antialiased">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
