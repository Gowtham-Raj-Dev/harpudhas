'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { productsFor, productHref } from '@/lib/storeUtils';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  Tag,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    products,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartTotals,
    promoCode,
    promoApplied,
    applyPromoCode,
    removePromoCode,
    headerConfig,
  } = useStore();

  const [inputCode, setInputCode] = useState('');
  const upsell = productsFor(products, 'cart-upsell')
    .filter((p) => !cart.some((c) => c.id === p.id))
    .slice(0, 4);

  const threshold = headerConfig.freeShippingThreshold || 499;
  const remainingForFreeShipping = Math.max(0, threshold - cartTotals.subtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartTotals.subtotal / threshold) * 100));

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      applyPromoCode(inputCode.trim());
      setInputCode('');
    }
  };

  return (
    <div className="w-full min-h-screen bg-sandal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sandal-200 mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-botanical-700">
              Review Selection
            </span>
            <h1 className="text-3xl font-serif font-bold text-botanical-900 mt-1">
              Your Herbal Basket
            </h1>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium self-start sm:self-auto"
            >
              Clear Entire Basket
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-sandal-200 p-8 max-w-xl mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-full bg-sandal-100 text-botanical-800 mx-auto flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-botanical-900 mb-2">
              Your basket is empty
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Explore our traditional Siddha hair oils, saffron radiance face creams, and cold-pressed bath soaps.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-botanical-800 text-white font-medium text-sm hover:bg-botanical-900 transition-colors shadow-md"
            >
              <span>Explore Herbal Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Alert */}
              <div className="p-4 rounded-2xl bg-white border border-sandal-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-botanical-900 mb-2">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    {remainingForFreeShipping > 0
                      ? `Add ₹${remainingForFreeShipping} more to unlock Free Express Shipping!`
                      : '🎉 You have unlocked FREE Express Shipping Across India!'}
                  </span>
                  <span>{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-sandal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-botanical-700 transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-sandal-200 overflow-hidden shadow-xs divide-y divide-sandal-100">
                {cart.map((item, idx) => {
                  const product = products.find((p) => p.id === item.id);
                  if (!product) return null;
                  const size = product.sizeOptions[item.sizeIndex] || product.sizeOptions[0];

                  return (
                    <div
                      key={`${item.id}-${item.sizeIndex}`}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-sandal-50 border border-sandal-200 flex-shrink-0">
                          <Image
                            src={withBasePath(product.image)}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase">
                            {product.category}
                          </span>
                          <Link href={productHref(product.id)}>
                            <h3 className="font-serif font-bold text-base text-botanical-900 hover:text-botanical-700 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Size: <span className="font-medium text-gray-800">{size.label}</span>
                          </p>
                          <p className="text-xs font-bold text-botanical-800 sm:hidden mt-1">
                            ₹{size.price} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-sandal-300 rounded-xl bg-sandal-50 p-0.5">
                          <button
                            onClick={() => updateCartQty(idx, -1)}
                            className="p-1.5 hover:bg-sandal-200/60 rounded-lg text-gray-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-botanical-900">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(idx, 1)}
                            className="p-1.5 hover:bg-sandal-200/60 rounded-lg text-gray-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[70px]">
                          <span className="text-base font-serif font-bold text-botanical-900 block">
                            ₹{size.price * item.qty}
                          </span>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove from basket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-botanical-800 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping Herbal Catalog</span>
                </Link>
              </div>
            </div>

            {/* Order Summary & Coupon */}
            <div className="lg:col-span-4 space-y-4">
              {/* Promo Code Box */}
              <div className="bg-white p-6 rounded-3xl border border-sandal-200 shadow-xs space-y-3">
                <h3 className="font-serif font-bold text-botanical-900 text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-botanical-700" />
                  <span>Discount & Herbal Coupons</span>
                </h3>

                {promoApplied ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono font-bold text-emerald-900">
                        {promoCode} (15% OFF)
                      </span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-gray-400 hover:text-rose-600"
                      title="Remove promo code"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. HARPUDHAS15"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-xl border border-sandal-300 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-botanical-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-semibold text-xs transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                <p className="text-[11px] text-gray-500">
                  Tip: Use code <span className="font-mono font-bold text-botanical-800">HARPUDHAS15</span> for 15% instant off.
                </p>
              </div>

              {/* Bill Details */}
              <div className="bg-white p-6 rounded-3xl border border-sandal-200 shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-botanical-900 text-base pb-3 border-b border-sandal-100">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-gray-900">₹{cartTotals.subtotal}</span>
                  </div>

                  {cartTotals.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Herbal Promo Savings</span>
                      <span className="font-bold">-₹{cartTotals.discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Express Delivery Charges</span>
                    <span className="font-medium">
                      {cartTotals.shipping === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        `₹${cartTotals.shipping}`
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-sandal-100 flex justify-between text-base font-bold text-botanical-950">
                    <span>Grand Total</span>
                    <span className="text-xl font-serif text-botanical-900">
                      ₹{cartTotals.total}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 text-right">
                    (Inclusive of all GST & taxes)
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 rounded-full bg-botanical-800 text-white font-semibold text-sm hover:bg-botanical-900 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>Proceed to Delivery & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Secure 256-Bit Encrypted Indian Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {upsell.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-serif font-semibold text-botanical-900 mb-6">You may also like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {upsell.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
