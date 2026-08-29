import './globals.css';
import React from 'react';

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
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
