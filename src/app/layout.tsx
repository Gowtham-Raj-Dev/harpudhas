import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Toast } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Hàrpudha's — Ancestral Herbal & Ayurvedic Skincare | Hair, Face & Body",
  description:
    "Handcrafted Siddha formulations slow-infused in bronze urulis. Pure hibiscus hair oil, Kashmiri saffron radiance cream, and traditional bath ubtan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} scroll-smooth`}>
      <body className="antialiased selection:bg-botanical-700 selection:text-white overflow-x-hidden min-h-screen flex flex-col bg-[#FCFBF7] text-[#132A1F]">
        <StoreProvider>
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <CartDrawer />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
