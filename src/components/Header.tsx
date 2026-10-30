'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  PackageCheck,
  Tag,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { headerConfig, cartCount, wishlist, setShowCartDrawer } = useStore();
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
    { label: 'Our Story', href: '/about' },
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
    <header className="w-full sticky top-0 z-40 bg-[#FCFBF7]/95 backdrop-blur-md border-b border-[#E2D2B0]/60 shadow-xs transition-all duration-200">
      {/* SINGLE LINE HEADER (NO 2-LINES!) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-botanical-900 hover:bg-sandal-200/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-botanical-800 text-sandal-300 flex items-center justify-center shadow-sm border border-sandal-500/40 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-sandal-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-[0.16em] text-botanical-950 group-hover:text-botanical-700 transition-colors">
                  {headerConfig.logoTitle || "HÀRPUDHA'S"}
                </span>
                <span className="text-[9px] font-sans tracking-[0.24em] text-sandal-700 uppercase font-semibold">
                  {headerConfig.logoSubtitle || 'TRADITIONAL SIDDHA CARE'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'text-botanical-950 font-bold'
                      : 'text-botanical-800/80 hover:text-botanical-950 hover:bg-sandal-200/40 rounded-lg'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-botanical-800 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Utilities (Single Row) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Promo Pill Badge */}
            {headerConfig.announcementActive && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <Tag className="w-3 h-3 text-emerald-600" />
                <span className="font-semibold">Code: HARPUDHAS15</span>
              </div>
            )}

            {/* Search Trigger */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-full text-botanical-900 hover:bg-sandal-200/60 transition-colors"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/shop"
              className="relative p-2 rounded-full text-botanical-900 hover:bg-sandal-200/60 transition-colors hidden sm:inline-flex"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative p-2 rounded-full text-botanical-900 hover:bg-sandal-200/60 transition-colors flex items-center gap-1.5"
              title="Shopping Basket"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-botanical-800 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Button */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-botanical-800 text-sandal-200 hover:bg-botanical-900 hover:text-white transition-all shadow-xs"
              title="Store Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sandal-400" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sandal-200 bg-[#FCFBF7] px-4 pt-3 pb-6 space-y-1.5 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-botanical-900 hover:bg-sandal-200/60 transition-colors uppercase tracking-wider"
            >
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 text-sandal-600" />
            </Link>
          ))}
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors uppercase tracking-wider"
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
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-botanical-800 text-sandal-100 hover:bg-botanical-900 transition-colors uppercase tracking-wider mt-2"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sandal-400" />
              Store Admin Panel
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-modal-pop">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-sandal-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-botanical-900">
                Search Siddha Botanicals
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search by hair oil, kumkumadi, shikakai, neem, ubtan..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-2 focus:ring-botanical-700"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="mt-3 w-full py-2.5 rounded-xl bg-botanical-800 text-white font-bold text-xs hover:bg-botanical-900 transition-colors uppercase tracking-wider"
              >
                Find Products
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
