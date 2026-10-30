'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { Product } from '@/types/store';
import { productHref, isOutOfStock } from '@/lib/storeUtils';
import { Heart, ShoppingBag, Star } from 'lucide-react';

const MaybeLink: React.FC<{ href: string; preview?: boolean; className?: string; children: React.ReactNode }> = ({
  href,
  preview,
  className,
  children,
}) => (preview ? <div className={className}>{children}</div> : <Link href={href} className={className}>{children}</Link>);

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  // When true the card only renders visuals (used by the admin live preview)
  preview?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'default', preview }) => {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [sizeIdx, setSizeIdx] = useState(0);
  const size = product.sizeOptions[sizeIdx] || product.sizeOptions[0];
  const price = size?.price ?? product.price;
  const off = product.mrp > price ? Math.round(((product.mrp - price) / product.mrp) * 100) : 0;
  const soldOut = isOutOfStock(product);
  const wished = wishlist.includes(product.id);
  const href = productHref(product.id);

  if (variant === 'compact') {
    return (
      <div className="group flex gap-4 p-3 rounded-2xl bg-white border border-sandal-200/80 hover:border-sandal-500/60 hover:shadow-lg hover:shadow-botanical-900/5 transition-all">
        <MaybeLink href={href} preview={preview} className="relative w-20 h-20 rounded-xl overflow-hidden bg-sandal-50 shrink-0">
          <Image src={withBasePath(product.image)} alt={product.name} fill className="object-cover product-img group-hover:scale-105" />
        </MaybeLink>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-sandal-700 font-semibold">{product.category}</p>
            <MaybeLink href={href} preview={preview}>
              <h4 className="text-sm font-semibold text-botanical-900 line-clamp-1 hover:text-botanical-600">{product.name}</h4>
            </MaybeLink>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-botanical-900">₹{price}</span>
            <button
              disabled={soldOut || preview}
              onClick={() => addToCart(product.id, sizeIdx, 1)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-botanical-50 text-botanical-800 hover:bg-botanical-800 hover:text-white disabled:opacity-40 transition-colors"
            >
              {soldOut ? 'Sold out' : '+ Add'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group card-zoom relative flex flex-col bg-white rounded-[22px] border border-sandal-200/80 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-sandal-50 to-sandal-100">
        <MaybeLink href={href} preview={preview} className="absolute inset-0">
          <Image
            src={withBasePath(product.image)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover product-img ${soldOut ? 'grayscale-[60%] opacity-80' : ''}`}
          />
        </MaybeLink>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] bg-white/95 text-botanical-900 shadow-sm backdrop-blur">
              {product.badge}
            </span>
          )}
          {off > 0 && !soldOut && (
            <span className="w-fit px-2.5 py-1 rounded-full text-[10px] font-bold bg-terracotta-500 text-white shadow-sm">
              {off}% OFF
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={preview}
          onClick={() => toggleWishlist(product.id)}
          aria-label="Save to wishlist"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-botanical-800 shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${wished ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {soldOut && (
          <div className="absolute inset-x-3 bottom-3 py-2 rounded-xl bg-botanical-900/85 text-center text-[11px] font-semibold uppercase tracking-widest text-sandal-100">
            Out of stock
          </div>
        )}

        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 hidden sm:block">
            <button
              type="button"
              disabled={preview}
              onClick={() => addToCart(product.id, sizeIdx, 1)}
              className="w-full py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Quick add · ₹{price}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.16em] text-sandal-700 font-semibold truncate">
            {product.category} · {product.format}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-botanical-900 shrink-0">
            <Star className="w-3 h-3 fill-sandal-500 text-sandal-500" />
            {product.rating.toFixed(1)}
            <span className="text-gray-400 font-normal">({product.reviews})</span>
          </span>
        </div>

        <MaybeLink href={href} preview={preview}>
          <h3 className="font-serif text-[19px] leading-snug font-semibold text-botanical-900 line-clamp-2 hover:text-botanical-600 transition-colors">
            {product.name}
          </h3>
        </MaybeLink>
        <p className="text-[11px] text-emerald-800/80 mt-1 line-clamp-1">{product.tamilName}</p>

        {product.sizeOptions.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.sizeOptions.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSizeIdx(i)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  sizeIdx === i
                    ? 'border-botanical-800 bg-botanical-800 text-white'
                    : 'border-sandal-200 text-gray-600 hover:border-botanical-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-botanical-900">₹{price}</span>
            {product.mrp > price && <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>}
          </div>
          <button
            type="button"
            disabled={soldOut || preview}
            onClick={() => addToCart(product.id, sizeIdx, 1)}
            aria-label="Add to cart"
            className="sm:hidden w-10 h-10 rounded-full bg-botanical-800 text-white flex items-center justify-center disabled:opacity-40"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
