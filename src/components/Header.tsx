'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  ShoppingBag,
  Heart,
  Phone,
  MessageCircle,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Search,
  PackageCheck,
  ChevronRight,
  ArrowRight,
  Leaf,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { headerConfig, cartCount, cartTotals, wishlist, setShowCartDrawer } = useStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Catalog', href: '/shop' },
    { label: 'Hair Care', href: '/shop?category=Hair Care' },
    { label: 'Face Care', href: '/shop?category=Face Care' },
    { label: 'Skin & Body', href: '/shop?category=Skin & Body' },
    { label: 'Track Order', href: '/orders' },
    { label: 'Heritage', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(quickSearch.trim())}`;
      setShowSearchModal(false);
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 transition-all duration-300">
      {/* 1. TOP ANNOUNCEMENT TICKER (Controlled from Admin) */}
      {headerConfig.announcementActive && (
        <div className="bg-[#0A1610] text-sandal-200 text-xs py-2 px-4 border-b border-sandal-500/15">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
            <div className="flex items-center gap-2 overflow-hidden mx-auto sm:mx-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium tracking-wider text-sandal-100 text-[11px] sm:text-xs">
                {headerConfig.announcementText}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs">
              {headerConfig.phone && (
                <a
                  href={`tel:${headerConfig.phone}`}
                  className="flex items-center gap-1.5 text-sandal-300/80 hover:text-sandal-200 transition-colors"
                >
                  <Phone className="w-3 h-3 text-sandal-400" />
                  <span className="tracking-wide">{headerConfig.phone}</span>
                </a>
              )}
              {headerConfig.whatsapp && (
                <a
                  href={`https://wa.me/${headerConfig.whatsapp.replace(/\D/g, '')}?text=Hello%20Harpudhas%20Store`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp Care</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN REGAL NAVBAR */}
      <div className="bg-[#0E2018]/95 backdrop-blur-md border-b border-[#C89D54]/25 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Mobile Menu Trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-sandal-200 hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* BRAND LOGO - High-End Luxury Emblem */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-botanical-700 via-botanical-800 to-botanical-950 text-sandal-300 flex items-center justify-center shadow-lg border border-[#C89D54]/50 group-hover:scale-105 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 text-sandal-400 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold tracking-[0.18em] text-white group-hover:text-sandal-300 transition-colors">
                    {headerConfig.logoTitle || "HÀRPUDHA'S"}
                  </span>
                  <span className="text-[9px] font-sans tracking-[0.28em] text-sandal-400/90 uppercase font-semibold">
                    {headerConfig.logoSubtitle || 'TRADITIONAL SIDDHA & BOTANICAL SKINCARE'}
                  </span>
                </div>
              </Link>
            </div>

            {/* DESKTOP NAV - Elegant Typography with Gold Active Indicators */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative px-3.5 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                      isActive
                        ? 'text-sandal-300 font-bold'
                        : 'text-sandal-100/80 hover:text-white hover:bg-white/5 rounded-lg'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0.5 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-sandal-400 to-amber-300 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT ICONS & ADMIN PORTAL BUTTON */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2.5 rounded-full text-sandal-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Search formulations"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/shop"
                className="relative p-2.5 rounded-full text-sandal-200 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex"
                title="Saved Items"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setShowCartDrawer(true)}
                className="relative p-2.5 rounded-full text-sandal-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                title="View Herbal Basket"
              >
                <ShoppingBag className="w-4 h-4 text-sandal-300" />
                {cartCount > 0 && (
                  <span className="w-5 h-5 bg-sandal-500 text-botanical-950 text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* ADMIN PANEL ACCESS BUTTON */}
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sandal-500/15 hover:bg-sandal-500/25 text-sandal-300 hover:text-white border border-[#C89D54]/50 transition-all shadow-sm"
                title="Admin Control Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sandal-400" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0A1610] px-4 pt-3 pb-6 space-y-1.5 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-sandal-100 hover:bg-white/10 transition-colors uppercase tracking-wider"
            >
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 text-sandal-400" />
            </Link>
          ))}
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-white/10 transition-colors uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4" />
              Track Live Order
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sandal-500/20 text-sandal-300 border border-sandal-500/40 hover:bg-sandal-500/30 transition-colors uppercase tracking-wider mt-2"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sandal-400" />
              Admin Portal (Manage Store)
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* SEARCH MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-modal-pop">
          <div className="bg-[#0E2018] rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-[#C89D54]/40 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-sandal-200 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Search Authentic Formulations</span>
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search hair oil, kumkumadi, shikakai, neem, ubtan..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-xl bg-[#08130E] border border-sandal-500/40 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sandal-500"
              />
              <Search className="w-4 h-4 text-sandal-400 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="mt-3 w-full py-2.5 rounded-xl bg-sandal-500 text-botanical-950 font-bold text-xs hover:bg-sandal-400 transition-colors uppercase tracking-wider"
              >
                Find Herbal Remedy
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
