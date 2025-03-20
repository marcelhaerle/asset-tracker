import type { Metadata } from 'next';

import './globals.css';

import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';

export const metadata: Metadata = {
  title: 'Company Asset Tracker',
  description: 'Track and manage company assets',
  icons: {
    icon: '/favicon.ico',
  },
};

// Add Font Awesome for icons
const fontAwesomeLink = {
  rel: 'stylesheet',
  href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link {...fontAwesomeLink} />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
