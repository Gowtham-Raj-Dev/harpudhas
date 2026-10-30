'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { Order, OrderItemDetail } from '@/types/store';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  PackageCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, products, cartTotals, addOrder, clearCart, triggerToast, siteSettings, trackCheckoutStarted, identifyVisitor, currentVisitor } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Journey tracking: reached checkout, then identified once name + phone are typed
  React.useEffect(() => {
    if (cart.length > 0) trackCheckoutStarted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Pre-fill for signed-in customers
  React.useEffect(() => {
    if (!currentVisitor?.signedIn) return;
    if (!fullName && currentVisitor.fullName) setFullName(currentVisitor.fullName);
    if (!phone && currentVisitor.phone) setPhone(currentVisitor.phone);
    if (!email && currentVisitor.email) setEmail(currentVisitor.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVisitor?.signedIn, currentVisitor?.phone]);
  React.useEffect(() => {
    if (confirmedOrder) return;
    const t = setTimeout(() => {
      if (fullName.trim() || phone.replace(/\D/g, '').length >= 10) identifyVisitor({ fullName, phone, email, city });
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, phone, email, city]);

  // Admin can switch COD off live — fall back to UPI if it was selected
  React.useEffect(() => {
    if (!siteSettings.codEnabled && paymentMethod === 'cod') setPaymentMethod('upi');
  }, [siteSettings.codEnabled, paymentMethod]);

  if (!siteSettings.storeOpen && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="text-3xl font-serif font-semibold text-botanical-900 mb-3">Orders are paused</h2>
        <p className="text-sm text-gray-600 mb-6">{siteSettings.closedMessage}</p>
        <Link href="/shop" className="px-6 py-2.5 rounded-full bg-botanical-800 text-white text-sm hover:bg-botanical-900">
          Continue browsing
        </Link>
      </div>
    );
  }

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-botanical-900 mb-3">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Add some handcrafted herbal oils or creams to proceed with checkout.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-full bg-botanical-800 text-white font-medium text-xs hover:bg-botanical-900"
        >
          Return to Herbal Catalog
        </Link>
      </div>
    );
  }

  // Handle Order Placement
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      triggerToast('Please fill in all mandatory delivery fields.', 'error');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      triggerToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    setIsSubmitting(true);

    // Build items list
    const orderItems: OrderItemDetail[] = cart.map((item) => {
      const prod = products.find((p) => p.id === item.id);
      const size = prod?.sizeOptions[item.sizeIndex] || prod?.sizeOptions[0];
      return {
        productId: item.id,
        productName: prod?.name || 'Herbal Product',
        sizeLabel: size?.label || 'Standard',
        price: size?.price || 0,
        qty: item.qty,
        image: prod?.image || '/images/hair-oil.jpg',
      };
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `HARP-${randomSuffix}`;

    const newOrder: Order = {
      id: newOrderId,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        notes: notes.trim(),
      },
      items: orderItems,
      subtotal: cartTotals.subtotal,
      discount: cartTotals.discount,
      shipping: cartTotals.shipping,
      total: cartTotals.total,
      paymentMethod,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: `Order received via ${paymentMethod.toUpperCase()}. Awaiting store admin confirmation.`,
        },
      ],
    };

    setTimeout(() => {
      addOrder(newOrder);
      clearCart();
      setIsSubmitting(false);
      setConfirmedOrder(newOrder);
    }, 700);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-sandal-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-sandal-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
              Order Placed Successfully!
            </span>
            <h1 className="text-3xl font-serif font-bold text-botanical-900">
              நன்றி! Thank You For Your Trust
            </h1>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Your order has been logged into our Pollachi herbal laboratory. Our artisans are preparing
              your micro-batched formulation.
            </p>
          </div>

          {/* Order Details Badge */}
          <div className="p-5 rounded-2xl bg-sandal-50 border border-sandal-200 text-left space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-sandal-200 pb-3">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono font-bold text-botanical-900 text-base">
                #{confirmedOrder.id}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Customer:</span>
              <span className="font-bold text-botanical-900">{confirmedOrder.customer.fullName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-medium text-gray-700 text-right">
                {confirmedOrder.customer.address}, {confirmedOrder.customer.city} - {confirmedOrder.customer.pincode}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Payment:</span>
              <span className="font-semibold uppercase text-botanical-900">
                {confirmedOrder.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-botanical-950 pt-2 border-t border-sandal-200">
              <span>Total Paid / Payable:</span>
              <span className="text-lg text-emerald-800">₹{confirmedOrder.total}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Link
              href={`/orders?id=${confirmedOrder.id}`}
              className="w-full py-3.5 rounded-full bg-botanical-800 text-white font-semibold text-xs hover:bg-botanical-900 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Track Live Order Status</span>
            </Link>

            <Link
              href="/admin"
              className="w-full py-3.5 rounded-full bg-sandal-500 text-botanical-950 font-semibold text-xs hover:bg-sandal-400 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>View in Admin Orders</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-sandal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="pb-6 border-b border-sandal-200 mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-botanical-700">
            Secure Indian Checkout
          </span>
          <h1 className="text-3xl font-serif font-bold text-botanical-900 mt-1">
            Delivery & Payment Information
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Delivery Address & Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sandal-200 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-lg text-botanical-900">
                1. Customer & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-botanical-900">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gowtham Raj"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-botanical-900">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">We save these details so our team can help you complete your order on WhatsApp.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-botanical-900">
                  Email Address (Optional for Invoice)
                </label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sandal-200 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-lg text-botanical-900">
                2. Shipping Address
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-botanical-900">
                  Door No, Flat, Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. No. 12, 4th Cross, Gandhi Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-botanical-900">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Near Bus Stand / Temple"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-botanical-900">
                    City / Town <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai / Coimbatore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-botanical-900">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700 bg-white"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Other States">Other Indian State</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-botanical-900">
                    Postal PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit PIN"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-botanical-900">
                  Special Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Leave with security or call before delivery"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-sm focus:outline-none focus:ring-1 focus:ring-botanical-700"
                />
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sandal-200 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-lg text-botanical-900">
                3. Payment Method
              </h3>

              <div className="space-y-3">
                {siteSettings.codEnabled && (
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-botanical-800 bg-emerald-50/50 shadow-xs'
                      : 'border-sandal-200 hover:border-sandal-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border flex items-center justify-center border-botanical-700">
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 bg-botanical-800 rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-botanical-900 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-700" />
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-xs text-gray-500">Pay cash or scan QR when package arrives</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Zero Extra Fee
                  </span>
                </label>
                )}

                <label
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-botanical-800 bg-emerald-50/50 shadow-xs'
                      : 'border-sandal-200 hover:border-sandal-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border flex items-center justify-center border-botanical-700">
                      {paymentMethod === 'upi' && (
                        <div className="w-2.5 h-2.5 bg-botanical-800 rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-botanical-900 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-botanical-700" />
                        <span>Instant UPI (GPay / PhonePe / Paytm)</span>
                      </div>
                      <p className="text-xs text-gray-500">Fast digital confirmation</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-botanical-900 bg-sandal-100 px-2.5 py-0.5 rounded-full">
                    Instant
                  </span>
                </label>

                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-botanical-800 bg-emerald-50/50 shadow-xs'
                      : 'border-sandal-200 hover:border-sandal-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border flex items-center justify-center border-botanical-700">
                      {paymentMethod === 'card' && (
                        <div className="w-2.5 h-2.5 bg-botanical-800 rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-botanical-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-botanical-700" />
                        <span>Credit / Debit Card & Netbanking</span>
                      </div>
                      <p className="text-xs text-gray-500">All major Indian banks supported</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary: Items & Place Order Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sandal-200 shadow-xs space-y-4 sticky top-28">
              <h3 className="font-serif font-bold text-lg text-botanical-900 pb-3 border-b border-sandal-100">
                Order Review ({cart.reduce((s, i) => s + i.qty, 0)} Items)
              </h3>

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {cart.map((item) => {
                  const prod = products.find((p) => p.id === item.id);
                  if (!prod) return null;
                  const size = prod.sizeOptions[item.sizeIndex] || prod.sizeOptions[0];

                  return (
                    <div
                      key={`${item.id}-${item.sizeIndex}`}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-sandal-50 flex-shrink-0">
                          <Image
                            src={withBasePath(prod.image)}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-botanical-900 truncate">{prod.name}</p>
                          <p className="text-gray-500">
                            {size.label} × {item.qty}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-botanical-900 whitespace-nowrap">
                        ₹{size.price * item.qty}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pricing breakdown */}
              <div className="pt-4 border-t border-sandal-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{cartTotals.subtotal}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-₹{cartTotals.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Express Shipping</span>
                  <span className="font-medium">
                    {cartTotals.shipping === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${cartTotals.shipping}`
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-sandal-200 flex justify-between text-base font-bold text-botanical-950">
                  <span>Total Amount</span>
                  <span className="text-xl font-serif text-botanical-900">
                    ₹{cartTotals.total}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing Herbal Order...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order (₹{cartTotals.total})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Immediate notification will be sent to the Store Admin</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
