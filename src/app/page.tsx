'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  ShoppingBag,
  Heart,
  Droplets,
  Leaf,
  ChevronDown,
  Clock,
  Award,
  Truck,
  Tag,
} from 'lucide-react';
import { CategoryType } from '@/types/store';

export default function HomePage() {
  const { products, addToCart, wishlist, toggleWishlist, banners, pageContents } = useStore();

  // Active home banners
  const activeBanners = banners.filter(
    (b) => b.isActive && (b.targetPage === 'all' || b.targetPage === 'home')
  );

  // Carousel slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play carousel every 5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const nextSlide = () => {
    if (activeBanners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }
  };

  const prevSlide = () => {
    if (activeBanners.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
  };

  const [quizArea, setQuizArea] = useState<CategoryType>('Hair Care');
  const [quizConcern, setQuizConcern] = useState<string>('growth');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});

  const handleSizeChange = (productId: string, sizeIdx: number) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeIdx }));
  };

  const featuredProducts = products.slice(0, 6);

  const categories = [
    {
      title: 'Hair Care & Oils',
      tamil: 'கூந்தல் பராமரிப்பு',
      desc: 'Cold-pressed Hibiscus, Bhringraj & Shikakai formulas for thickness and root revival.',
      image: '/images/hair-oil.jpg',
      href: '/shop?category=Hair Care',
      tag: 'Bestselling Oils',
    },
    {
      title: 'Face Care & Radiance',
      tamil: 'முகப்பொலிவு சிகிச்சை',
      desc: 'Pure Kashmiri Saffron & Red Sandalwood for radiant, glass-like natural herbal glow.',
      image: '/images/face-cream.jpg',
      href: '/shop?category=Face Care',
      tag: 'Kumkumadi Glow',
    },
    {
      title: 'Skin & Body Rituals',
      tamil: 'உடல் பாதுகாப்பு',
      desc: 'Traditional 18-Herb Nalangu Maavu & Shea bath bars for whole-body rejuvenation.',
      image: '/images/body-soap.jpg',
      href: '/shop?category=Skin & Body',
      tag: 'Ancestral Bath',
    },
  ];

  const quizRecommendations = products.filter((p) => {
    if (quizArea === 'Hair Care') return p.category === 'Hair Care';
    if (quizArea === 'Face Care') return p.category === 'Face Care';
    return p.category === 'Skin & Body';
  }).slice(0, 2);

  const faqs = [
    {
      q: pageContents.home.faq1Q || 'How is Hàrpudha’s hair oil different from regular commercial oils?',
      a: pageContents.home.faq1A || 'Unlike commercial oils that use liquid paraffin and artificial scents, our oils are prepared using 100% pure cold wood-pressed coconut and sesame base, slow-infused for 72 hours in heavy bronze urulis.',
    },
    {
      q: pageContents.home.faq2Q || 'Are your products safe for sensitive and acne-prone skin?',
      a: pageContents.home.faq2A || 'Yes, absolutely. Every formulation is free from parabens, phthalates, synthetic preservatives, and artificial colorants. We use natural herbs like wild turmeric, neem, and pure saffron.',
    },
    {
      q: pageContents.home.faq3Q || 'How long does delivery take across India?',
      a: pageContents.home.faq3A || 'We dispatch all orders within 24 hours of confirmation from our Pollachi apothecary via Delhivery Express or BlueDart. Deliveries to Tamil Nadu take 1-2 days; other states take 2-4 business days.',
    },
    {
      q: pageContents.home.faq4Q || 'Can men and teenagers use these Siddha formulations?',
      a: pageContents.home.faq4A || 'Yes! Traditional Siddha formulations are unisex and suitable for all age groups (above 3 years). Both men and women benefit equally from our hair oils, ubtans, and skin remedies.',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. DYNAMIC AUTO-PLAYING HERO BANNER CAROUSEL */}
      <section className="relative w-full bg-[#11241B] overflow-hidden">
        {activeBanners.length === 0 ? (
          // Default Hero Fallback if no banner active
          <div className="relative min-h-[500px] lg:min-h-[580px] flex items-center justify-center text-center text-white px-4 py-20">
            <Image
              src={withBasePath('/images/hero-banner.jpg')}
              alt="Harpudhas Siddha Botanicals"
              fill
              priority
              className="object-cover opacity-35"
            />
            <div className="relative z-10 max-w-3xl mx-auto space-y-5">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-sandal-500/20 text-sandal-300 border border-sandal-400/30">
                {pageContents.home.heroBadge}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                {pageContents.home.heroTitle}
              </h1>
              <p className="text-base sm:text-lg text-sandal-100/90 leading-relaxed max-w-2xl mx-auto">
                {pageContents.home.heroSubtitle}
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-sandal-500 text-botanical-950 font-bold text-xs uppercase tracking-wider hover:bg-sandal-400 transition-all shadow-xl"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Essentials</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Multi-Image Auto-Playing Slider
          <div className="relative w-full min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-center">
            {activeBanners.map((banner, index) => {
              const isCurrent = index === currentSlide;
              const bannerImg = banner.imageUrl || '/images/hero-banner.jpg';

              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isCurrent ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Real Background Image with Gradient Overlay */}
                  <Image
                    src={withBasePath(bannerImg)}
                    alt={banner.title}
                    fill
                    priority={index === 0}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />

                  {/* Banner Content */}
                  <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
                    <div className="max-w-2xl space-y-5 text-white py-16">
                      <div className="flex flex-wrap items-center gap-2">
                        {banner.badge && (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sandal-500 text-botanical-950 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{banner.badge}</span>
                          </span>
                        )}
                        {banner.discountCode && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/20 text-sandal-200 border border-white/25">
                            <Tag className="w-3 h-3 text-sandal-400" />
                            <span>Use Code: {banner.discountCode}</span>
                          </span>
                        )}
                      </div>

                      <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight tracking-tight">
                        {banner.title}
                      </h2>

                      <p className="text-base sm:text-lg text-sandal-100/90 leading-relaxed font-light max-w-xl">
                        {banner.subtitle}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Link
                          href={banner.buttonLink || '/shop'}
                          className="px-8 py-3.5 rounded-full bg-sandal-500 text-botanical-950 font-bold text-xs uppercase tracking-wider hover:bg-sandal-400 transition-all shadow-xl flex items-center gap-2 group"
                        >
                          <span>{banner.buttonText || 'Shop Collection'}</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <a
                          href="#ayurvedic-quiz"
                          className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider border border-white/25 transition-all backdrop-blur-xs"
                        >
                          Take Dosha Quiz
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slider Navigation Arrows (If more than 1 banner) */}
            {activeBanners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 transition-all shadow-lg focus:outline-none"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 transition-all shadow-lg focus:outline-none"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slider Dot Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? 'w-8 bg-sandal-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* 2. VALUE PROPOSITION BAR */}
      <div className="w-full bg-[#F7F3E8] border-b border-sandal-200/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2.5 p-2">
              <Leaf className="w-5 h-5 text-emerald-800 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold text-botanical-900">{pageContents.home.usp1Title || '100% Herbal Siddha'}</h4>
                <p className="text-[11px] text-gray-500">{pageContents.home.usp1Desc || 'Nil Sulfates, Parabens or Chemicals'}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 p-2">
              <Award className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold text-botanical-900">{pageContents.home.usp2Title || 'Bronze Uruli Alchemy'}</h4>
                <p className="text-[11px] text-gray-500">{pageContents.home.usp2Desc || '72-Hour Traditional Slow-Cooking'}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 p-2">
              <Truck className="w-5 h-5 text-emerald-800 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold text-botanical-900">{pageContents.home.usp3Title || 'Free Express Delivery'}</h4>
                <p className="text-[11px] text-gray-500">{pageContents.home.usp3Desc || 'On all orders above ₹499 in India'}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 p-2">
              <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold text-botanical-900">{pageContents.home.usp4Title || 'Lab Batch Certified'}</h4>
                <p className="text-[11px] text-gray-500">{pageContents.home.usp4Desc || 'Direct From Pollachi Farmstead'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CATEGORIES SECTION (Editable Content via Admin) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-botanical-700 font-bold">
            {pageContents.home.catEyebrow || 'Ancestral Collections'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-botanical-900 mt-1">
            {pageContents.home.catTitle}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {pageContents.home.catSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative overflow-hidden rounded-3xl bg-white border border-sandal-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-64 w-full overflow-hidden bg-sandal-50">
                <Image
                  src={withBasePath(cat.image)}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-106"
                />
                <div className="absolute top-3 right-3 bg-botanical-900/85 backdrop-blur-xs text-sandal-200 text-xs px-3 py-1 rounded-full font-semibold">
                  {cat.tag}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800">{cat.tamil}</span>
                  <h3 className="text-xl font-serif font-bold text-botanical-900 mt-0.5 group-hover:text-botanical-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-sandal-100 flex items-center text-xs font-bold text-botanical-800 group-hover:text-botanical-950">
                  <span>Explore Remedies</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BESTSELLING HERBAL FORMULATIONS */}
      <section className="py-16 bg-[#F7F3E8] border-y border-sandal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-botanical-700 font-bold">
                {pageContents.home.prodEyebrow || 'Community Favorites'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-botanical-900 mt-1">
                {pageContents.home.prodTitle}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {pageContents.home.prodSubtitle}
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-botanical-800 text-botanical-900 text-xs font-bold uppercase tracking-wider hover:bg-botanical-800 hover:text-white transition-colors"
            >
              <span>{pageContents.home.prodBtnText || 'View All'} ({products.length}) Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((prod) => {
              const currentSizeIdx = selectedSizes[prod.id] || 0;
              const currentSize = prod.sizeOptions[currentSizeIdx] || prod.sizeOptions[0];
              const isWishlisted = wishlist.includes(prod.id);

              return (
                <div
                  key={prod.id}
                  className="group bg-white rounded-3xl border border-sandal-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                >
                  {/* Badges & Wishlist */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider bg-botanical-800 text-sandal-100 shadow-xs">
                      {prod.badge}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs text-gray-500 hover:text-rose-500 hover:bg-white shadow-xs transition-colors"
                    title="Save to Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>

                  {/* Product Image */}
                  <Link
                    href={`/product/${prod.id}`}
                    className="relative aspect-square w-full overflow-hidden bg-sandal-50"
                  >
                    <Image
                      src={withBasePath(prod.image)}
                      alt={prod.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-106"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="text-emerald-800 font-bold">{prod.tamilName}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{prod.rating.toFixed(1)}</span>
                          <span className="text-gray-400 font-normal">({prod.reviews})</span>
                        </div>
                      </div>

                      <Link href={`/product/${prod.id}`}>
                        <h3 className="font-serif font-bold text-lg text-botanical-900 group-hover:text-botanical-700 transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {prod.shortDesc}
                      </p>
                    </div>

                    {/* Size Selector */}
                    {prod.sizeOptions && prod.sizeOptions.length > 1 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prod.sizeOptions.map((opt, sIdx) => (
                          <button
                            key={opt.label}
                            onClick={() => handleSizeChange(prod.id, sIdx)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              currentSizeIdx === sIdx
                                ? 'bg-botanical-800 text-white border-botanical-800'
                                : 'bg-sandal-50 text-gray-700 border-sandal-200 hover:border-botanical-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Price & Add to Cart */}
                    <div className="pt-3 border-t border-sandal-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400 line-through">₹{prod.mrp}</div>
                        <div className="text-lg font-bold text-botanical-900">
                          ₹{currentSize?.price || prod.price}
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(prod.id, currentSizeIdx, 1)}
                        className="px-4 py-2.5 rounded-xl bg-botanical-800 text-white text-xs font-bold hover:bg-botanical-900 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE DOSHA QUIZ */}
      <section id="ayurvedic-quiz" className="py-20 bg-botanical-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs uppercase tracking-widest text-sandal-400 font-bold">
                {pageContents.home.quizEyebrow || 'Ancestral Diagnostic'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                {pageContents.home.quizTitle || 'Discover Your Tailored Siddha Routine'}
              </h2>
              <p className="text-sm text-sandal-200/80 leading-relaxed">
                {pageContents.home.quizSubtitle || 'Take 30 seconds to select your primary focus area. Our herbal experts have mapped traditional botanicals to restore natural equilibrium.'}
              </p>

              <div className="space-y-2 pt-2">
                <label className="text-xs text-sandal-300 font-semibold uppercase">1. Focus Area</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Hair Care', 'Face Care', 'Skin & Body'] as CategoryType[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setQuizArea(cat)}
                      className={`p-2.5 rounded-xl text-xs font-semibold transition-all border ${
                        quizArea === cat
                          ? 'bg-sandal-500 text-botanical-950 border-sandal-400 shadow-md'
                          : 'bg-botanical-800/80 text-sandal-100 border-botanical-700 hover:bg-botanical-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs text-sandal-300 font-semibold uppercase">2. Concern</label>
                <div className="flex flex-wrap gap-2">
                  {quizArea === 'Hair Care' && (
                    <>
                      {['Hair Fall & Root Strength', 'Premature Greying & Shine', 'Dandruff & Scalp Itch'].map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => setQuizConcern(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              quizConcern === c
                                ? 'bg-emerald-700 text-white border-emerald-500'
                                : 'bg-botanical-800 text-sandal-200 border-botanical-700 hover:bg-botanical-700'
                            }`}
                          >
                            {c}
                          </button>
                        )
                      )}
                    </>
                  )}
                  {quizArea === 'Face Care' && (
                    <>
                      {['Hyperpigmentation & Glow', 'Acne & Sebum Control', 'Deep Hydration & Fine Lines'].map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => setQuizConcern(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              quizConcern === c
                                ? 'bg-emerald-700 text-white border-emerald-500'
                                : 'bg-botanical-800 text-sandal-200 border-botanical-700 hover:bg-botanical-700'
                            }`}
                          >
                            {c}
                          </button>
                        )
                      )}
                    </>
                  )}
                  {quizArea === 'Skin & Body' && (
                    <>
                      {['Tan Removal & Brightening', '24-Hour Dry Skin Moisture', 'Traditional Herbal Bath'].map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => setQuizConcern(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              quizConcern === c
                                ? 'bg-emerald-700 text-white border-emerald-500'
                                : 'bg-botanical-800 text-sandal-200 border-botanical-700 hover:bg-botanical-700'
                            }`}
                          >
                            {c}
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quiz Recommendation Cards */}
            <div className="lg:col-span-7 bg-botanical-800/60 p-6 sm:p-8 rounded-3xl border border-botanical-700/80">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold text-emerald-400">Match Found</span>
                  <h3 className="text-xl font-serif font-bold text-white">{pageContents.home.quizMatchTitle || 'Recommended Routine'}</h3>
                </div>
                <span className="text-xs bg-sandal-500/20 text-sandal-300 px-3 py-1 rounded-full font-medium border border-sandal-400/30">
                  {quizArea}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizRecommendations.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-botanical-900 rounded-2xl p-4 border border-botanical-700 flex flex-col justify-between"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-botanical-800 flex-shrink-0">
                        <Image
                          src={withBasePath(prod.image)}
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase">
                          {prod.badge}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{prod.name}</h4>
                        <p className="text-[11px] text-sandal-200/70 line-clamp-2 mt-1">
                          {prod.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-botanical-800 flex items-center justify-between">
                      <span className="text-sm font-bold text-sandal-300">₹{prod.price}</span>
                      <button
                        onClick={() => addToCart(prod.id, 0, 1)}
                        className="px-3.5 py-1.5 rounded-lg bg-sandal-500 text-botanical-950 font-bold text-xs hover:bg-sandal-400 transition-colors flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add To Basket</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR ANCESTRAL 4-STAGE HERBAL PROCESS */}
      <section className="py-20 bg-sandal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-botanical-700 font-bold">
              {pageContents.home.processEyebrow || 'The Artisan Process'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-botanical-900 mt-1">
              {pageContents.home.processTitle}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {pageContents.home.processSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-sandal-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-serif font-bold text-base text-botanical-900">{pageContents.home.step1Title || 'Wild Herb Foraging'}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {pageContents.home.step1Desc || 'Fresh red hibiscus, karisalankanni, and vetiver roots harvested at dawn from Pollachi foothill groves.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sandal-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-serif font-bold text-base text-botanical-900">{pageContents.home.step2Title || 'Cold Wood-Milling'}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {pageContents.home.step2Desc || 'Virgin coconut and gingelly oils extracted via slow wooden vaagai chekku mills with zero thermal degradation.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sandal-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-serif font-bold text-base text-botanical-900">{pageContents.home.step3Title || 'Bronze Uruli Infusion'}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {pageContents.home.step3Desc || 'Botanicals slow-simmered in heirloom heavy bronze vats for 72 hours under constant gentle stirring.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sandal-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-serif font-bold text-base text-botanical-900">{pageContents.home.step4Title || 'Lab Batch Certified'}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {pageContents.home.step4Desc || 'Independently tested for zero heavy metals, zero microbes, and packaged in dark UV-protective glass bottles.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-botanical-700 font-bold">
            {pageContents.home.faqEyebrow || 'Got Questions?'}
          </span>
          <h2 className="text-3xl font-serif font-bold text-botanical-900 mt-1">
            {pageContents.home.faqTitle || 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className="border border-sandal-200 rounded-2xl overflow-hidden bg-white shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between font-serif font-bold text-botanical-900 hover:text-botanical-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-sandal-600 transition-transform ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-sandal-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
