'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { productHref } from '@/lib/storeUtils';
import { ShoppingBag, Heart, Search, Menu, X, ChevronRight, PackageCheck, Phone, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { cartCount, wishlist, setShowCartDrawer, headerConfig, siteSettings, products, currentVisitor, signIn, signOut } = useStore();
  const [showAccount, setShowAccount] = useState(false);
  const [acct, setAcct] = useState({ fullName: '', phone: '', email: '' });
  const signedIn = !!currentVisitor?.signedIn && !!currentVisitor.phone;
  const acctValid = acct.fullName.trim().length > 1 && acct.phone.replace(/\D/g, '').length === 10;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop All', href: '/shop' },
    { label: 'Hair', href: '/shop?category=Hair Care' },
    { label: 'Face', href: '/shop?category=Face Care' },
    { label: 'Body', href: '/shop?category=Skin & Body' },
    { label: 'Our Story', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const suggestions = quickSearch.trim()
    ? products
        .filter((p) => p.isVisible !== false)
        .filter((p) =>
          `${p.name} ${p.tamilName} ${p.ingredients.join(' ')}`.toLowerCase().includes(quickSearch.trim().toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/shop?q=${encodeURIComponent(quickSearch.trim())}`);
      setShowSearchModal(false);
    }
  };

  const showAnnouncement =
    siteSettings.sections.announcementBar && headerConfig.announcementActive && headerConfig.announcementText;

  return (
    <>
      {showAnnouncement && (
        <div className="w-full bg-botanical-900 text-sandal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4 text-[11px] sm:text-xs">
            <p className="flex-1 truncate text-center sm:text-left tracking-wide">{headerConfig.announcementText}</p>
            {headerConfig.phone && (
              <a href={`tel:${headerConfig.phone.replace(/\s/g, '')}`} className="hidden md:flex items-center gap-1.5 text-sandal-300 hover:text-white">
                <Phone className="w-3 h-3" />
                {headerConfig.phone}
              </a>
            )}
          </div>
        </div>
      )}

      <header
        className={`w-full sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-sandal-50/90 backdrop-blur-xl shadow-[0_1px_0_rgba(200,157,84,0.25),0_8px_24px_-12px_rgba(19,42,31,0.15)]' : 'bg-sandal-50 border-b border-sandal-200/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-4 transition-all ${scrolled ? 'h-16' : 'h-20'}`}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-botanical-900 hover:bg-sandal-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Hàrpudha's Home">
              <div className={`relative rounded-full overflow-hidden ring-2 ring-sandal-500/50 bg-black transition-all ${scrolled ? 'h-11 w-11' : 'h-14 w-14'}`}>
                <Image src={withBasePath('/images/logo.png')} alt="Hàrpudha's" fill className="object-cover" priority />
              </div>
              <div className="hidden xl:block leading-tight">
                <span className="block font-serif text-xl font-bold tracking-[0.18em] text-botanical-900">
                  {headerConfig.logoTitle}
                </span>
                <span className="block text-[9px] tracking-[0.22em] text-sandal-700 font-semibold">{headerConfig.logoSubtitle}</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const base = link.href.split('?')[0];
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(base) && !link.href.includes('?');
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative px-3.5 py-2 text-[13px] font-medium tracking-wide rounded-full transition-colors ${
                      isActive ? 'text-botanical-900 bg-sandal-100' : 'text-botanical-800/75 hover:text-botanical-900 hover:bg-sandal-100/70'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => setShowSearchModal(true)} className="p-2.5 rounded-full text-botanical-900 hover:bg-sandal-100" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAccount(true)}
                className="flex items-center gap-2 p-2.5 sm:pr-3 rounded-full text-botanical-900 hover:bg-sandal-100"
                aria-label="Account"
              >
                {signedIn ? (
                  <span className="w-6 h-6 rounded-full bg-sandal-500 text-botanical-950 text-[11px] font-bold flex items-center justify-center">
                    {currentVisitor!.fullName?.[0]?.toUpperCase()}
                  </span>
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="hidden xl:inline text-[13px] font-medium">{signedIn ? currentVisitor!.fullName?.split(' ')[0] : 'Sign in'}</span>
              </button>
              <Link href="/orders" className="hidden sm:inline-flex p-2.5 rounded-full text-botanical-900 hover:bg-sandal-100" title="Track order">
                <PackageCheck className="w-5 h-5" />
              </Link>
              <Link href="/shop" className="relative hidden sm:inline-flex p-2.5 rounded-full text-botanical-900 hover:bg-sandal-100" title="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setShowCartDrawer(true)}
                className="relative ml-1 flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-botanical-800 text-white hover:bg-botanical-900 transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-semibold tabular-nums">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-sandal-200 bg-sandal-50 px-4 pt-3 pb-6 space-y-1 animate-fadeIn">
            {[...navLinks, { label: 'Track Order', href: '/orders' }].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-botanical-900 hover:bg-sandal-100"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-sandal-600" />
              </Link>
            ))}
          </div>
        )}
      </header>

      {showAccount && (
        <div className="fixed inset-0 z-50 bg-botanical-950/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={() => setShowAccount(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-2xl font-serif font-semibold text-botanical-900">{signedIn ? `Hi, ${currentVisitor!.fullName?.split(' ')[0]}` : 'Sign in'}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {signedIn ? `Signed in with +91 ${currentVisitor!.phone}` : 'Faster checkout, order tracking & member offers.'}
                </p>
              </div>
              <button onClick={() => setShowAccount(false)} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {signedIn ? (
              <div className="space-y-2">
                <Link
                  href="/orders"
                  onClick={() => setShowAccount(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-sandal-50 hover:bg-sandal-100 text-sm font-medium text-botanical-900"
                >
                  My orders <ChevronRight className="w-4 h-4 text-sandal-600" />
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setShowAccount(false);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-sandal-200 text-sm text-gray-600 hover:bg-sandal-50 text-left"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!acctValid) return;
                  signIn(acct);
                  setShowAccount(false);
                }}
              >
                <input
                  autoFocus
                  required
                  placeholder="Full name"
                  value={acct.fullName}
                  onChange={(e) => setAcct({ ...acct, fullName: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl border border-sandal-300 text-sm focus:outline-none focus:ring-4 focus:ring-botanical-700/10 focus:border-botanical-700"
                />
                <div className="flex">
                  <span className="h-12 px-3.5 flex items-center rounded-l-2xl border border-r-0 border-sandal-300 bg-sandal-50 text-sm text-gray-500">+91</span>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Mobile number"
                    value={acct.phone}
                    onChange={(e) => setAcct({ ...acct, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 min-w-0 h-12 px-4 rounded-r-2xl border border-sandal-300 text-sm focus:outline-none focus:ring-4 focus:ring-botanical-700/10 focus:border-botanical-700"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={acct.email}
                  onChange={(e) => setAcct({ ...acct, email: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl border border-sandal-300 text-sm focus:outline-none focus:ring-4 focus:ring-botanical-700/10 focus:border-botanical-700"
                />
                <button
                  type="submit"
                  disabled={!acctValid}
                  className="w-full h-12 rounded-2xl bg-botanical-800 text-white text-sm font-semibold hover:bg-botanical-900 disabled:opacity-40"
                >
                  Continue
                </button>
                <p className="text-[11px] text-gray-400 text-center">We use your number for order updates and offers on WhatsApp.</p>
              </form>
            )}
          </div>
        </div>
      )}

      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 bg-botanical-950/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-botanical-900">Search the apothecary</h3>
              <button onClick={() => setShowSearchModal(false)} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                placeholder="Hair oil, kumkumadi, shikakai, neem…"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-sandal-300 text-sm focus:outline-none focus:ring-4 focus:ring-botanical-700/10 focus:border-botanical-700"
              />
            </form>
            {suggestions.length > 0 && (
              <div className="mt-3 divide-y divide-sandal-100">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    href={productHref(p.id)}
                    onClick={() => setShowSearchModal(false)}
                    className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-sandal-50"
                  >
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-sandal-100 shrink-0">
                      <Image src={withBasePath(p.image)} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-botanical-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-500">{p.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-botanical-900">₹{p.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
