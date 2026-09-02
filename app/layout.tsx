import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CartProvider } from './components/CartContext';
import CookieConsent from './components/CookieConsent';

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://peptidosnovita.cl'),
  title: {
    default: 'Peptidos Novita | Péptidos de Alta Pureza en Chile',
    template: '%s | Peptidos Novita',
  },
  description: 'Descubre nuestra línea exclusiva de péptidos de alta pureza y vanguardia biotecnológica. Envíos discretos y seguros a todo Chile.',
  keywords: [
    'Peptidos Novita',
    'Péptidos Chile',
    'Biotecnología',
    'Péptidos de alta pureza',
    'Bienestar Biológico',
    'Chile Péptidos Online',
  ],
  authors: [{ name: 'Peptidos Novita', url: 'https://peptidosnovita.cl' }],
  creator: 'Peptidos Novita',
  publisher: 'Peptidos Novita',
  alternates: {
    canonical: 'https://peptidosnovita.cl',
  },
  icons: {
    icon: [
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Peptidos Novita | Péptidos de Alta Pureza en Chile',
    description: 'Catálogo especializado de péptidos premium con estándares de máxima calidad. Envíos a todo Chile.',
    url: 'https://peptidosnovita.cl',
    siteName: 'Peptidos Novita',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Peptidos Novita - Péptidos de Alta Pureza Chile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peptidos Novita | Péptidos de Alta Pureza en Chile',
    description: 'Catálogo especializado de péptidos premium con estándares de máxima calidad.',
    images: ['/og-image.png'],
  },
};

const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'Peptidos Novita',
  url: 'https://peptidosnovita.cl',
  logo: 'https://peptidosnovita.cl/icon-512.png',
  image: 'https://peptidosnovita.cl/og-image.png',
  description: 'Tienda especializada en péptidos de alta pureza y productos de vanguardia biotecnológica en Chile.',
  priceRange: '$$$',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CL',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Peptidos Novita',
  url: 'https://peptidosnovita.cl',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://peptidosnovita.cl/#catalogo?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body style={{ background: '#080808', color: '#fff', fontFamily: 'Inter, sans-serif' }} suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
        <CookieConsent />
      </body>
    </html>
  );
}

