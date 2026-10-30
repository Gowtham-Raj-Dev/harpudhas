'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { Order, OrderStatus } from '@/types/store';
import { DELIVERY_PROVIDERS, trackingUrl } from '@/lib/webhook';
import { addDays } from '@/lib/storeUtils';
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
  ChevronRight,
  Copy,
  XCircle,
  ShoppingBag,
} from 'lucide-react';

const STEPS: { status: OrderStatus; label: string; caption: string; icon: React.ElementType }[] = [
  { status: 'Pending', label: 'Order placed', caption: 'We received your order', icon: Clock },
  { status: 'Confirmed', label: 'Confirmed', caption: 'Order verified by our team', icon: CheckCircle2 },
  { status: 'Processing', label: 'Packed', caption: 'Freshly packed & sealed', icon: Box },
  { status: 'Shipped', label: 'Shipped', caption: 'Handed to the courier', icon: Truck },
  { status: 'Delivered', label: 'Delivered', caption: 'Enjoy your ritual 🌿', icon: PackageCheck },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  Pending: 'bg-amber-100 text-amber-900',
  Confirmed: 'bg-violet-100 text-violet-900',
  Processing: 'bg-sky-100 text-sky-900',
  Shipped: 'bg-blue-100 text-blue-900',
  Delivered: 'bg-emerald-100 text-emerald-900',
  Cancelled: 'bg-rose-100 text-rose-800',
};

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) =>
  new Date(iso).toLocaleString('en-IN', opts);

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id') || '';
  const { orders, getOrderById, getOrdersByPhone, footerConfig, journeys, triggerToast } = useStore();

  const [query, setQuery] = useState(urlId);
  const [selected, setSelected] = useState<Order | null>(null);
  const [phoneResults, setPhoneResults] = useState<Order[] | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Orders placed from this device (never someone else's)
  const myOrderIds = new Set(journeys.flatMap((j) => j.orderIds));
  const myOrders = orders.filter((o) => myOrderIds.has(o.id));

  useEffect(() => {
    if (!urlId) return;
    const match = getOrderById(urlId);
    setSelected(match || null);
    setNotFound(!match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId, orders]);

  // Keep the open order fresh when the admin updates its status
  const live = selected ? orders.find((o) => o.id === selected.id) ?? selected : null;

  const open = (o: Order) => {
    setSelected(o);
    setPhoneResults(null);
    setNotFound(false);
    router.replace(`/orders?id=${o.id}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const digits = q.replace(/\D/g, '');
    if (digits.length >= 10 && !/[a-z]/i.test(q)) {
      const matches = getOrdersByPhone(digits.slice(-10)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setSelected(null);
      if (matches.length === 1) open(matches[0]);
      else {
        setPhoneResults(matches);
        setNotFound(matches.length === 0);
      }
      return;
    }
    const match = getOrderById(q);
    if (match) open(match);
    else {
      setSelected(null);
      setPhoneResults(null);
      setNotFound(true);
    }
  };

  const stepIdx = live ? STEPS.findIndex((s) => s.status === live.status) : -1;
  const reachedAt = (s: OrderStatus) => live?.statusHistory.find((h) => h.status === s)?.timestamp;
  const showCourier = live && live.trackingNumber && (live.status === 'Shipped' || live.status === 'Delivered');
  const trackLink = live?.courierName
    ? trackingUrl(DELIVERY_PROVIDERS.find((d) => live.courierName!.toLowerCase().startsWith(d.name.toLowerCase().split(' ')[0]))?.tracking, live.trackingNumber)
    : '';
  const eta = live && !['Delivered', 'Cancelled'].includes(live.status) ? addDays(new Date(live.createdAt), live.customer.state === 'Tamil Nadu' ? 3 : 5) : null;
  const waNumber = footerConfig.whatsapp.replace(/\D/g, '');

  return (
    <div className="w-full min-h-screen bg-sandal-50 pb-24">
      {/* Hero + search */}
      <div className="relative bg-botanical-900 text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sandal-500/10 blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-16 text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] text-sandal-300 font-semibold">Order tracking</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-serif font-semibold">Where&apos;s my order?</h1>
          <p className="mt-3 text-[15px] text-sandal-100/75">Enter your order ID (e.g. HARP-7821) or the mobile number used at checkout.</p>
          <form onSubmit={handleSearch} className="mt-7 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Order ID or 10-digit mobile number"
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white text-botanical-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-sandal-500/30"
              />
            </div>
            <button type="submit" className="h-12 px-7 rounded-2xl bg-sandal-500 text-botanical-950 font-semibold text-sm hover:bg-sandal-300 transition-colors">
              Track order
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative">
        {/* Not found */}
        {notFound && (
          <div className="bg-white rounded-3xl p-10 text-center border border-sandal-200 shadow-sm animate-fadeIn">
            <AlertCircle className="w-11 h-11 text-sandal-500 mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-semibold text-botanical-900">We couldn&apos;t find that order</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Check the order ID in your confirmation, or try the mobile number you used at checkout.
            </p>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I need help finding my order (${query})`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-botanical-800 text-white text-sm hover:bg-botanical-900"
              >
                <MessageCircle className="w-4 h-4" /> Ask us on WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Multiple orders for a phone */}
        {phoneResults && phoneResults.length > 0 && (
          <div className="bg-white rounded-3xl border border-sandal-200 shadow-sm overflow-hidden animate-fadeIn">
            <p className="px-6 py-4 border-b border-sandal-100 text-sm text-gray-600">
              <b className="text-botanical-900">{phoneResults.length} orders</b> found for this number — pick one to track
            </p>
            <OrderList orders={phoneResults} onOpen={open} />
          </div>
        )}

        {/* Nothing searched yet */}
        {!live && !notFound && !phoneResults && (
          <div className="space-y-6 animate-fadeIn">
            {myOrders.length > 0 ? (
              <div className="bg-white rounded-3xl border border-sandal-200 shadow-sm overflow-hidden">
                <p className="px-6 py-4 border-b border-sandal-100 text-sm font-semibold text-botanical-900">Your recent orders on this device</p>
                <OrderList orders={myOrders} onOpen={open} />
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-sandal-200 shadow-sm text-center">
                <PackageCheck className="w-11 h-11 text-sandal-500 mx-auto mb-3" />
                <h3 className="font-serif text-2xl font-semibold text-botanical-900">Track in seconds</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">Your order ID is on the confirmation screen and in our WhatsApp message.</p>
                <Link href="/shop" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-botanical-800 text-botanical-900 text-sm hover:bg-botanical-800 hover:text-white">
                  <ShoppingBag className="w-4 h-4" /> Continue shopping
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Order details */}
        {live && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary */}
            <div className="bg-white rounded-3xl border border-sandal-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-serif text-3xl font-semibold text-botanical-900">Order #{live.id}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[live.status]}`}>{live.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1.5">
                    Placed {fmt(live.createdAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} ·{' '}
                    {live.items.reduce((s, i) => s + i.qty, 0)} items · ₹{live.total.toLocaleString('en-IN')} ·{' '}
                    {live.paymentMethod === 'cod' ? 'Cash on delivery' : live.paymentMethod.toUpperCase()}
                  </p>
                </div>
                {eta && (
                  <div className="rounded-2xl bg-sandal-50 border border-sandal-200 px-5 py-3 text-left md:text-right shrink-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-sandal-700 font-semibold">Expected by</p>
                    <p className="font-serif text-2xl font-semibold text-botanical-900">
                      {eta.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )}
                {live.status === 'Delivered' && reachedAt('Delivered') && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3 shrink-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700 font-semibold">Delivered on</p>
                    <p className="font-serif text-2xl font-semibold text-emerald-900">{fmt(reachedAt('Delivered')!, { day: 'numeric', month: 'short' })}</p>
                  </div>
                )}
              </div>

              {showCourier && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-white text-blue-700 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-botanical-900">Shipped with {live.courierName}</p>
                    <p className="text-xs text-gray-600 font-mono flex items-center gap-2">
                      AWB {live.trackingNumber}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(live.trackingNumber!);
                          triggerToast('Tracking number copied');
                        }}
                        className="text-gray-400 hover:text-botanical-800"
                        aria-label="Copy tracking number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </p>
                  </div>
                  {trackLink && (
                    <a
                      href={trackLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800"
                    >
                      Track on courier site <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white rounded-3xl border border-sandal-200 shadow-sm p-6 sm:p-8">
              <h3 className="font-serif text-xl font-semibold text-botanical-900 mb-7">Progress</h3>

              {live.status === 'Cancelled' ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold">This order was cancelled</p>
                    <p className="text-rose-700/80 mt-0.5">{live.statusHistory[live.statusHistory.length - 1]?.note}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop: horizontal stepper */}
                  <div className="hidden md:grid grid-cols-5 relative">
                    <div className="absolute top-6 left-[10%] right-[10%] h-[3px] bg-sandal-200 rounded-full" />
                    <div
                      className="absolute top-6 left-[10%] h-[3px] bg-botanical-800 rounded-full transition-all duration-700"
                      style={{ width: `${(Math.max(0, stepIdx) / (STEPS.length - 1)) * 80}%` }}
                    />
                    {STEPS.map((s, i) => {
                      const done = i <= stepIdx;
                      const current = i === stepIdx;
                      const Icon = s.icon;
                      const at = reachedAt(s.status);
                      return (
                        <div key={s.status} className="relative flex flex-col items-center text-center px-2">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                              done ? 'bg-botanical-800 border-botanical-800 text-white' : 'bg-white border-sandal-300 text-sandal-400'
                            } ${current ? 'ring-[6px] ring-emerald-100' : ''}`}
                          >
                            {done && !current ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                          </div>
                          <p className={`mt-3 text-sm font-semibold ${done ? 'text-botanical-900' : 'text-gray-400'}`}>{s.label}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{at ? fmt(at) : current ? s.caption : '—'}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile: vertical stepper */}
                  <ol className="md:hidden relative ml-5">
                    {STEPS.map((s, i) => {
                      const done = i <= stepIdx;
                      const Icon = s.icon;
                      const at = reachedAt(s.status);
                      return (
                        <li key={s.status} className="relative pl-9 pb-6 last:pb-0">
                          {i < STEPS.length - 1 && (
                            <span className={`absolute left-0 top-9 bottom-0 w-[3px] -translate-x-1/2 ${i < stepIdx ? 'bg-botanical-800' : 'bg-sandal-200'}`} />
                          )}
                          <span
                            className={`absolute left-0 top-0 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                              done ? 'bg-botanical-800 border-botanical-800 text-white' : 'bg-white border-sandal-300 text-sandal-400'
                            } ${i === stepIdx ? 'ring-4 ring-emerald-100' : ''}`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <p className={`text-sm font-semibold pt-1.5 ${done ? 'text-botanical-900' : 'text-gray-400'}`}>{s.label}</p>
                          <p className="text-xs text-gray-500">{at ? fmt(at) : i === stepIdx ? s.caption : 'Pending'}</p>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}

              {/* Updates */}
              <details className="mt-8 pt-6 border-t border-sandal-100 group">
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-botanical-900">
                  All updates ({live.statusHistory.length})
                  <ChevronRight className="w-4 h-4 text-sandal-600 transition-transform group-open:rotate-90" />
                </summary>
                <ol className="mt-4 space-y-4">
                  {[...live.statusHistory].reverse().map((h, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="text-xs text-gray-400 w-28 shrink-0 pt-0.5 tabular-nums">{fmt(h.timestamp)}</span>
                      <div>
                        <p className="text-sm font-medium text-botanical-900">{h.status}</p>
                        <p className="text-xs text-gray-500">{h.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </details>
            </div>

            {/* Items + address */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-3xl border border-sandal-200 shadow-sm p-6 sm:p-8">
                <h3 className="font-serif text-xl font-semibold text-botanical-900 mb-4">Items</h3>
                <div className="divide-y divide-sandal-100">
                  {live.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-sandal-50 border border-sandal-200 shrink-0">
                        <Image src={withBasePath(item.image)} alt={item.productName} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-botanical-900 line-clamp-2">{item.productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.sizeLabel} · Qty {item.qty}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-botanical-900 tabular-nums">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-sandal-200 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums">₹{live.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {live.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="tabular-nums">−₹{live.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{live.shipping === 0 ? 'Free' : `₹${live.shipping}`}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-base font-semibold text-botanical-900">
                    <span>Total</span>
                    <span className="tabular-nums">₹{live.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl border border-sandal-200 shadow-sm p-6 sm:p-8">
                  <h3 className="font-serif text-xl font-semibold text-botanical-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sandal-600" /> Delivering to
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p className="font-semibold text-botanical-900">{live.customer.fullName}</p>
                    <p>{live.customer.address}</p>
                    {live.customer.landmark && <p className="text-gray-500">Near {live.customer.landmark}</p>}
                    <p>
                      {live.customer.city}, {live.customer.state} – {live.customer.pincode}
                    </p>
                    {/* Mask the phone so a shared link doesn't expose it */}
                    <p className="mt-3 flex items-center gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5" /> ••••••{live.customer.phone.replace(/\D/g, '').slice(-4)}
                    </p>
                  </div>
                </div>

                <div className="bg-botanical-900 text-white rounded-3xl p-6 sm:p-8">
                  <h4 className="font-serif text-xl font-semibold">Need help?</h4>
                  <p className="text-sm text-sandal-100/75 mt-1.5">Questions about delivery or how to use your products — we reply fast on WhatsApp.</p>
                  {waNumber && (
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, regarding my order #${live.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sandal-500 text-botanical-950 font-semibold text-sm hover:bg-sandal-300"
                    >
                      <MessageCircle className="w-4 h-4" /> Chat about this order
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

const OrderList: React.FC<{ orders: Order[]; onOpen: (o: Order) => void }> = ({ orders, onOpen }) => (
  <div className="divide-y divide-sandal-100">
    {orders.map((o) => (
      <button key={o.id} onClick={() => onOpen(o)} className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-sandal-50 transition-colors">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sandal-50 border border-sandal-200 shrink-0">
          <Image src={withBasePath(o.items[0]?.image || '/images/hair-oil.jpg')} alt="" fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-botanical-900">#{o.id}</p>
          <p className="text-xs text-gray-500 truncate">
            {fmt(o.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items.length} items · ₹{o.total.toLocaleString('en-IN')}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_BADGE[o.status]}`}>{o.status}</span>
        <ChevronRight className="w-4 h-4 text-sandal-500" />
      </button>
    ))}
  </div>
);

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-sandal-50">
          <div className="w-10 h-10 border-4 border-botanical-800 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
