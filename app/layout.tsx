import type { Metadata, Viewport } from 'next';
import {
  Cormorant_Garamond,
  Rozha_One,
  Marcellus,
  Yatra_One,
  Tiro_Devanagari_Hindi,
  Inter,
} from 'next/font/google';
import './globals.css';
import TopNav from '@/components/layout/TopNav';
import Toaster from '@/components/ui/Toaster';

/* ── Typography ───────────────────────────────────────────────────────────
   Self-hosted at build time, so the page never waits on a font CDN.
   Four display faces, each carrying a different regional register; the
   active state theme picks one. See lib/stateThemes.ts (`FontKey`).        */

/** Mithila / pan-Indian elegance — the base voice of KalaSetu. */
const classic = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-classic',
  display: 'swap',
});

/** Mughal and Indo-Persian north — Zardozi, Banarasi, Pashmina. */
const royal = Rozha_One({
  subsets: ['latin', 'devanagari'],
  weight: '400',
  variable: '--font-royal',
  display: 'swap',
});

/** Dravidian temple south — Tanjore, Kanjivaram, Kalamkari. */
const temple = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-temple',
  display: 'swap',
});

/** Folk and tribal registers — Warli, Gond, Sohrai, the northeast looms. */
const folk = Yatra_One({
  subsets: ['latin', 'devanagari'],
  weight: '400',
  variable: '--font-folk',
  display: 'swap',
});

/** Devanagari for Sanskrit lines and native-script phrases. */
const deva = Tiro_Devanagari_Hindi({
  subsets: ['latin', 'devanagari'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-deva',
  display: 'swap',
});

/** Interface text — labels, descriptions, controls. */
const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

/* `viewportFit: 'cover'` lets the page paint into the notch area, which is
   what makes env(safe-area-inset-*) resolve to anything but zero. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFBF2',
};

export const metadata: Metadata = {
  title: 'KalaSetu — Authentic Art & Craft from Mithila, Bihar',
  description:
    'GI-tagged Madhubani paintings, Makhana, Sikki craft, and handcrafted gifts sourced directly from artisans and farmers of Mithilanchal, Bihar.',
};

const fontVars = [classic, royal, temple, folk, deva, sans]
  .map(f => f.variable)
  .join(' ');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <TopNav />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
