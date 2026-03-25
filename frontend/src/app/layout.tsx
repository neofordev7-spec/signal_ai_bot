import type { Metadata } from 'next';
import Script from 'next/script';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'SignalAI - Muammolarni xabar bering',
  description: 'Shahardagi muammolarni xabar bering va AI tahlilini oling',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-tg-bg text-tg-text min-h-screen pb-16">
        <AppProvider>
          <main className="max-w-lg mx-auto px-4 pt-4">
            {children}
          </main>
          <Navbar />
        </AppProvider>
      </body>
    </html>
  );
}
