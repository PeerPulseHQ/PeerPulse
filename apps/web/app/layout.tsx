import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://peerpulse.app'),
  title: {
    default: 'PeerPulse — Decentralised Election Verification',
    template: '%s — PeerPulse',
  },
  description:
    'Citizens independently verify elections with BLE presence attestation and cryptographic tallies. No central server. Android-only.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <head>
        {/* Theme bootstrap — runs before render to prevent flash of wrong theme.
            Reads localStorage and sets data-theme on <html> for explicit user choice.
            When absent, the @media (prefers-color-scheme) rule in globals.css applies. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
      </head>
      <body>
        <Nav />
        <main style={{ paddingTop: '60px' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
