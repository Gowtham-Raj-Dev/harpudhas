import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { AppShell } from '@/components/AppShell';

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
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-botanical-700 selection:text-white overflow-x-hidden min-h-screen flex flex-col bg-sandal-50 text-botanical-800">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
