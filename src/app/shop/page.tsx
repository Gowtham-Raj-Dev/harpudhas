'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { BannerDisplay } from '@/components/BannerDisplay';
import { CategoryType, FormatType } from '@/types/store';
import {
  Search,
  Filter,
  Star,
  ShoppingBag,
  Heart,
  SlidersHorizontal,
  X,
} from 'lucide-react';

function ShopContent() {
  const { products, addToCart, wishlist, toggleWishlist, pageContents } = useStore();
  const searchParams = useSearchParams();

  // URL query params
  const initialCat = (searchParams.get('category') as CategoryType) || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState<string>(initialCat);
  const [activeFormat, setActiveFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = ['all', 'Hair Care', 'Face Care', 'Skin & Body'];
  const formats = [
    'all',
    'Oil & Serum',
    'Shampoo & Cleanser',
    'Cream & Butter',
    'Mask & Soap',
  ];

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchFormat = activeFormat === 'all' || p.format === activeFormat;
      const matchPrice = p.price <= maxPrice;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tamilName.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.ingredients.some((ing) => ing.toLowerCase().includes(q));

      return matchCat && matchFormat && matchPrice && matchSearch;
    });

    if (sortBy === 'price-low') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [products, activeCategory, activeFormat, searchQuery, sortBy, maxPrice]);

  const handleSizeChange = (productId: string, sizeIdx: number) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeIdx }));
  };

  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] pb-24">
      {/* Shop Header Banner */}
      <div className="bg-botanical-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-botanical-800">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-sandal-400">
            Ancestral Siddha Apothecary
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight">
            {pageContents.shop.title}
          </h1>
          <p className="text-sm text-sandal-200/80 max-w-xl mx-auto">
            {pageContents.shop.subtitle}
          </p>
        </div>
      </div>

      {/* Target Offer Banner for Shop */}
      <BannerDisplay page="shop" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-sandal-200 shadow-xs mb-8">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by herb, formula, or concern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 focus:border-transparent"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-botanical-800 text-white shadow-xs'
                    : 'bg-sandal-100/70 text-gray-700 hover:bg-sandal-200/60'
                }`}
              >
                {cat === 'all' ? 'All Collections' : cat}
              </button>
            ))}
          </div>

          {/* Sort & Mobile Filter Trigger */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sandal-100 text-xs font-semibold text-botanical-900 border border-sandal-300"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-sandal-300 text-xs font-medium text-botanical-900 bg-white focus:outline-none focus:ring-1 focus:ring-botanical-600"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-sandal-200 shadow-xs h-fit sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-sandal-100">
              <h3 className="font-serif font-bold text-botanical-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-botanical-700" />
                <span>Refine Catalogue</span>
              </h3>
              {(activeCategory !== 'all' || activeFormat !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setActiveFormat('all');
                    setSearchQuery('');
                    setMaxPrice(1500);
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-botanical-900 uppercase tracking-wider">
                Category
              </label>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      activeCategory === c
                        ? 'bg-botanical-800 text-white'
                        : 'text-gray-700 hover:bg-sandal-100'
                    }`}
                  >
                    <span>{c === 'all' ? 'All Formulations' : c}</span>
                    <span className="text-[11px] opacity-70">
                      {c === 'all'
                        ? products.length
                        : products.filter((p) => p.category === c).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Filter */}
            <div className="space-y-2 pt-4 border-t border-sandal-100">
              <label className="text-xs font-bold text-botanical-900 uppercase tracking-wider">
                Formula Format
              </label>
              <div className="space-y-1">
                {formats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFormat(f)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeFormat === f
                        ? 'bg-sandal-200 text-botanical-900 font-bold'
                        : 'text-gray-700 hover:bg-sandal-100'
                    }`}
                  >
                    {f === 'all' ? 'All Formats' : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 pt-4 border-t border-sandal-100">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-botanical-900 uppercase tracking-wider">
                  Max Price
                </span>
                <span className="font-bold text-botanical-800">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="300"
                max="1500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-botanical-800 cursor-pointer"
              />
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-sandal-200 p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sandal-100 text-sandal-600 mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-botanical-900">
                  No matching formulations found
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Try adjusting your filter options, clearing the search query, or checking another category.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setActiveFormat('all');
                    setSearchQuery('');
                    setMaxPrice(1500);
                  }}
                  className="px-6 py-2.5 rounded-full bg-botanical-800 text-white text-xs font-medium hover:bg-botanical-900"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const currentSizeIdx = selectedSizes[prod.id] || 0;
                  const currentSize = prod.sizeOptions[currentSizeIdx] || prod.sizeOptions[0];
                  const isWishlisted = wishlist.includes(prod.id);

                  return (
                    <div
                      key={prod.id}
                      className="group bg-white rounded-2xl border border-sandal-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                    >
                      {/* Badge & Wishlist */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-botanical-800 text-sandal-100 shadow-xs">
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

                      {/* Image */}
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

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span className="text-emerald-800 font-medium">{prod.tamilName}</span>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{prod.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          <Link href={`/product/${prod.id}`}>
                            <h3 className="font-serif font-bold text-base text-botanical-900 group-hover:text-botanical-700 transition-colors line-clamp-1">
                              {prod.name}
                            </h3>
                          </Link>

                          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                            {prod.shortDesc}
                          </p>
                        </div>

                        {/* Size Picker */}
                        {prod.sizeOptions && prod.sizeOptions.length > 1 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {prod.sizeOptions.map((opt, sIdx) => (
                              <button
                                key={opt.label}
                                onClick={() => handleSizeChange(prod.id, sIdx)}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
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
                            <div className="text-[11px] text-gray-400 line-through">₹{prod.mrp}</div>
                            <div className="text-base font-bold text-botanical-900">
                              ₹{currentSize?.price || prod.price}
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart(prod.id, currentSizeIdx, 1)}
                            className="px-3.5 py-1.5 rounded-xl bg-botanical-800 text-white text-xs font-semibold hover:bg-botanical-900 transition-colors flex items-center gap-1 shadow-sm"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-botanical-800 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-botanical-900 font-semibold">Loading Herbal Catalog...</p>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
