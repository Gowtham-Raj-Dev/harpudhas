'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    showCartDrawer,
    setShowCartDrawer,
    cart,
    products,
    updateCartQty,
    removeFromCart,
    cartTotals,
    headerConfig,
  } = useStore();

  if (!showCartDrawer) return null;

  const threshold = headerConfig.freeShippingThreshold || 499;
  const remainingForFreeShipping = Math.max(0, threshold - cartTotals.subtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartTotals.subtotal / threshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setShowCartDrawer(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-sandal-50 shadow-2xl flex flex-col border-l border-sandal-200 animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b border-sandal-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-botanical-800" />
              <h2 className="text-lg font-serif font-bold text-botanical-900">
                Your Herbal Basket ({cart.reduce((sum, i) => sum + i.qty, 0)})
              </h2>
            </div>
            <button
              onClick={() => setShowCartDrawer(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-sandal-100/70 px-5 py-3 border-b border-sandal-200">
            <div className="flex items-center justify-between text-xs font-medium text-botanical-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-botanical-700" />
                {remainingForFreeShipping > 0
                  ? `Add ₹${remainingForFreeShipping} more for FREE Shipping!`
                  : '🎉 Congratulations! You unlocked FREE Delivery!'}
              </span>
              <span className="font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-sandal-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-botanical-700 transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-sandal-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-sandal-400" />
                </div>
                <h3 className="font-serif text-lg font-medium text-botanical-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-gray-500 mb-5 max-w-xs">
                  Discover handcrafted herbal hair oils, saffron radiance creams, and botanical soaps.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setShowCartDrawer(false)}
                  className="px-6 py-2.5 rounded-full bg-botanical-800 text-white text-xs font-medium hover:bg-botanical-900 transition-colors shadow-sm"
                >
                  Explore Herbal Shop
                </Link>
              </div>
            ) : (
              cart.map((item, idx) => {
                const product = products.find((p) => p.id === item.id);
                if (!product) return null;
                const size = product.sizeOptions[item.sizeIndex] || product.sizeOptions[0];

                return (
                  <div
                    key={`${item.id}-${item.sizeIndex}-${idx}`}
                    className="flex gap-3 p-3 bg-white rounded-xl border border-sandal-200/80 shadow-xs"
                  >
                    <div className="relative w-18 h-18 w-20 h-20 rounded-lg overflow-hidden bg-sandal-100 flex-shrink-0">
                      <Image
                        src={withBasePath(product.image)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-semibold text-botanical-900 line-clamp-1">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="text-gray-400 hover:text-rose-500 transition-colors p-0.5"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Size: <span className="font-medium text-gray-700">{size.label}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-sandal-200 rounded-lg bg-sandal-50">
                          <button
                            onClick={() => updateCartQty(idx, -1)}
                            className="p-1 hover:bg-sandal-200/60 rounded-l-lg text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-botanical-900">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(idx, 1)}
                            className="p-1 hover:bg-sandal-200/60 rounded-r-lg text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-botanical-900">
                          ₹{size.price * item.qty}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-sandal-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{cartTotals.subtotal}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{cartTotals.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {cartTotals.shipping === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      `₹${cartTotals.shipping}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-botanical-950 pt-2 border-t border-sandal-100">
                  <span>Estimated Total</span>
                  <span className="text-base font-bold text-botanical-800">
                    ₹{cartTotals.total}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={() => setShowCartDrawer(false)}
                  className="w-full py-2.5 rounded-xl border border-botanical-800 text-botanical-900 font-medium text-xs text-center hover:bg-sandal-100 transition-colors"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setShowCartDrawer(false)}
                  className="w-full py-2.5 rounded-xl bg-botanical-800 text-white font-medium text-xs text-center flex items-center justify-center gap-1.5 hover:bg-botanical-900 transition-colors shadow-sm"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
