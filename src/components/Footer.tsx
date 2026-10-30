'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  Leaf,
  Award,
  Truck,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { footerConfig, headerConfig } = useStore();

  return (
    <footer className="w-full bg-botanical-900 text-sandal-100 pt-16 pb-12 border-t border-botanical-800">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-botanical-800/80 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-4 rounded-xl bg-botanical-800/40 border border-botanical-700/30">
            <Leaf className="w-6 h-6 text-emerald-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">100% Herbal Siddha</h4>
            <p className="text-xs text-sandal-200/70 mt-1">Zero sulfates, zero parabens</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-botanical-800/40 border border-botanical-700/30">
            <Award className="w-6 h-6 text-sandal-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">Bronze Uruli Slow-Cooked</h4>
            <p className="text-xs text-sandal-200/70 mt-1">Ancestral artisan extraction</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-botanical-800/40 border border-botanical-700/30">
            <Truck className="w-6 h-6 text-emerald-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">Express Delivery</h4>
            <p className="text-xs text-sandal-200/70 mt-1">Free over ₹{headerConfig.freeShippingThreshold}</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-botanical-800/40 border border-botanical-700/30">
            <Shield className="w-6 h-6 text-sandal-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">Lab Batch Certified</h4>
            <p className="text-xs text-sandal-200/70 mt-1">Quality tested in Western Ghats</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sandal-500 text-botanical-900 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-botanical-900" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-widest text-white">
                {headerConfig.logoTitle || "HÀRPUDHA'S"}
              </span>
            </Link>
            <p className="text-sm text-sandal-200/80 leading-relaxed pr-6">
              {footerConfig.brandDescription}
            </p>
            <div className="pt-2 flex items-center gap-3">
              {footerConfig.whatsapp && (
                <a
                  href={`https://wa.me/${footerConfig.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/20 text-emerald-300 text-xs hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sandal-500/15 text-sandal-300 text-xs hover:bg-sandal-500/25 border border-sandal-400/30 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sandal-400" />
                <span>Store Admin Portal</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-sandal-300 uppercase">
              Herbal Collections
            </h4>
            <ul className="space-y-2 text-sm text-sandal-200/80">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Herbal Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Hair Care" className="hover:text-white transition-colors">
                  Hair Care & Oils
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Face Care" className="hover:text-white transition-colors">
                  Face Care & Saffron
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Skin & Body" className="hover:text-white transition-colors">
                  Skin & Nalangu Maavu
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-sandal-300 uppercase">
              Customer Support
            </h4>
            <ul className="space-y-2 text-sm text-sandal-200/80">
              <li>
                <Link href="/orders" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium">
                  <span>Track Live Order</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Traditional Heritage
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sandal-400" />
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details from Admin */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-sandal-300 uppercase">
              Herbal Facility
            </h4>
            <ul className="space-y-2.5 text-xs text-sandal-200/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sandal-400 flex-shrink-0 mt-0.5" />
                <span>{footerConfig.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sandal-400 flex-shrink-0" />
                <span>{footerConfig.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sandal-400 flex-shrink-0" />
                <span>{footerConfig.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-botanical-800 text-xs text-sandal-300/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{footerConfig.copyrightText}</p>
          <div className="flex items-center gap-6">
            <Link href="/orders" className="hover:text-sandal-200">
              Order Tracking
            </Link>
            <Link href="/admin" className="hover:text-sandal-200 font-medium text-sandal-400">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
