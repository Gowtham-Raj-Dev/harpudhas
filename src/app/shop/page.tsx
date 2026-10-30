'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { BannerDisplay } from '@/components/BannerDisplay';
import { ProductCard } from '@/components/ProductCard';
import { Dropdown } from '@/components/ui/Dropdown';
import { productsFor, isOutOfStock } from '@/lib/storeUtils';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';

const CATEGORIES = ['all', 'Hair Care', 'Face Care', 'Skin & Body'];
const FORMATS = ['all', 'Oil & Serum', 'Shampoo & Cleanser', 'Cream & Butter', 'Mask & Soap'];

function ShopContent() {
  const { products, pageContents } = useStore();
  const searchParams = useSearchParams();

  const catalog = useMemo(() => productsFor(products, 'shop'), [products]);
  const priceCeil = useMemo(
    () => Math.max(500, Math.ceil(Math.max(0, ...catalog.map((p) => p.price)) / 100) * 100),
    [catalog]
  );

  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get('category') || 'all');
  const [activeFormat, setActiveFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(priceCeil);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Keep filters in sync when the header nav changes the URL
  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'all');
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => setMaxPrice(priceCeil), [priceCeil]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = catalog.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tamilName.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.ingredients.some((ing) => ing.toLowerCase().includes(q));
      return (
        (activeCategory === 'all' || p.category === activeCategory) &&
        (activeFormat === 'all' || p.format === activeFormat) &&
        p.price <= maxPrice &&
        (!inStockOnly || !isOutOfStock(p)) &&
        matchSearch
      );
    });

    switch (sortBy) {
      case 'price-low':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      default:
        return list;
    }
  }, [catalog, activeCategory, activeFormat, searchQuery, sortBy, maxPrice, inStockOnly]);

  const hasFilters = activeCategory !== 'all' || activeFormat !== 'all' || !!searchQuery || maxPrice < priceCeil || inStockOnly;
  const resetFilters = () => {
    setActiveCategory('all');
    setActiveFormat('all');
    setSearchQuery('');
    setMaxPrice(priceCeil);
    setInStockOnly(false);
  };

  const FilterPanel = (
    <div className="space-y-7">
      <div>
        <h4 className="text-[11px] font-semibold text-botanical-900 uppercase tracking-[0.2em] mb-3">Category</h4>
        <div className="space-y-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                activeCategory === c ? 'bg-botanical-800 text-white' : 'text-gray-700 hover:bg-sandal-100'
              }`}
            >
              <span>{c === 'all' ? 'All formulations' : c}</span>
              <span className="text-xs opacity-60 tabular-nums">
                {c === 'all' ? catalog.length : catalog.filter((p) => p.category === c).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[11px] font-semibold text-botanical-900 uppercase tracking-[0.2em] mb-3">Format</h4>
        <Dropdown
          variant="store"
          size="sm"
          value={activeFormat}
          onChange={setActiveFormat}
          options={FORMATS.map((f) => ({
            value: f,
            label: f === 'all' ? 'All formats' : f,
            hint: String(f === 'all' ? catalog.length : catalog.filter((p) => p.format === f).length),
          }))}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-[11px] font-semibold text-botanical-900 uppercase tracking-[0.2em]">Max price</h4>
          <span className="text-sm font-semibold text-botanical-800">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min={100}
          max={priceCeil}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-botanical-800 cursor-pointer"
        />
      </div>

      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm text-gray-700">In stock only</span>
        <button
          type="button"
          onClick={() => setInStockOnly((v) => !v)}
          className={`relative w-10 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-botanical-800' : 'bg-sandal-300'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${inStockOnly ? 'left-5' : 'left-1'}`} />
        </button>
      </label>

      {hasFilters && (
        <button onClick={resetFilters} className="w-full py-2.5 rounded-xl border border-sandal-300 text-sm text-botanical-900 hover:bg-sandal-100">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-sandal-50 pb-24">
      <div className="relative bg-botanical-900 text-white overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sandal-500/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center space-y-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-sandal-300 font-semibold">The Apothecary</span>
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold">{pageContents.shop.title}</h1>
          <p className="text-[15px] text-sandal-100/75 max-w-xl mx-auto">{pageContents.shop.subtitle}</p>
        </div>
      </div>

      <BannerDisplay page="shop" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search by herb, formula or concern…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-10 rounded-xl border border-sandal-300 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-botanical-700/10 focus:border-botanical-700"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden h-11 flex items-center gap-2 px-4 rounded-xl bg-white text-sm font-medium text-botanical-900 border border-sandal-300"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <Dropdown
              variant="store"
              className="w-56"
              value={sortBy}
              onChange={setSortBy}
              icon={<ArrowUpDown className="w-4 h-4" />}
              align="right"
              options={[
                { value: 'featured', label: 'Featured' },
                { value: 'newest', label: 'Newest first' },
                { value: 'price-low', label: 'Price: low to high' },
                { value: 'price-high', label: 'Price: high to low' },
                { value: 'rating', label: 'Top rated' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block bg-white p-6 rounded-[22px] border border-sandal-200/80 h-fit sticky top-24">{FilterPanel}</aside>

          <div className="lg:col-span-3">
            <p className="text-sm text-gray-500 mb-4">
              Showing <span className="font-semibold text-botanical-900">{filteredProducts.length}</span> of {catalog.length} formulations
            </p>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[22px] border border-sandal-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sandal-100 text-sandal-600 mx-auto flex items-center justify-center">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-botanical-900">No matching formulations</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">Try adjusting the filters or searching for another herb.</p>
                <button onClick={resetFilters} className="px-6 py-2.5 rounded-full bg-botanical-800 text-white text-sm hover:bg-botanical-900">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white p-6 overflow-y-auto animate-slide-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-semibold text-botanical-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-2 rounded-full hover:bg-sandal-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterPanel}
            <button onClick={() => setMobileFilterOpen(false)} className="mt-6 w-full py-3 rounded-xl bg-botanical-800 text-white text-sm font-semibold">
              Show {filteredProducts.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-sandal-50">
          <div className="w-10 h-10 border-4 border-botanical-800 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
