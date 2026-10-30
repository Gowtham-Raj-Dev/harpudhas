'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { Order } from '@/types/store';
import {
  DateFilter,
  ORDER_STATUSES,
  STATUS_STYLES,
  addDays,
  dateKey,
  formatDateKey,
  formatINR,
  inDateRange,
  pctChange,
  resolveDateRange,
  summarizeOrders,
  todayKey,
  yesterdayKey,
} from '@/lib/storeUtils';
import { Card, StatCard, StatusPill, Badge, cx } from './ui';
import { DispatchModal, OrderDrawer } from './OrderParts';
import { NextAction } from './OrdersTab';
import { AlertTriangle, ArrowRight, CalendarDays, Clock, IndianRupee, ShoppingCart, Users } from 'lucide-react';

export const DashboardTab: React.FC<{ openOrders: (f: DateFilter, status?: string) => void; openTab: (t: string) => void }> = ({
  openOrders,
  openTab,
}) => {
  const { orders, products, customers, siteSettings } = useStore();
  const [viewing, setViewing] = useState<Order | null>(null);
  const [dispatching, setDispatching] = useState<Order | null>(null);
  const [hoverDay, setHoverDay] = useState<string | null>(null);

  const byDay = (k: string) => orders.filter((o) => dateKey(o.createdAt) === k);
  const today = summarizeOrders(byDay(todayKey()));
  const yesterday = summarizeOrders(byDay(yesterdayKey()));
  const month = summarizeOrders(orders.filter((o) => inDateRange(o.createdAt, resolveDateRange({ preset: 'month' }))));

  // Last 14 days series
  const series = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => dateKey(addDays(new Date(), i - 13)));
    return days.map((k) => {
      const list = orders.filter((o) => dateKey(o.createdAt) === k);
      const s = summarizeOrders(list);
      return { key: k, count: s.count, revenue: s.revenue };
    });
  }, [orders]);
  const maxCount = Math.max(1, ...series.map((d) => d.count));

  const pipeline = ORDER_STATUSES.map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length }));
  const actionable = orders
    .filter((o) => ['Pending', 'Confirmed', 'Processing'].includes(o.status))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, 6);

  const lowStock = products.filter((p) => typeof p.stock === 'number' && p.stock <= siteSettings.lowStockThreshold);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((o) =>
        o.items.forEach((i) => {
          const prev = map.get(i.productId) || { name: i.productName, image: i.image, qty: 0, revenue: 0 };
          map.set(i.productId, { ...prev, qty: prev.qty + i.qty, revenue: prev.revenue + i.price * i.qty });
        })
      );
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  const hovered = series.find((d) => d.key === hoverDay);
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <div className="animate-fadeIn space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">{greeting} 👋</h1>
          <p className="text-sm text-slate-500 mt-1">{formatDateKey(todayKey())} · here is how the store is doing</p>
        </div>
        <label className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 cursor-pointer w-fit">
          <CalendarDays className="w-4 h-4" />
          Jump to a day
          <input
            type="date"
            max={todayKey()}
            onChange={(e) => e.target.value && openOrders({ preset: 'date', date: e.target.value })}
            className="outline-none bg-transparent text-sm cursor-pointer"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's orders"
          value={today.count}
          delta={pctChange(today.count, yesterday.count)}
          sub="vs yesterday"
          icon={<ShoppingCart className="w-4 h-4" />}
          tone="sky"
          onClick={() => openOrders({ preset: 'today' })}
        />
        <StatCard
          label="Today's revenue"
          value={formatINR(today.revenue)}
          delta={pctChange(today.revenue, yesterday.revenue)}
          sub="vs yesterday"
          icon={<IndianRupee className="w-4 h-4" />}
          tone="emerald"
          onClick={() => openOrders({ preset: 'today' })}
        />
        <StatCard
          label="Yesterday"
          value={yesterday.count}
          sub={`${formatINR(yesterday.revenue)} revenue`}
          icon={<CalendarDays className="w-4 h-4" />}
          tone="violet"
          onClick={() => openOrders({ preset: 'yesterday' })}
        />
        <StatCard
          label="Pending confirmation"
          value={pipeline[0].count}
          sub="across all days"
          icon={<Clock className="w-4 h-4" />}
          tone="amber"
          onClick={() => openOrders({ preset: 'all' }, 'Pending')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* 14-day chart */}
        <Card className="xl:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Orders per day · last 14 days</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click a bar to open that day&apos;s orders</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">This month</p>
              <p className="text-sm font-semibold text-slate-900 tabular-nums">
                {month.count} orders · {formatINR(month.revenue)}
              </p>
            </div>
          </div>

          <div className="relative">
            {hovered && (
              <div className="absolute -top-2 right-0 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs shadow-lg pointer-events-none z-10">
                <p className="font-semibold">{formatDateKey(hovered.key)}</p>
                <p className="text-slate-300 tabular-nums">
                  {hovered.count} orders · {formatINR(hovered.revenue)}
                </p>
              </div>
            )}
            <div className="h-48 flex items-end gap-1.5 border-b border-slate-200" role="img" aria-label="Orders per day for the last 14 days">
              {series.map((d) => {
                const isToday = d.key === todayKey();
                return (
                  <button
                    key={d.key}
                    type="button"
                    onMouseEnter={() => setHoverDay(d.key)}
                    onMouseLeave={() => setHoverDay(null)}
                    onFocus={() => setHoverDay(d.key)}
                    onBlur={() => setHoverDay(null)}
                    onClick={() => openOrders({ preset: 'date', date: d.key })}
                    aria-label={`${formatDateKey(d.key)}: ${d.count} orders`}
                    className="group flex-1 h-full flex flex-col justify-end items-center"
                  >
                    {d.count > 0 && <span className="text-[10px] text-slate-500 tabular-nums mb-1">{d.count}</span>}
                    <span
                      className={cx(
                        'w-full max-w-[28px] rounded-t-[4px] transition-colors',
                        d.count === 0 ? 'bg-slate-100 h-[3px]' : isToday ? 'bg-emerald-700' : 'bg-emerald-500/70 group-hover:bg-emerald-600'
                      )}
                      style={d.count ? { height: `${(d.count / maxCount) * 80}%` } : undefined}
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1.5 mt-2">
              {series.map((d, i) => (
                <span key={d.key} className="flex-1 text-center text-[10px] text-slate-400 tabular-nums">
                  {i % 2 === 1 || d.key === todayKey()
                    ? d.key === todayKey()
                      ? 'Today'
                      : new Date(`${d.key}T00:00:00`).getDate()
                    : ''}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Pipeline */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Fulfilment pipeline</h3>
          <div className="space-y-2.5">
            {pipeline.map(({ status, count }) => (
              <button
                key={status}
                onClick={() => openOrders({ preset: 'all' }, status)}
                className="w-full flex items-center gap-3 group"
              >
                <span className={cx('w-2 h-2 rounded-full', STATUS_STYLES[status].dot)} />
                <span className="text-sm text-slate-600 flex-1 text-left group-hover:text-slate-900">{status}</span>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">{count}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
              </button>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <button onClick={() => openTab('customers')} className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100">
              <Users className="w-4 h-4 text-slate-500" />
              <p className="text-lg font-semibold text-slate-900 mt-1 tabular-nums">{customers.length}</p>
              <p className="text-[11px] text-slate-500">Customers</p>
            </button>
            <button onClick={() => openTab('products')} className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100">
              <ShoppingCart className="w-4 h-4 text-slate-500" />
              <p className="text-lg font-semibold text-slate-900 mt-1 tabular-nums">{products.filter((p) => p.isVisible !== false).length}</p>
              <p className="text-[11px] text-slate-500">Live products</p>
            </button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card padded={false} className="xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Needs your attention</h3>
            <button onClick={() => openOrders({ preset: 'all' })} className="text-xs font-medium text-emerald-700 hover:underline">
              All orders →
            </button>
          </div>
          {actionable.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">All caught up — no orders waiting.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {actionable.map((o) => (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                  <button onClick={() => setViewing(o)} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      <span className="font-mono text-emerald-800">#{o.id}</span> · {o.customer.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateKey(dateKey(o.createdAt))} · {o.items.length} items · {formatINR(o.total)}
                    </p>
                  </button>
                  <StatusPill status={o.status} />
                  <NextAction order={o} onDispatch={setDispatching} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Top sellers</h3>
            {topProducts.length === 0 && <p className="text-xs text-slate-500">No sales yet.</p>}
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 w-4">{i + 1}</span>
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <Image src={withBasePath(p.image)} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.qty} sold</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 tabular-nums">{formatINR(p.revenue)}</span>
                </div>
              ))}
            </div>
          </Card>

          {lowStock.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/40">
              <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Low stock
              </h3>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((p) => (
                  <button key={p.id} onClick={() => openTab('products')} className="w-full flex items-center justify-between text-left">
                    <span className="text-xs text-slate-700 truncate pr-2">{p.name}</span>
                    <Badge tone={p.stock === 0 ? 'rose' : 'amber'}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</Badge>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <OrderDrawer order={viewing} onClose={() => setViewing(null)} onDispatch={setDispatching} />
      <DispatchModal order={dispatching} onClose={() => setDispatching(null)} />
    </div>
  );
};
