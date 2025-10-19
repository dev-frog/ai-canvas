import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Assignment Canvas',
  description: 'AI-powered assignment writing platform for students and educators',
  keywords: ['AI', 'education', 'writing', 'assignments', 'students', 'teachers'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ScrollToTop />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}