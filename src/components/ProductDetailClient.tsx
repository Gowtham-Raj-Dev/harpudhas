'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { BannerDisplay } from '@/components/BannerDisplay';
import { productsFor, productHref, isOutOfStock } from '@/lib/storeUtils';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Leaf,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ProductDetailClient({ productId }: { productId: string }) {
  const router = useRouter();
  const { products, addToCart, wishlist, toggleWishlist, triggerToast, trackProductView } = useStore();

  const found = products.find((p) => p.id === productId);
  const product = found && found.isVisible !== false ? found : undefined;

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'ritual' | 'reviews'>('desc');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  useEffect(() => {
    if (product) trackProductView(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold">Product Not Found</h2>
        <Link href="/shop" className="mt-4 inline-block text-botanical-800 underline">
          Return to Herbal Shop
        </Link>
      </div>
    );
  }

  const selectedSize = product.sizeOptions[selectedSizeIndex] || product.sizeOptions[0];
  const isWishlisted = wishlist.includes(product.id);
  const discountPct = Math.round(((product.mrp - selectedSize.price) / product.mrp) * 100);
  const soldOut = isOutOfStock(product);

  // Related products (only those the admin placed in "Related Products")
  const relatedProducts = productsFor(products, 'product-related')
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode.trim())) {
      setPincodeStatus(`Available! Standard Delivery in 2–4 Business Days to PIN ${pincode}`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const handleBuyNow = () => {
    addToCart(product.id, selectedSizeIndex, qty);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDesc,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('Product link copied to clipboard!');
    }
  };

  return (
    <div className="w-full min-h-screen bg-sandal-50 pb-32 sm:pb-24">
      {/* Target Banner for Product Page */}
      <BannerDisplay page="product" />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto">
          <Link href="/" className="hover:text-botanical-800">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-botanical-800">
            Shop
          </Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-botanical-800">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-botanical-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Product Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-10 border border-sandal-200 shadow-sm">
          {/* Left: Product Image */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-sandal-50 border border-sandal-200/80 shadow-md">
              <Image
                src={withBasePath(product.image)}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-botanical-800 text-sandal-100 shadow-sm">
                  {product.badge}
                </span>
              </div>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-gray-600 hover:text-rose-500 shadow-md transition-colors"
                title="Save to Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Authentic Botanical Siddha Formulation
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-botanical-800 hover:underline"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between px-1 sm:px-0">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  {product.tamilName}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-botanical-900 leading-snug">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-800 ml-1">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">{product.reviews} verified reviews</span>
                </div>
              </div>

              {/* Price & Savings */}
              <div className="p-4 rounded-2xl bg-sandal-50 border border-sandal-200 flex items-center justify-between">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[28px] sm:text-3xl font-serif font-bold text-botanical-900">
                      ₹{selectedSize.price}
                    </span>
                    <span className="text-base text-gray-400 line-through">
                      ₹{product.mrp}
                    </span>
                    {discountPct > 0 && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Save {discountPct}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Inclusive of all taxes. Free shipping on orders over ₹499.
                  </p>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.shortDesc}
              </p>

              {/* Size / Variant Selector */}
              {product.sizeOptions && product.sizeOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-botanical-900 uppercase tracking-wider">
                    Select Size / Volume:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizeOptions.map((opt, idx) => (
                      <button
                        key={opt.label}
                        onClick={() => setSelectedSizeIndex(idx)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          selectedSizeIndex === idx
                            ? 'bg-botanical-800 text-white border-botanical-800 shadow-sm'
                            : 'bg-white text-gray-700 border-sandal-300 hover:border-botanical-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className="ml-2 font-bold opacity-90">₹{opt.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-botanical-900 uppercase tracking-wider">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-sandal-300 rounded-xl bg-sandal-50 p-1">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-2 hover:bg-sandal-200/60 rounded-lg text-gray-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-bold text-botanical-900">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="p-2 hover:bg-sandal-200/60 rounded-lg text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {soldOut ? (
                    <span className="text-xs text-rose-700 font-semibold">Currently out of stock</span>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock & Ready to Dispatch
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons (phones use the sticky bar instead) */}
              <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
                <button
                  disabled={soldOut}
                  onClick={() => addToCart(product.id, selectedSizeIndex, qty)}
                  className="disabled:opacity-40 disabled:cursor-not-allowed w-full py-3.5 rounded-full bg-botanical-800 text-white font-semibold text-sm hover:bg-botanical-900 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Basket</span>
                </button>
                <button
                  disabled={soldOut}
                  onClick={handleBuyNow}
                  className="disabled:opacity-40 disabled:cursor-not-allowed w-full py-3.5 rounded-full bg-sandal-500 text-botanical-950 font-bold text-sm hover:bg-sandal-400 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Delivery Pincode Checker */}
              <div className="pt-4 border-t border-sandal-100">
                <form onSubmit={handlePincodeCheck} className="space-y-1.5">
                  <label className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-botanical-800" />
                    <span>Check Delivery Estimate to Your Pincode:</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit PIN"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-sandal-300 text-xs w-44 focus:outline-none focus:ring-1 focus:ring-botanical-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-sandal-200 hover:bg-sandal-300 text-botanical-900 font-semibold text-xs transition-colors"
                    >
                      Check
                    </button>
                  </div>
                  {pincodeStatus && (
                    <p className="text-xs text-emerald-800 font-medium mt-1">
                      {pincodeStatus}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Details */}
        <div className="mt-6 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-sandal-200 shadow-sm">
          <div className="flex border-b border-sandal-200 gap-8 overflow-x-auto pb-2">
            {[
              { id: 'desc', label: 'Herbal Overview' },
              { id: 'ingredients', label: 'Key Botanicals' },
              { id: 'ritual', label: 'Daily Ayurvedic Ritual' },
              { id: 'reviews', label: `Customer Reviews (${product.reviews})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-serif font-bold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-botanical-800 text-botanical-900'
                    : 'border-transparent text-gray-500 hover:text-botanical-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-6">
            {activeTab === 'desc' && (
              <div className="space-y-4 max-w-3xl text-sm text-gray-700 leading-relaxed">
                <p>{product.shortDesc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-sandal-50 border border-sandal-200">
                    <Leaf className="w-5 h-5 text-emerald-700 mb-1" />
                    <h4 className="font-bold text-xs text-botanical-900">Cold-Processed</h4>
                    <p className="text-xs text-gray-600 mt-1">Retains 100% active botanical flavonoids</p>
                  </div>
                  <div className="p-4 rounded-xl bg-sandal-50 border border-sandal-200">
                    <Sparkles className="w-5 h-5 text-sandal-600 mb-1" />
                    <h4 className="font-bold text-xs text-botanical-900">Zero Synthetic Fragrance</h4>
                    <p className="text-xs text-gray-600 mt-1">Scented purely by steam-distilled flowers</p>
                  </div>
                  <div className="p-4 rounded-xl bg-sandal-50 border border-sandal-200">
                    <Clock className="w-5 h-5 text-emerald-700 mb-1" />
                    <h4 className="font-bold text-xs text-botanical-900">14-Day Micro Batches</h4>
                    <p className="text-xs text-gray-600 mt-1">Slow-simmered in heirloom bronze urulis</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-3 max-w-3xl">
                <p className="text-xs text-gray-600">
                  Every botanical is harvested at peak potency from our certified organic herb plantations in Pollachi.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {product.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-sandal-50 border border-sandal-200 flex items-center gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-botanical-900">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ritual' && (
              <div className="max-w-2xl space-y-4">
                <div className="p-5 rounded-2xl bg-botanical-900 text-sandal-100 space-y-2">
                  <h4 className="font-serif font-bold text-base text-sandal-300">
                    How To Incorporate Into Your Daily Regimen:
                  </h4>
                  <p className="text-xs text-sandal-100 leading-relaxed">
                    {product.ritual}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-sandal-50 border border-sandal-200">
                  <div className="text-3xl font-serif font-bold text-botanical-900">
                    {product.rating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Based on {product.reviews} verified customer orders
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-sandal-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-botanical-900">Meenakshi S. (Chennai)</span>
                      <span className="text-gray-400">2 days ago</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700">
                      "I have been using this for 3 weeks now. My scalp feels so much calmer and the authentic herbal aroma is unmatched! True Tamil Siddha quality."
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-sandal-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-botanical-900">Vignesh R. (Coimbatore)</span>
                      <span className="text-gray-400">1 week ago</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700">
                      "Fast delivery and very authentic packaging. You can tell they slow-infuse it in bronze urulis because the consistency is thick and deeply nourishing."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-16">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-botanical-900 mb-4 sm:mb-6">
              Complementary {product.category} Formulations
            </h3>
            <div className="scroll-row gap-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={productHref(rel.id)}
                  className="group w-[80%] sm:w-auto bg-white rounded-2xl border border-sandal-200 p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-sandal-50 flex-shrink-0">
                    <Image
                      src={withBasePath(rel.image)}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-botanical-900 group-hover:text-botanical-700 transition-colors line-clamp-1">
                      {rel.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{rel.shortDesc}</p>
                    <span className="text-xs font-bold text-botanical-900 mt-1 block">
                      ₹{rel.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phones: sticky buy bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-sandal-200 shadow-[0_-8px_24px_-12px_rgb(var(--botanical-900)/0.2)] pb-safe">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="min-w-0 mr-1">
            <p className="text-[11px] text-gray-500 truncate">{selectedSize.label}</p>
            <p className="text-lg font-bold text-botanical-900 leading-tight">₹{selectedSize.price * qty}</p>
          </div>
          <button
            disabled={soldOut}
            onClick={() => addToCart(product.id, selectedSizeIndex, qty)}
            className="flex-1 h-12 rounded-full border-2 border-botanical-800 text-botanical-900 text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-40"
          >
            <ShoppingBag className="w-4 h-4" />
            Add
          </button>
          <button
            disabled={soldOut}
            onClick={handleBuyNow}
            className="flex-1 h-12 rounded-full bg-botanical-800 text-white text-sm font-semibold active:scale-[0.98] disabled:opacity-40"
          >
            {soldOut ? 'Sold out' : 'Buy now'}
          </button>
        </div>
      </div>
    </div>
  );
}
