'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { productsFor, resolveHomeSection } from '@/lib/storeUtils';
import { CategoryType } from '@/types/store';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Leaf,
  ChevronDown,
  Award,
  Truck,
  Tag,
  Plus,
} from 'lucide-react';

const SectionHeading: React.FC<{ eyebrow?: string; title: string; subtitle?: string; align?: 'center' | 'left'; dark?: boolean }> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  dark,
}) => (
  <div className={`${align === 'center' ? 'text-center mx-auto' : ''} max-w-2xl`}>
    {eyebrow && (
      <span className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] font-semibold ${dark ? 'text-sandal-300' : 'text-sandal-700'}`}>
        <span className={`h-px w-6 ${dark ? 'bg-sandal-400/60' : 'bg-sandal-500/60'}`} />
        {eyebrow}
        {align === 'center' && <span className={`h-px w-6 ${dark ? 'bg-sandal-400/60' : 'bg-sandal-500/60'}`} />}
      </span>
    )}
    <h2 className={`mt-2 sm:mt-3 text-[28px] sm:text-[42px] leading-[1.1] font-serif font-semibold ${dark ? 'text-white' : 'text-botanical-900'}`}>{title}</h2>
    {subtitle && <p className={`mt-2 sm:mt-3 text-sm sm:text-[15px] leading-relaxed ${dark ? 'text-sandal-100/75' : 'text-gray-600'}`}>{subtitle}</p>}
  </div>
);

export default function HomePage() {
  const { products, orders, addToCart, banners, pageContents, siteSettings } = useStore();
  const home = pageContents.home;
  const show = siteSettings.sections;

  const activeBanners = banners.filter((b) => b.isActive && (b.targetPage === 'all' || b.targetPage === 'home'));
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length), 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  useEffect(() => {
    if (currentSlide >= activeBanners.length) setCurrentSlide(0);
  }, [activeBanners.length, currentSlide]);

  const touchX = useRef<number | null>(null);
  const go = (dir: 1 | -1) =>
    activeBanners.length && setCurrentSlide((prev) => (prev + dir + activeBanners.length) % activeBanners.length);

  const [quizArea, setQuizArea] = useState<CategoryType>('Hair Care');
  const [quizConcern, setQuizConcern] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const hp = siteSettings.homeProducts;
  const featuredProducts = resolveHomeSection(products, orders, 'home-featured', hp['home-featured']);
  const newProducts = resolveHomeSection(products, orders, 'home-new', hp['home-new']);
  const quizRecommendations = resolveHomeSection(products, orders, 'home-quiz', hp['home-quiz'], quizArea);
  const shopCount = productsFor(products, 'shop').length;
  const gridCols = (n: 3 | 4) => (n === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3');

  const categories = [
    { title: 'Hair Care & Oils', tamil: 'கூந்தல் பராமரிப்பு', image: '/images/hair-oil.jpg', href: '/shop?category=Hair Care', cat: 'Hair Care' },
    { title: 'Face Care & Radiance', tamil: 'முகப்பொலிவு', image: '/images/face-cream.jpg', href: '/shop?category=Face Care', cat: 'Face Care' },
    { title: 'Skin & Body Rituals', tamil: 'உடல் பாதுகாப்பு', image: '/images/body-soap.jpg', href: '/shop?category=Skin & Body', cat: 'Skin & Body' },
  ];

  const concerns: Record<CategoryType, string[]> = {
    'Hair Care': ['Hair fall & root strength', 'Premature greying', 'Dandruff & itchy scalp'],
    'Face Care': ['Pigmentation & glow', 'Acne & oil control', 'Hydration & fine lines'],
    'Skin & Body': ['Tan removal', 'Dry skin moisture', 'Traditional herbal bath'],
  };

  const usps = [
    { icon: Leaf, title: home.usp1Title, desc: home.usp1Desc },
    { icon: Award, title: home.usp2Title, desc: home.usp2Desc },
    { icon: Truck, title: home.usp3Title, desc: home.usp3Desc },
    { icon: ShieldCheck, title: home.usp4Title, desc: home.usp4Desc },
  ];

  const steps = [
    { title: home.step1Title, desc: home.step1Desc },
    { title: home.step2Title, desc: home.step2Desc },
    { title: home.step3Title, desc: home.step3Desc },
    { title: home.step4Title, desc: home.step4Desc },
  ];

  const faqs = [
    { q: home.faq1Q, a: home.faq1A },
    { q: home.faq2Q, a: home.faq2A },
    { q: home.faq3Q, a: home.faq3A },
    { q: home.faq4Q, a: home.faq4A },
  ].filter((f) => f.q);

  return (
    <div className="w-full">
      {/* 1. HERO */}
      {show.homeHero && (
        <section className="relative w-full bg-botanical-900 overflow-hidden">
          {activeBanners.length === 0 ? (
            <div className="relative min-h-[480px] sm:min-h-[560px] lg:min-h-[640px] flex items-center">
              <Image src={withBasePath('/images/hero-banner.jpg')} alt="Hàrpudha's" fill priority className="object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-botanical-950 via-botanical-900/80 to-transparent" />
              <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-2xl space-y-6 text-white">
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs tracking-wide bg-white/10 text-sandal-200 border border-white/15 backdrop-blur">
                    {home.heroBadge}
                  </span>
                  <h1 className="text-[32px] sm:text-6xl font-serif font-semibold leading-[1.05]">{home.heroTitle}</h1>
                  <p className="text-base sm:text-lg text-sandal-100/80 leading-relaxed">{home.heroSubtitle}</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href="/shop" className="btn-shimmer inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-sandal-500 text-botanical-950 font-semibold text-sm hover:bg-sandal-300">
                      <ShoppingBag className="w-4 h-4" />
                      {home.heroBtn1}
                    </Link>
                    {show.homeQuiz && (
                      <a href="#routine-finder" className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full border border-white/25 text-white text-sm font-medium hover:bg-white/10">
                        {home.heroBtn2}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[640px]"
              onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
                touchX.current = null;
              }}
            >
              {activeBanners.map((banner, index) => {
                const isCurrent = index === currentSlide;
                return (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                  >
                    <Image
                      src={withBasePath(banner.imageUrl || '/images/hero-banner.jpg')}
                      alt={banner.title}
                      fill
                      priority={index === 0}
                      className={`object-cover transition-transform duration-[7000ms] ease-out ${isCurrent ? 'scale-105' : 'scale-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-botanical-950/95 via-botanical-950/60 to-botanical-950/10" />
                    <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
                      <div className={`max-w-2xl space-y-4 sm:space-y-6 text-white pt-12 pb-20 sm:py-20 transition-all duration-700 ${isCurrent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          {banner.badge && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] bg-sandal-500 text-botanical-950">
                              <Sparkles className="w-3.5 h-3.5" />
                              {banner.badge}
                            </span>
                          )}
                          {banner.discountCode && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/10 text-sandal-100 border border-white/20 backdrop-blur">
                              <Tag className="w-3 h-3" />
                              {banner.discountCode}
                            </span>
                          )}
                        </div>
                        <h2 className="text-[32px] sm:text-6xl font-serif font-semibold leading-[1.05] tracking-tight">{banner.title}</h2>
                        <p className="text-[15px] sm:text-lg text-sandal-100/80 leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-none">{banner.subtitle}</p>
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <Link
                            href={banner.buttonLink || '/shop'}
                            className="btn-shimmer group inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-sandal-500 text-botanical-950 font-semibold text-sm hover:bg-sandal-300 transition-colors"
                          >
                            {banner.buttonText || 'Shop Collection'}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                          {show.homeQuiz && (
                            <a href="#routine-finder" className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full border border-white/25 text-white text-sm font-medium hover:bg-white/10 backdrop-blur">
                              {home.heroBtn2}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeBanners.length > 1 && (
                <div className="absolute bottom-5 sm:bottom-8 inset-x-0 z-20">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {activeBanners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-10 bg-sandal-400' : 'w-5 bg-white/30 hover:bg-white/60'}`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                      <span className="ml-3 text-xs text-white/60 tabular-nums">
                        {String(currentSlide + 1).padStart(2, '0')} / {String(activeBanners.length).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="hidden sm:flex gap-2">
                      <button onClick={() => go(-1)} className="w-11 h-11 rounded-full border border-white/25 text-white hover:bg-white/10 flex items-center justify-center" aria-label="Previous">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => go(1)} className="w-11 h-11 rounded-full border border-white/25 text-white hover:bg-white/10 flex items-center justify-center" aria-label="Next">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Marquee */}
      {home.marqueeText && (
        <div className="w-full overflow-hidden bg-sandal-500 text-botanical-950 py-2.5">
          <div className="marquee-track text-xs font-semibold tracking-[0.16em] uppercase whitespace-nowrap">
            <span className="px-6">{home.marqueeText}</span>
            <span className="px-6">{home.marqueeText}</span>
          </div>
        </div>
      )}

      {/* 2. USP BAR */}
      {show.homeUsp && (
        <div className="w-full bg-white border-b border-sandal-200/70">
          <div className="max-w-7xl mx-auto lg:px-8 scroll-row lg:grid lg:grid-cols-4 divide-x divide-sandal-200/70">
            {usps.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-3.5 py-4 sm:py-6 px-4 w-[70%] sm:w-[42%] lg:w-auto">
                <div className="w-11 h-11 rounded-full bg-sandal-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-botanical-900">{title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CATEGORIES */}
      {show.homeCategories && (
        <section className="py-12 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={home.catEyebrow} title={home.catTitle} subtitle={home.catSubtitle} />
          <div className="scroll-row gap-3 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-5 mt-8 sm:mt-12">
            {categories.map((cat) => {
              const count = productsFor(products, 'shop').filter((p) => p.category === cat.cat).length;
              return (
                <Link key={cat.title} href={cat.href} className="group relative w-[74%] sm:w-[46%] md:w-auto h-[300px] md:h-[420px] rounded-3xl md:rounded-[28px] overflow-hidden">
                  <Image src={withBasePath(cat.image)} alt={cat.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-botanical-950/90 via-botanical-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                    <span className="text-xs text-sandal-300">{cat.tamil}</span>
                    <h3 className="text-2xl font-serif font-semibold mt-1">{cat.title}</h3>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-white/70">{count} formulations</span>
                      <span className="w-10 h-10 rounded-full bg-white text-botanical-900 flex items-center justify-center group-hover:bg-sandal-500 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. BESTSELLERS */}
      {show.homeFeatured && featuredProducts.length > 0 && (
        <section id="home-featured" className="py-12 sm:py-24 bg-sandal-100/60 border-y border-sandal-200/70 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-7 sm:mb-12">
              <SectionHeading eyebrow={home.prodEyebrow} title={home.prodTitle} subtitle={home.prodSubtitle} align="left" />
              <Link
                href="/shop"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-botanical-800/80 text-botanical-900 text-sm font-medium hover:bg-botanical-800 hover:text-white transition-colors"
              >
                {home.prodBtnText} ({shopCount})
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className={`grid grid-cols-2 gap-3 sm:gap-6 ${gridCols(hp['home-featured'].columns)}`}>
              {featuredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. NEW ARRIVALS */}
      {show.homeNew && newProducts.length > 0 && (
        <section id="home-new" className="py-12 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <SectionHeading eyebrow="Just Launched" title={siteSettings.newSectionTitle} subtitle={siteSettings.newSectionSubtitle} />
          <div className={`scroll-row gap-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:gap-5 mt-8 sm:mt-12 ${gridCols(hp['home-new'].columns)}`}>
            {newProducts.map((prod) => (
              <div key={prod.id} className="w-[46%] sm:w-auto">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. ROUTINE FINDER */}
      {show.homeQuiz && (
        <section id="routine-finder" className="relative py-12 sm:py-24 bg-botanical-900 text-white overflow-hidden scroll-mt-20">
          <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-sandal-500/10 blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-8">
              <SectionHeading eyebrow={home.quizEyebrow} title={home.quizTitle} subtitle={home.quizSubtitle} align="left" dark />
              <div className="space-y-3">
                <p className="text-[11px] text-sandal-300 font-semibold uppercase tracking-[0.2em]">01 · Focus area</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(concerns) as CategoryType[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setQuizArea(cat);
                        setQuizConcern('');
                      }}
                      className={`py-3 rounded-xl text-xs font-semibold transition-all border ${
                        quizArea === cat ? 'bg-sandal-500 text-botanical-950 border-sandal-500' : 'border-white/15 text-sandal-100 hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] text-sandal-300 font-semibold uppercase tracking-[0.2em]">02 · Your concern</p>
                <div className="flex flex-wrap gap-2">
                  {concerns[quizArea].map((c) => (
                    <button
                      key={c}
                      onClick={() => setQuizConcern(c)}
                      className={`px-4 py-2 rounded-full text-xs border transition-colors ${
                        quizConcern === c ? 'bg-white text-botanical-900 border-white' : 'border-white/15 text-sandal-100 hover:bg-white/5'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-[28px] bg-white/[0.04] border border-white/10 p-6 sm:p-8 backdrop-blur">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">Your match</span>
                  <h3 className="text-2xl font-serif font-semibold">{home.quizMatchTitle}</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-sandal-500/15 text-sandal-200 border border-sandal-400/30">
                  {quizConcern || quizArea}
                </span>
              </div>
              {quizRecommendations.length === 0 ? (
                <p className="text-sm text-sandal-100/60 py-10 text-center">No products assigned to the routine finder for {quizArea} yet.</p>
              ) : (
                <div className={`grid grid-cols-1 gap-4 ${quizRecommendations.length > 2 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {quizRecommendations.map((prod) => (
                    <div key={prod.id} className="rounded-2xl bg-botanical-950/50 border border-white/10 overflow-hidden">
                      <div className="relative h-44">
                        <Image src={withBasePath(prod.image)} alt={prod.name} fill className="object-cover" />
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">{prod.badge}</span>
                          <h4 className="text-sm font-semibold line-clamp-1 mt-0.5">{prod.name}</h4>
                          <p className="text-xs text-sandal-100/60 line-clamp-2 mt-1">{prod.shortDesc}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold text-sandal-300">₹{prod.price}</span>
                          <button
                            onClick={() => addToCart(prod.id, 0, 1)}
                            className="px-4 py-2 rounded-full bg-sandal-500 text-botanical-950 font-semibold text-xs hover:bg-sandal-300 flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add to routine
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 7. PROCESS */}
      {show.homeProcess && (
        <section className="py-12 sm:py-24 bg-sandal-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow={home.processEyebrow} title={home.processTitle} subtitle={home.processSubtitle} />
            <div className="scroll-row gap-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 mt-8 sm:mt-14">
              {steps.map((s, i) => (
                <div key={i} className="relative p-6 sm:p-7 w-[78%] sm:w-auto rounded-[24px] bg-white border border-sandal-200/80">
                  <span className="font-serif text-5xl font-semibold text-sandal-300">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-botanical-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. FAQ */}
      {show.homeFaq && faqs.length > 0 && (
        <section className="py-12 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={home.faqEyebrow} title={home.faqTitle} />
          <div className="mt-12 divide-y divide-sandal-200 border-y border-sandal-200">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-4 sm:py-5 text-left flex items-center justify-between gap-4 sm:gap-6 font-serif text-base sm:text-lg font-semibold text-botanical-900"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-sandal-600 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
                  <p className="overflow-hidden text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
