'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { applyTheme } from '@/lib/theme';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Toast } from '@/components/Toast';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const { trackPageView, siteSettings } = useStore();

  // Apply the colour theme live (admin accent only applies inside /admin)
  useEffect(() => {
    applyTheme(siteSettings.theme, isAdmin ? 'admin' : 'site');
  }, [siteSettings.theme, isAdmin]);

  useEffect(() => {
    if (!isAdmin) trackPageView(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {!isAdmin && <Header />}
      <main className="flex-1 w-full">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      <Toast />
    </>
  );
};
