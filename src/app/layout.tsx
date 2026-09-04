import './globals.css';
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider'; // Sesuaikan path jika lokasi ThemeProvider berbeda

export const metadata = {
  title: 'K&B Management Platform',
  description: 'Personal & Organization Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
