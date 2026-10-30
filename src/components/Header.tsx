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
} from 'lucide-react';

export const Header: React.FC = () => {
  const { headerConfig, cartCount, wishlist, setShowCartDrawer } = useStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Products', href: '/shop' },
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
    <header className="w-full sticky top-0 z-40 bg-sandal-50/95 backdrop-blur-md border-b border-sandal-200/60 shadow-xs transition-all">
      {/* Top Announcement Bar - Dynamically Controlled from Admin */}
      {headerConfig.announcementActive && (
        <div className="bg-botanical-800 text-sandal-100 text-xs py-2 px-4 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-medium tracking-wide truncate">
                {headerConfig.announcementText}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs text-sandal-200/80">
              {headerConfig.phone && (
                <a
                  href={`tel:${headerConfig.phone}`}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>{headerConfig.phone}</span>
                </a>
              )}
              {headerConfig.whatsapp && (
                <a
                  href={`https://wa.me/${headerConfig.whatsapp.replace(/\D/g, '')}?text=Hello%20Harpudhas%20Store`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors text-emerald-300"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp Care</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-botanical-800 hover:bg-sandal-100 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo - Dynamically Controlled from Admin */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-botanical-800 text-sandal-300 flex items-center justify-center shadow-md border border-sandal-500/40 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-sandal-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-widest text-botanical-900 group-hover:text-botanical-700 transition-colors">
                  {headerConfig.logoTitle || "HÀRPUDHA'S"}
                </span>
                <span className="text-[9px] font-sans tracking-[0.22em] text-sandal-700 uppercase font-semibold">
                  {headerConfig.logoSubtitle || 'TRADITIONAL SIDDHA CARE'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'text-botanical-900 font-semibold bg-sandal-200/50'
                      : 'text-botanical-700 hover:text-botanical-950 hover:bg-sandal-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Admin Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-full text-botanical-800 hover:bg-sandal-100 hover:text-botanical-950 transition-colors"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/shop"
              className="relative p-2 rounded-full text-botanical-800 hover:bg-sandal-100 transition-colors hidden sm:inline-flex"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative p-2 rounded-full text-botanical-800 hover:bg-sandal-100 transition-colors flex items-center gap-1.5"
              title="View Cart Drawer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-botanical-700 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* ADMIN PANEL BUTTON - Highlighted for Store Owners */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-botanical-800 text-sandal-200 hover:bg-botanical-900 hover:text-white transition-all shadow-sm border border-sandal-600/30"
              title="Manage Products, Orders & Content"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sandal-500" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sandal-200 bg-sandal-50 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-botanical-900 hover:bg-sandal-200/60 transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-sandal-500" />
              </Link>
            ))}
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-botanical-900 hover:bg-sandal-200/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-botanical-700" />
                Track My Order
              </span>
              <ChevronRight className="w-4 h-4 text-sandal-500" />
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold bg-botanical-800 text-sandal-100 hover:bg-botanical-900 transition-colors mt-2"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sandal-500" />
                Admin Dashboard (Full Control)
              </span>
              <ChevronRight className="w-4 h-4 text-sandal-500" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-modal-pop">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-sandal-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-botanical-900">
                Search Herbal Formulations
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search by hair oil, kumkumadi, shikakai, neem..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-xl border border-sandal-300 focus:outline-none focus:ring-2 focus:ring-botanical-600 focus:border-transparent text-sm"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="mt-3 w-full py-2.5 rounded-xl bg-botanical-800 text-white font-medium text-sm hover:bg-botanical-900 transition-colors"
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
