'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { BannerDisplay } from '@/components/BannerDisplay';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle,
  ShoppingBag,
  Heart,
  Droplets,
  Leaf,
  Flower2,
  ChevronDown,
  Clock,
  Award,
} from 'lucide-react';
import { CategoryType } from '@/types/store';

export default function HomePage() {
  const { products, addToCart, wishlist, toggleWishlist } = useStore();

  const [quizArea, setQuizArea] = useState<CategoryType>('Hair Care');
  const [quizConcern, setQuizConcern] = useState<string>('growth');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Selected sizes for products on home page
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});

  const handleSizeChange = (productId: string, sizeIdx: number) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeIdx }));
  };

  // Filter bestselling or signature products
  const featuredProducts = products.slice(0, 6);

  const categories = [
    {
      title: 'Hair Care & Tonics',
      tamil: 'கூந்தல் பராமரிப்பு',
      desc: 'Cold-pressed Hibiscus, Bhringraj & Shikakai',
      image: '/images/hair-oil.jpg',
      href: '/shop?category=Hair Care',
      tag: 'Bestselling Oils',
    },
    {
      title: 'Face Care & Radiance',
      tamil: 'முகப்பொலிவு சிகிச்சை',
      desc: 'Pure Kashmiri Saffron & Red Sandalwood',
      image: '/images/face-cream.jpg',
      href: '/shop?category=Face Care',
      tag: 'Kumkumadi Glow',
    },
    {
      title: 'Skin & Body Rituals',
      tamil: 'உடல் பாதுகாப்பு',
      desc: 'Traditional 18-Herb Nalangu Maavu & Shea',
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
      q: 'Are Hàrpudha’s products 100% natural and free from chemicals?',
      a: 'Yes, absolutely. Every formulation is handcrafted strictly following authentic Siddha and Ayurvedic scriptures. We do not use parabens, sulfates, silicones, synthetic fragrances, or mineral oils.',
    },
    {
      q: 'How long before I see results from the Hibiscus & Bhringraj Hair Oil?',
      a: 'Most customers notice significant reduction in hair fall and improved scalp nourishment within 2 to 3 weeks of regular application (2-3 times weekly with gentle scalp massage).',
    },
    {
      q: 'What is your delivery timeframe across India?',
      a: 'Orders are freshly packed within 24 hours at our Pollachi herbal facility. Delivery takes 2-4 business days for Tamil Nadu & South India, and 4-6 business days for the rest of India.',
    },
    {
      q: 'Can I track my order once placed?',
      a: 'Yes! Once you place an order, you will receive an Order ID (e.g., HARP-7821). You can visit our "Track Order" page anytime to see live updates from Pending -> Confirmed -> Packed -> Shipped -> Delivered.',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. HERO SECTION - High Conversion, Luxurious & Traditional */}
      <section className="relative overflow-hidden bg-gradient-to-b from-botanical-900 via-botanical-800 to-botanical-900 text-white pt-8 pb-20 lg:pt-14 lg:pb-28">
        {/* Subtle decorative background foliage & blur circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sandal-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Top Herbal Heritage Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-sandal-500/20 text-sandal-300 border border-sandal-400/30 backdrop-blur-md">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% தூய இயற்கை • Authentic Siddha Formulations</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight tracking-tight">
                Awaken Timeless <br />
                <span className="text-sandal-300 italic font-normal">Herbal Radiance</span> With <br />
                Ancestral Wisdom.
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-sandal-100/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Slow-infused in traditional bronze urulis with hand-harvested botanicals from the Western Ghats.
                Formulated for pure hair nourishment, glowing complexion, and soothing body wellness.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-sandal-500 text-botanical-950 font-semibold text-sm hover:bg-sandal-400 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4 text-botanical-900" />
                  <span>Shop Herbal Essentials</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#ayurvedic-quiz"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all duration-200 border border-white/20 flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <Sparkles className="w-4 h-4 text-sandal-300" />
                  <span>Find Your Dosha Routine</span>
                </a>
              </div>

              {/* Trust Metrics */}
              <div className="pt-6 border-t border-botanical-700/60 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-serif font-bold text-sandal-200">50K+</div>
                  <div className="text-xs text-sandal-300/80">Happy Ritualists</div>
                </div>
                <div className="text-center lg:text-left border-x border-botanical-700/60 px-2">
                  <div className="text-2xl font-serif font-bold text-sandal-200">4.9 ★</div>
                  <div className="text-xs text-sandal-300/80">Average Rating</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-serif font-bold text-sandal-200">100%</div>
                  <div className="text-xs text-sandal-300/80">Chemical-Free</div>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-2 border-sandal-500/30 group">
                <Image
                  src={withBasePath('/images/hero-banner.jpg')}
                  alt="Harpudhas Herbal Botanicals Heritage"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-botanical-950/80 via-transparent to-black/20" />

                {/* Floating Badge 1 - Top Left */}
                <div className="absolute top-4 left-4 bg-botanical-900/90 backdrop-blur-md border border-sandal-500/40 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                  <Award className="w-4 h-4 text-sandal-400" />
                  <div>
                    <p className="text-[10px] text-sandal-200 uppercase font-semibold">Ancient Heritage</p>
                    <p className="text-xs font-bold text-white">Siddha Certified</p>
                  </div>
                </div>

                {/* Floating Badge 2 - Bottom Right */}
                <div className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md text-botanical-900 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-sandal-300 max-w-[220px]">
                  <div className="w-10 h-10 rounded-full bg-botanical-800 text-sandal-300 flex items-center justify-center font-bold flex-shrink-0">
                    <Droplets className="w-5 h-5 text-sandal-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-botanical-950">Cold-Pressed</p>
                    <p className="text-[11px] text-gray-600">Virgin Wood-Milled Oils</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC OFFER BANNERS (Target: Home or All) */}
      <BannerDisplay page="home" />

      {/* 3. BROWSE BY CATEGORY */}
      <section className="py-16 bg-[#F7F3E8] border-y border-sandal-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-botanical-700 font-bold">
              Pure Botanical Collections
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-botanical-900 mt-1">
              Shop By Ancestral Ritual
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Every formula addresses root concerns through handpicked native herbs and stone-ground extracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl bg-white border border-sandal-300/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-sandal-100">
                  <Image
                    src={withBasePath(cat.image)}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute top-3 right-3 bg-botanical-900/80 backdrop-blur-xs text-sandal-200 text-xs px-2.5 py-1 rounded-full font-medium">
                    {cat.tag}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-medium text-emerald-800">{cat.tamil}</span>
                    <h3 className="text-xl font-serif font-bold text-botanical-900 mt-0.5 group-hover:text-botanical-700 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-sandal-100 flex items-center text-xs font-semibold text-botanical-800 group-hover:text-botanical-950">
                    <span>Explore Products</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BESTSELLING HERBAL FORMULATIONS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-botanical-700 font-bold">
              Community Favorites
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-botanical-900 mt-1">
              Signature Herbal Formulations
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Micro-batched with zero artificial fillers for visible wellness.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-botanical-800 text-botanical-900 text-xs font-semibold hover:bg-botanical-800 hover:text-white transition-colors"
          >
            <span>View All ({products.length}) Products</span>
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
                className="group bg-white rounded-2xl border border-sandal-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
              >
                {/* Badges & Wishlist */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider bg-botanical-800 text-sandal-100 shadow-xs">
                    {prod.badge}
                  </span>
                </div>
                <button
                  onClick={() => toggleWishlist(prod.id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-xs text-gray-500 hover:text-rose-500 hover:bg-white shadow-xs transition-colors"
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
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="text-emerald-800 font-medium">{prod.tamilName}</span>
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
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
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
                      className="px-4 py-2 rounded-xl bg-botanical-800 text-white text-xs font-semibold hover:bg-botanical-900 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Basket</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. INTERACTIVE AYURVEDIC DOSHA / ROUTINE QUIZ */}
      <section id="ayurvedic-quiz" className="py-20 bg-botanical-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs uppercase tracking-widest text-sandal-400 font-bold">
                Ancestral Diagnostic
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Discover Your Tailored <br />
                <span className="text-sandal-300 italic">Siddha Routine</span>
              </h2>
              <p className="text-sm text-sandal-200/80 leading-relaxed">
                Take 30 seconds to select your primary focus area. Our herbal experts have mapped traditional
                botanicals to restore natural equilibrium and deep cellular nourishment.
              </p>

              {/* Step 1: Area */}
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

              {/* Step 2: Concern */}
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
                  <h3 className="text-xl font-serif font-bold text-white">Recommended Routine</h3>
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
                        className="px-3 py-1.5 rounded-lg bg-sandal-500 text-botanical-950 font-semibold text-xs hover:bg-sandal-400 transition-colors flex items-center gap-1"
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
              The Artisan Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-botanical-900 mt-1">
              From Sacred Ghats to Your Daily Vanity
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              No industrial speed-cuts. Every bottle requires 14 days of traditional Siddha patience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-sandal-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-serif font-bold text-base text-botanical-900">Wild Herb Foraging</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fresh red hibiscus, karisalankanni, and vetiver roots harvested at dawn from Pollachi foothill groves.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sandal-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-serif font-bold text-base text-botanical-900">Cold Wood-Milling</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Virgin coconut and gingelly oils extracted via slow wooden vaagai chekku mills with zero thermal degradation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sandal-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-serif font-bold text-base text-botanical-900">Bronze Uruli Infusion</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Botanicals slow-simmered in heirloom heavy bronze vats for 72 hours under constant gentle stirring.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sandal-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-serif font-bold text-base text-botanical-900">Lab Batch Certified</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Independently tested for zero heavy metals, zero microbes, and packaged in dark UV-protective glass bottles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-botanical-700 font-bold">
            Got Questions?
          </span>
          <h2 className="text-3xl font-serif font-bold text-botanical-900 mt-1">
            Frequently Asked Questions
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
