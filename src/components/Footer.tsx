'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { MapPin, Phone, Mail, MessageCircle, Shield, Leaf, Award, Truck, ArrowUpRight, ChevronDown, ExternalLink } from 'lucide-react';

const SHOP_LINKS = [
  { label: 'All herbal products', href: '/shop' },
  { label: 'Hair care & oils', href: '/shop?category=Hair Care' },
  { label: 'Face care & saffron', href: '/shop?category=Face Care' },
  { label: 'Skin & body rituals', href: '/shop?category=Skin & Body' },
];

const HELP_LINKS = [
  { label: 'Track your order', href: '/orders' },
  { label: 'Contact & support', href: '/contact' },
  { label: 'Our heritage', href: '/about' },
  { label: 'Your cart', href: '/cart' },
];

export const Footer: React.FC = () => {
  const { footerConfig, headerConfig } = useStore();
  const wa = footerConfig.whatsapp.replace(/\D/g, '');
  const tel = footerConfig.phone.replace(/\s/g, '');
  const socials = [
    { label: 'Instagram', href: footerConfig.instagram },
    { label: 'Facebook', href: footerConfig.facebook },
    { label: 'YouTube', href: footerConfig.youtube },
  ].filter((s) => s.href);

  const trust = [
    { icon: Leaf, title: '100% Herbal', sub: 'No sulfates or parabens' },
    { icon: Award, title: 'Uruli slow-cooked', sub: 'Ancestral extraction' },
    { icon: Truck, title: 'Free delivery', sub: `Above ₹${headerConfig.freeShippingThreshold}` },
    { icon: Shield, title: 'Lab certified', sub: 'Every batch tested' },
  ];

  const Brand = (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-sandal-500/50 bg-black shrink-0">
        <Image src={withBasePath('/images/logo.png')} alt="" fill className="object-cover" />
      </span>
      <span className="leading-tight text-left">
        <span className="block font-serif text-2xl font-bold tracking-[0.14em] text-white">{headerConfig.logoTitle || "HÀRPUDHA'S"}</span>
        <span className="block text-[9px] tracking-[0.2em] text-sandal-400 font-semibold">{headerConfig.logoSubtitle}</span>
      </span>
    </Link>
  );

  return (
    <footer className="w-full bg-botanical-900 text-sandal-100 border-t border-botanical-800">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 py-6 sm:py-8">
          {trust.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px] text-sandal-400" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] sm:text-sm font-semibold text-white leading-tight">{title}</span>
                <span className="block text-[11px] sm:text-xs text-sandal-200/60 truncate">{sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Phones ---------- */}
      <div className="lg:hidden px-4 pt-8 pb-6">
        <div className="text-center">
          {Brand}
          <p className="mt-4 text-[13px] text-sandal-200/70 leading-relaxed line-clamp-3 max-w-sm mx-auto">{footerConfig.brandDescription}</p>
        </div>

        {/* One-tap contact */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          {footerConfig.phone && (
            <a href={`tel:${tel}`} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/[0.06] border border-white/10 active:bg-white/10">
              <Phone className="w-5 h-5 text-sandal-400" />
              <span className="text-xs font-medium text-white">Call</span>
            </a>
          )}
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-sandal-500 text-botanical-950 active:bg-sandal-400">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-semibold">WhatsApp</span>
            </a>
          )}
          {footerConfig.email && (
            <a href={`mailto:${footerConfig.email}`} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/[0.06] border border-white/10 active:bg-white/10">
              <Mail className="w-5 h-5 text-sandal-400" />
              <span className="text-xs font-medium text-white">Email</span>
            </a>
          )}
        </div>

        {/* Tap-to-open sections */}
        <div className="mt-6 border-t border-white/10">
          {[
            { title: 'Shop', links: SHOP_LINKS },
            { title: 'Help & support', links: HELP_LINKS },
          ].map((g) => (
            <details key={g.title} className="group border-b border-white/10">
              <summary className="flex items-center justify-between py-4 cursor-pointer list-none text-[15px] font-medium text-white [&::-webkit-details-marker]:hidden">
                {g.title}
                <ChevronDown className="w-4 h-4 text-sandal-400 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="pb-4 -mt-1 space-y-1">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="block py-2 text-sm text-sandal-200/75 active:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <details className="group border-b border-white/10">
            <summary className="flex items-center justify-between py-4 cursor-pointer list-none text-[15px] font-medium text-white [&::-webkit-details-marker]:hidden">
              Visit us
              <ChevronDown className="w-4 h-4 text-sandal-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="pb-4 -mt-1 space-y-3 text-sm text-sandal-200/75">
              <p className="flex gap-2.5">
                <MapPin className="w-4 h-4 text-sandal-400 shrink-0 mt-0.5" />
                <span>{footerConfig.address}</span>
              </p>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(footerConfig.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sandal-400 font-medium"
              >
                Open in Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </details>
        </div>

        {socials.length > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 rounded-full border border-white/15 text-xs font-medium text-sandal-100 flex items-center active:bg-white/10"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
          <p className="text-[11px] text-sandal-300/50 leading-relaxed">{footerConfig.copyrightText}</p>
          <Link href="/admin" className="inline-block text-[11px] text-sandal-300/30">
            Admin
          </Link>
        </div>
      </div>

      {/* ---------- Tablet / desktop ---------- */}
      <div className="hidden lg:block max-w-7xl mx-auto px-8 pt-14 pb-10">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-4 space-y-5">
            {Brand}
            <p className="text-sm text-sandal-200/75 leading-relaxed pr-6">{footerConfig.brandDescription}</p>
            <div className="flex flex-wrap gap-2">
              {wa && (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-sandal-500 text-botanical-950 text-sm font-semibold hover:bg-sandal-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              )}
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center h-10 px-4 rounded-full border border-white/15 text-sm text-sandal-100 hover:bg-white/10 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <h4 className="text-[11px] font-semibold tracking-[0.2em] text-sandal-400 uppercase">Shop</h4>
            <ul className="space-y-2.5 text-sm text-sandal-200/75">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 space-y-4">
            <h4 className="text-[11px] font-semibold tracking-[0.2em] text-sandal-400 uppercase">Help</h4>
            <ul className="space-y-2.5 text-sm text-sandal-200/75">
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors inline-flex items-center gap-1">
                    {l.label}
                    {l.href === '/orders' && <ArrowUpRight className="w-3.5 h-3.5 text-sandal-400" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4 space-y-4">
            <h4 className="text-[11px] font-semibold tracking-[0.2em] text-sandal-400 uppercase">Visit & contact</h4>
            <ul className="space-y-3 text-sm text-sandal-200/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sandal-400 shrink-0 mt-0.5" />
                <span>{footerConfig.address}</span>
              </li>
              {footerConfig.phone && (
                <li>
                  <a href={`tel:${tel}`} className="flex items-center gap-2.5 hover:text-white">
                    <Phone className="w-4 h-4 text-sandal-400 shrink-0" />
                    {footerConfig.phone}
                  </a>
                </li>
              )}
              {footerConfig.email && (
                <li>
                  <a href={`mailto:${footerConfig.email}`} className="flex items-center gap-2.5 hover:text-white">
                    <Mail className="w-4 h-4 text-sandal-400 shrink-0" />
                    {footerConfig.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-sandal-300/50 flex items-center justify-between gap-4">
          <p>{footerConfig.copyrightText}</p>
          <div className="flex items-center gap-6">
            <Link href="/orders" className="hover:text-sandal-200">
              Order tracking
            </Link>
            <Link href="/contact" className="hover:text-sandal-200">
              Contact
            </Link>
            <Link href="/admin" className="hover:text-sandal-200">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
