'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react';

// The header listens for these to open its search / account sheets
export const openSearch = () => window.dispatchEvent(new Event('harpudhas:open-search'));
export const openAccount = () => window.dispatchEvent(new Event('harpudhas:open-account'));

/** App-style bottom tab bar for phones. */
export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, setShowCartDrawer, currentVisitor } = useStore();
  const signedIn = !!currentVisitor?.signedIn;

  const item = 'flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-medium transition-colors';
  const on = 'text-botanical-900';
  const off = 'text-botanical-800/50';

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-sandal-200 shadow-[0_-8px_24px_-12px_rgb(var(--botanical-900)/0.18)] pb-safe">
      <div className="flex items-stretch h-16">
        <Link href="/" className={`${item} ${pathname === '/' ? on : off}`}>
          <Home className="w-5 h-5" strokeWidth={pathname === '/' ? 2.4 : 1.8} />
          Home
        </Link>
        <Link href="/shop" className={`${item} ${pathname.startsWith('/shop') ? on : off}`}>
          <LayoutGrid className="w-5 h-5" strokeWidth={pathname.startsWith('/shop') ? 2.4 : 1.8} />
          Shop
        </Link>
        <button onClick={openSearch} className={`${item} ${off}`}>
          <Search className="w-5 h-5" strokeWidth={1.8} />
          Search
        </button>
        <button onClick={() => setShowCartDrawer(true)} className={`${item} ${off}`}>
          <span className="relative">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </span>
          Cart
        </button>
        <button onClick={openAccount} className={`${item} ${signedIn || pathname.startsWith('/orders') ? on : off}`}>
          {signedIn ? (
            <span className="w-5 h-5 rounded-full bg-sandal-500 text-botanical-950 text-[10px] font-bold flex items-center justify-center">
              {currentVisitor?.fullName?.[0]?.toUpperCase()}
            </span>
          ) : (
            <User className="w-5 h-5" strokeWidth={1.8} />
          )}
          {signedIn ? 'Account' : 'Sign in'}
        </button>
      </div>
    </nav>
  );
};
