'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ChevronRight,
  PackageCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { cartCount, wishlist, setShowCartDrawer } = useStore();
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
      {/* SINGLE CLEAN LINE HEADER */}
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

          {/* Official Brand Logo Image */}
          <div className="flex-shrink-0 flex items-center py-1">
            <Link href="/" className="group flex items-center" aria-label="Hàrpudha's Home">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden shadow-md border-2 border-amber-600/50 bg-black group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image
                  src={withBasePath('/images/logo.png')}
                  alt="Hàrpudha's Logo"
                  fill
                  className="object-cover"
                  priority
                />
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

          {/* Right Action Utilities (Search, Wishlist, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2.5 rounded-full text-botanical-900 hover:bg-sandal-200/60 transition-colors"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/shop"
              className="relative p-2.5 rounded-full text-botanical-900 hover:bg-sandal-200/60 transition-colors hidden sm:inline-flex"
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
              className="relative p-2.5 rounded-full text-botanical-900 hover:bg-sandal-200/60 transition-colors flex items-center gap-1.5"
              title="Shopping Basket"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-botanical-800 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
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
