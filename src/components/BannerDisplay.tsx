'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { BannerTargetPage } from '@/types/store';
import { Sparkles, ArrowRight, Copy, Check, Tag } from 'lucide-react';

interface BannerDisplayProps {
  page: BannerTargetPage;
}

export const BannerDisplay: React.FC<BannerDisplayProps> = ({ page }) => {
  const { banners, triggerToast } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter banners that are active and target this page (or 'all')
  const activeBanners = banners.filter(
    (b) => b.isActive && (b.targetPage === 'all' || b.targetPage === page)
  );

  if (activeBanners.length === 0) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    triggerToast(`Promo code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="w-full space-y-3 my-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {activeBanners.map((banner) => (
        <div
          key={banner.id}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.bgGradient || 'from-emerald-900 to-teal-900'} text-white shadow-xl p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl border border-white/10`}
        >
          {/* Subtle floral or decorative background glows */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-36 h-36 rounded-full bg-sandal-500/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sandal-500 text-botanical-900 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  {banner.badge}
                </span>

                {banner.discountCode && (
                  <button
                    onClick={() => handleCopyCode(banner.discountCode!)}
                    title="Click to copy coupon code"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-white/15 hover:bg-white/25 border border-white/20 transition-colors"
                  >
                    <Tag className="w-3 h-3 text-sandal-300" />
                    <span>{banner.discountCode}</span>
                    {copiedCode === banner.discountCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-white/70" />
                    )}
                  </button>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                {banner.title}
              </h3>
              <p className="text-sm sm:text-base text-sandal-100/90 leading-relaxed">
                {banner.subtitle}
              </p>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3 w-full md:w-auto">
              <Link
                href={banner.buttonLink || '/shop'}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-botanical-900 font-medium text-sm hover:bg-sandal-100 hover:text-botanical-950 transition-all duration-200 shadow-md group"
              >
                <span>{banner.buttonText || 'Claim Offer'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-botanical-700" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
