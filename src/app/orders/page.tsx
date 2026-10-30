'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { Order, OrderStatus } from '@/types/store';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

function OrdersContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id') || '';

  const { orders, getOrderById, getOrdersByPhone, footerConfig } = useStore();

  const [searchQuery, setSearchQuery] = useState(urlId);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (urlId) {
      const match = getOrderById(urlId);
      if (match) {
        setSelectedOrder(match);
      }
    } else if (orders.length > 0) {
      setSelectedOrder(orders[0]);
    }
  }, [urlId, orders, getOrderById]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check if phone or order ID
    if (/^\d{10}$/.test(q.replace(/\D/g, ''))) {
      const matches = getOrdersByPhone(q);
      if (matches.length > 0) {
        setSelectedOrder(matches[0]);
      } else {
        setSelectedOrder(null);
      }
    } else {
      const match = getOrderById(q);
      setSelectedOrder(match || null);
    }
  };

  const stages: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  const getStageIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return stages.indexOf(status);
  };

  const currentStageIndex = selectedOrder ? getStageIndex(selectedOrder.status) : 0;

  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-botanical-700">
            Real-Time Fulfillment
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-botanical-900">
            Track Your Herbal Shipment
          </h1>
          <p className="text-sm text-gray-600">
            Enter your unique Order ID (e.g. HARP-7821) or 10-digit mobile number to view live packaging & delivery status.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="pt-4 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order ID or Mobile Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-2xl border border-sandal-300 text-sm focus:outline-none focus:ring-2 focus:ring-botanical-700 bg-white shadow-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-botanical-800 text-white font-semibold text-xs hover:bg-botanical-900 transition-colors shadow-md"
            >
              Track Order
            </button>
          </form>
        </div>

        {/* Search Results / Details */}
        {!selectedOrder ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sandal-200 shadow-xs max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-sandal-400 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-botanical-900">
              No Matching Order Found
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Please double check your Order ID or phone number. If you just placed an order, it should be listed in your order confirmation.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/shop"
                className="px-5 py-2.5 rounded-full bg-botanical-800 text-white text-xs font-medium hover:bg-botanical-900"
              >
                Browse Shop
              </Link>
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-full bg-sandal-200 text-botanical-900 text-xs font-semibold hover:bg-sandal-300"
              >
                Check Admin Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Order Overview Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sandal-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-botanical-900">
                    Order #{selectedOrder.id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedOrder.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedOrder.status === 'Shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedOrder.status === 'Processing'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedOrder.status === 'Confirmed'
                        ? 'bg-purple-100 text-purple-800'
                        : selectedOrder.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-sandal-200 text-botanical-900'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              {/* Courier info if shipped */}
              {selectedOrder.trackingNumber && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs space-y-0.5">
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Courier: {selectedOrder.courierName || 'Express Logistics'}</span>
                  </p>
                  <p className="text-emerald-800 font-mono">
                    Tracking AWB: {selectedOrder.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Visual 5-Stage Stepper */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-sandal-200 shadow-xs">
              <h3 className="font-serif font-bold text-lg text-botanical-900 mb-8">
                Fulfillment Timeline
              </h3>

              {selectedOrder.status === 'Cancelled' ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>This order has been cancelled by store administrator.</span>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-sandal-200 -translate-y-1/2 z-0" />
                  <div
                    className="hidden md:block absolute top-1/2 left-0 h-1 bg-botanical-800 -translate-y-1/2 z-0 transition-all duration-500"
                    style={{
                      width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                    }}
                  />

                  {/* Stage Points */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
                    {[
                      { status: 'Pending', label: '1. Order Placed', icon: Clock },
                      { status: 'Confirmed', label: '2. Confirmed', icon: CheckCircle2 },
                      { status: 'Processing', label: '3. Packed & Sealed', icon: Box },
                      { status: 'Shipped', label: '4. Dispatched', icon: Truck },
                      { status: 'Delivered', label: '5. Delivered', icon: PackageCheck },
                    ].map((step, idx) => {
                      const isComplete = currentStageIndex >= idx;
                      const isCurrent = currentStageIndex === idx;
                      const Icon = step.icon;

                      return (
                        <div
                          key={step.status}
                          className="flex md:flex-col items-center md:text-center gap-4 md:gap-2"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                              isComplete
                                ? 'bg-botanical-800 text-white border-botanical-800 shadow-md'
                                : 'bg-white text-gray-400 border-sandal-300'
                            } ${isCurrent ? 'ring-4 ring-emerald-300' : ''}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold ${
                                isComplete ? 'text-botanical-900' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                Current Stage
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status History Logs */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="mt-10 pt-6 border-t border-sandal-100 space-y-3">
                  <h4 className="text-xs font-bold text-botanical-900 uppercase tracking-wider">
                    Activity History:
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((item, hIdx) => (
                      <div
                        key={hIdx}
                        className="flex items-start gap-3 text-xs p-3 rounded-xl bg-sandal-50/70 border border-sandal-200/60"
                      >
                        <div className="w-2 h-2 rounded-full bg-botanical-700 mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-botanical-900">
                            {item.status}: <span className="font-normal text-gray-700">{item.note}</span>
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(item.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Items & Delivery Address Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Ordered Items */}
              <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-sandal-200 shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-base text-botanical-900 pb-3 border-b border-sandal-100">
                  Items in this Shipment ({selectedOrder.items.length})
                </h3>

                <div className="space-y-3">
                  {selectedOrder.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-sandal-50 border border-sandal-200/70"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-sandal-200">
                          <Image
                            src={withBasePath(item.image)}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-botanical-900">
                            {item.productName}
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Size: {item.sizeLabel} × Qty: {item.qty}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-botanical-900 whitespace-nowrap">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-sandal-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Charges</span>
                    <span>{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-botanical-950 pt-2 border-t border-sandal-200">
                    <span>Total Amount</span>
                    <span className="text-base text-emerald-900">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Support */}
              <div className="md:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sandal-200 shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-base text-botanical-900 pb-3 border-b border-sandal-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-botanical-700" />
                    <span>Destination Address</span>
                  </h3>

                  <div className="text-xs text-gray-700 space-y-1 leading-relaxed">
                    <p className="font-bold text-botanical-900 text-sm">
                      {selectedOrder.customer.fullName}
                    </p>
                    <p>{selectedOrder.customer.address}</p>
                    {selectedOrder.customer.landmark && (
                      <p className="text-gray-500">Landmark: {selectedOrder.customer.landmark}</p>
                    )}
                    <p>
                      {selectedOrder.customer.city}, {selectedOrder.customer.state} —{' '}
                      <span className="font-bold text-botanical-900">{selectedOrder.customer.pincode}</span>
                    </p>
                    <p className="pt-2 flex items-center gap-1.5 text-gray-800 font-medium">
                      <Phone className="w-3.5 h-3.5 text-botanical-800" />
                      <span>{selectedOrder.customer.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Need Help CTA */}
                <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-serif font-bold text-base">Questions About Your Order?</h4>
                  </div>
                  <p className="text-xs text-sandal-200 leading-relaxed">
                    Our Pollachi herbal care support team is on standby to assist with delivery queries, usage rituals, or dosage questions.
                  </p>
                  {footerConfig.whatsapp && (
                    <a
                      href={`https://wa.me/${footerConfig.whatsapp.replace(/\D/g, '')}?text=Hi%2C%20regarding%20my%20order%20${selectedOrder.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-botanical-950 font-bold text-xs transition-colors shadow-sm"
                    >
                      <span>Direct WhatsApp Support</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-botanical-800 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-botanical-900 font-semibold">Loading Order Tracking...</p>
          </div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
