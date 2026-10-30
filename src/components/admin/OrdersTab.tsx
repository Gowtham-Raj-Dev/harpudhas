'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  DateFilter,
  ORDER_STATUSES,
  dateKey,
  describeDateFilter,
  downloadCSV,
  formatDateKey,
  formatINR,
  inDateRange,
  resolveDateRange,
  summarizeOrders,
  todayKey,
  yesterdayKey,
} from '@/lib/storeUtils';
import { Button, Card, EmptyState, IconButton, PageHeader, SegmentedTabs, StatCard, StatusPill, cx } from './ui';
import { DateFilterBar, DispatchModal, OrderDrawer, StatusDropdown, statusOptions } from './OrderParts';
import { Download, Eye, IndianRupee, PackageCheck, Search, ShoppingCart, Clock, X } from 'lucide-react';

export const OrdersTab: React.FC<{ initialFilter?: DateFilter; initialStatus?: string }> = ({ initialFilter, initialStatus }) => {
  const { orders, updateOrderStatus } = useStore();
  const [dateFilter, setDateFilter] = useState<DateFilter>(initialFilter ?? { preset: 'today' });
  const [status, setStatus] = useState<string>(initialStatus ?? 'all');
  const [payment, setPayment] = useState('all');
  const [sort, setSort] = useState('newest');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Order | null>(null);
  const [dispatching, setDispatching] = useState<Order | null>(null);

  const range = resolveDateRange(dateFilter);
  const inPeriod = useMemo(() => orders.filter((o) => inDateRange(o.createdAt, range)), [orders, range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = inPeriod.filter((o) => {
      if (status !== 'all' && o.status !== status) return false;
      if (payment !== 'all' && (payment === 'cod' ? o.paymentMethod !== 'cod' : o.paymentMethod === 'cod')) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q) ||
        o.customer.pincode.includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    });
    return [...list].sort((a, b) => {
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sort === 'high') return b.total - a.total;
      if (sort === 'low') return a.total - b.total;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [inPeriod, status, payment, query, sort]);

  // Group rows by calendar day so every date shows its own count & revenue
  const groups = useMemo(() => {
    const map = new Map<string, Order[]>();
    filtered.forEach((o) => {
      const k = dateKey(o.createdAt);
      map.set(k, [...(map.get(k) || []), o]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const stats = summarizeOrders(inPeriod);
  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, inPeriod.filter((o) => o.status === s).length]));

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));

  const bulkUpdate = (s: OrderStatus) => {
    selected.forEach((id) => updateOrderStatus(id, s, `Bulk updated to ${s} by admin`));
    setSelected(new Set());
  };

  const exportCSV = () =>
    downloadCSV(`orders-${range.from ?? 'all'}-${range.to ?? 'all'}.csv`, [
      ['Order ID', 'Date', 'Customer', 'Phone', 'Email', 'City', 'State', 'Pincode', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Total', 'Payment', 'Status', 'Courier', 'Tracking'],
      ...filtered.map((o) => [
        o.id,
        new Date(o.createdAt).toLocaleString('en-IN'),
        o.customer.fullName,
        o.customer.phone,
        o.customer.email || '',
        o.customer.city,
        o.customer.state,
        o.customer.pincode,
        o.items.map((i) => `${i.productName} (${i.sizeLabel}) x${i.qty}`).join('; '),
        o.subtotal,
        o.discount,
        o.shipping,
        o.total,
        o.paymentMethod.toUpperCase(),
        o.status,
        o.courierName || '',
        o.trackingNumber || '',
      ]),
    ]);

  const dayLabel = (k: string) => (k === todayKey() ? 'Today' : k === yesterdayKey() ? 'Yesterday' : formatDateKey(k));

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Orders"
        subtitle={`${describeDateFilter(dateFilter)} · ${stats.count} orders`}
        actions={
          <Button icon={<Download className="w-4 h-4" />} onClick={exportCSV} disabled={!filtered.length}>
            Export CSV
          </Button>
        }
      />

      <Card className="mb-5">
        <DateFilterBar value={dateFilter} onChange={setDateFilter} />
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Orders" value={stats.count} sub={`${stats.items} items sold`} icon={<ShoppingCart className="w-4 h-4" />} tone="sky" />
        <StatCard label="Revenue" value={formatINR(stats.revenue)} sub={stats.cancelled ? `${stats.cancelled} cancelled excluded` : 'Excl. cancelled'} icon={<IndianRupee className="w-4 h-4" />} tone="emerald" />
        <StatCard label="Avg. order value" value={formatINR(stats.avg)} sub={`${stats.cod} COD · ${stats.prepaid} prepaid`} icon={<PackageCheck className="w-4 h-4" />} tone="violet" />
        <StatCard
          label="Needs action"
          value={stats.pending}
          sub="Pending confirmation"
          icon={<Clock className="w-4 h-4" />}
          tone="amber"
          onClick={() => setStatus('Pending')}
        />
      </div>

      <Card padded={false}>
        <div className="p-4 border-b border-slate-100 space-y-3">
          <SegmentedTabs
            value={status}
            onChange={setStatus}
            options={[{ value: 'all', label: 'All', count: inPeriod.length }, ...ORDER_STATUSES.map((s) => ({ value: s, label: s, count: statusCounts[s] }))]}
          />
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order ID, customer, phone, city, pincode, product…"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
              />
            </div>
            <Dropdown
              className="md:w-44"
              value={payment}
              onChange={setPayment}
              options={[
                { value: 'all', label: 'All payments' },
                { value: 'cod', label: 'Cash on delivery' },
                { value: 'prepaid', label: 'Prepaid (UPI/Card)' },
              ]}
            />
            <Dropdown
              className="md:w-44"
              value={sort}
              onChange={setSort}
              options={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
                { value: 'high', label: 'Amount: high → low' },
                { value: 'low', label: 'Amount: low → high' },
              ]}
            />
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 text-sm">
            <span className="font-medium text-emerald-900">{selected.size} selected</span>
            <span className="text-emerald-700/60">Move to</span>
            <Dropdown<OrderStatus>
              size="sm"
              className="w-40"
              placeholder="Choose status"
              value={'' as OrderStatus}
              options={statusOptions}
              onChange={bulkUpdate}
            />
            <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-emerald-800 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="w-5 h-5" />}
            title={`No orders for ${describeDateFilter(dateFilter).toLowerCase()}`}
            description="Try another date, a wider range, or clear the filters."
            action={<Button onClick={() => { setDateFilter({ preset: 'all' }); setStatus('all'); setQuery(''); }}>Show all orders</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="pl-4 pr-2 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => setSelected(allSelected ? new Set() : new Set(filtered.map((o) => o.id)))}
                      className="accent-emerald-700"
                    />
                  </th>
                  <th className="px-3 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold text-right">Total</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Next step</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {groups.map(([day, list]) => {
                  const s = summarizeOrders(list);
                  return (
                    <React.Fragment key={day}>
                      <tr className="bg-slate-50/80">
                        <td colSpan={8} className="px-4 py-2 border-y border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">{dayLabel(day)}</span>
                            <span className="text-slate-500">
                              <b className="text-slate-800">{s.count}</b> orders · <b className="text-slate-800">{formatINR(s.revenue)}</b>
                            </span>
                          </div>
                        </td>
                      </tr>
                      {list.map((o) => (
                        <tr key={o.id} className={cx('border-b border-slate-100 hover:bg-slate-50/60', selected.has(o.id) && 'bg-emerald-50/40')}>
                          <td className="pl-4 pr-2 py-3">
                            <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleRow(o.id)} className="accent-emerald-700" />
                          </td>
                          <td className="px-3 py-3">
                            <button onClick={() => setViewing(o)} className="font-mono text-[13px] font-semibold text-emerald-800 hover:underline">
                              #{o.id}
                            </button>
                            <p className="text-[11px] text-slate-400">
                              {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-medium text-slate-900">{o.customer.fullName}</p>
                            <p className="text-xs text-slate-500">
                              {o.customer.phone} · {o.customer.city}
                            </p>
                          </td>
                          <td className="px-3 py-3 max-w-[220px]">
                            <p className="text-xs text-slate-600 truncate">{o.items.map((i) => `${i.productName} ×${i.qty}`).join(', ')}</p>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <p className="font-semibold text-slate-900 tabular-nums">{formatINR(o.total)}</p>
                            <p className="text-[11px] text-slate-400 uppercase">{o.paymentMethod}</p>
                          </td>
                          <td className="px-3 py-3">
                            <StatusDropdown order={o} onDispatch={setDispatching} />
                          </td>
                          <td className="px-3 py-3">
                            <NextAction order={o} onDispatch={setDispatching} />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <IconButton onClick={() => setViewing(o)} title="View details">
                              <Eye className="w-4 h-4" />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <OrderDrawer order={viewing} onClose={() => setViewing(null)} onDispatch={setDispatching} />
      <DispatchModal order={dispatching} onClose={() => setDispatching(null)} />
    </div>
  );
};

export const NextAction: React.FC<{ order: Order; onDispatch: (o: Order) => void }> = ({ order, onDispatch }) => {
  const { updateOrderStatus } = useStore();
  const btn = 'h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors';
  switch (order.status) {
    case 'Pending':
      return (
        <button className={cx(btn, 'bg-emerald-700 text-white hover:bg-emerald-800')} onClick={() => updateOrderStatus(order.id, 'Confirmed', 'Order confirmed by admin')}>
          Confirm
        </button>
      );
    case 'Confirmed':
      return (
        <button className={cx(btn, 'bg-sky-600 text-white hover:bg-sky-700')} onClick={() => updateOrderStatus(order.id, 'Processing', 'Packed with tamper seal')}>
          Start packing
        </button>
      );
    case 'Processing':
      return (
        <button className={cx(btn, 'bg-blue-600 text-white hover:bg-blue-700')} onClick={() => onDispatch(order)}>
          Dispatch
        </button>
      );
    case 'Shipped':
      return (
        <button className={cx(btn, 'bg-teal-600 text-white hover:bg-teal-700')} onClick={() => updateOrderStatus(order.id, 'Delivered', 'Delivered to customer')}>
          Mark delivered
        </button>
      );
    default:
      return <StatusPill status={order.status} />;
  }
};
