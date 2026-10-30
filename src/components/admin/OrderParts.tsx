'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { Order, OrderStatus } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  DateFilter,
  DatePreset,
  ORDER_STATUSES,
  STATUS_STYLES,
  formatDateTime,
  formatINR,
  todayKey,
} from '@/lib/storeUtils';
import { Button, Card, Drawer, Field, Input, Modal, StatusPill, cx } from './ui';
import { trackingUrl } from '@/lib/webhook';
import { CalendarDays, MapPin, Phone, Mail, Printer, Truck, MessageCircle, Trash2 } from 'lucide-react';

// ---------- Date filter bar ----------

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
];

export const DateFilterBar: React.FC<{ value: DateFilter; onChange: (f: DateFilter) => void }> = ({ value, onChange }) => {
  const dateInput =
    'h-9 px-3 rounded-xl border text-xs font-medium outline-none transition-all focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex p-1 rounded-xl bg-slate-100 gap-0.5 overflow-x-auto max-w-full">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ preset: p.value })}
            className={cx(
              'px-3 h-7 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              value.preset === p.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label
        className={cx(
          'relative inline-flex items-center gap-2 h-9 pl-3 pr-1 rounded-xl border bg-white text-xs font-medium cursor-pointer',
          value.preset === 'date' ? 'border-emerald-600 text-emerald-800 ring-4 ring-emerald-600/10' : 'border-slate-200 text-slate-600'
        )}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        <span>Pick day</span>
        <input
          type="date"
          max={todayKey()}
          value={value.preset === 'date' ? value.date || '' : ''}
          onChange={(e) => e.target.value && onChange({ preset: 'date', date: e.target.value })}
          className="h-7 px-1.5 rounded-lg bg-transparent text-xs outline-none cursor-pointer"
        />
      </label>

      <div
        className={cx(
          'inline-flex items-center gap-1.5 h-9 px-2 rounded-xl border bg-white text-xs',
          value.preset === 'range' ? 'border-emerald-600 ring-4 ring-emerald-600/10' : 'border-slate-200'
        )}
      >
        <span className="pl-1 text-slate-500 font-medium">Range</span>
        <input
          type="date"
          max={todayKey()}
          value={value.preset === 'range' ? value.from || '' : ''}
          onChange={(e) => onChange({ preset: 'range', from: e.target.value, to: value.preset === 'range' ? value.to : undefined })}
          className={cx(dateInput, 'h-7 border-slate-200')}
        />
        <span className="text-slate-400">→</span>
        <input
          type="date"
          max={todayKey()}
          value={value.preset === 'range' ? value.to || '' : ''}
          onChange={(e) => onChange({ preset: 'range', from: value.preset === 'range' ? value.from : undefined, to: e.target.value })}
          className={cx(dateInput, 'h-7 border-slate-200')}
        />
      </div>
    </div>
  );
};

// ---------- Status dropdown ----------

export const statusOptions = ORDER_STATUSES.map((s) => ({ value: s, label: s, dot: STATUS_STYLES[s].dot }));

export const StatusDropdown: React.FC<{ order: Order; onDispatch: (o: Order) => void }> = ({ order, onDispatch }) => {
  const { updateOrderStatus } = useStore();
  return (
    <Dropdown<OrderStatus>
      size="sm"
      className="w-36"
      minWidth={170}
      value={order.status}
      options={statusOptions}
      onChange={(s) => {
        if (s === order.status) return;
        if (s === 'Shipped' && !order.trackingNumber) onDispatch(order);
        else updateOrderStatus(order.id, s, `Status changed to ${s} by admin`);
      }}
    />
  );
};

// ---------- Dispatch modal ----------

export const DispatchModal: React.FC<{ order: Order | null; onClose: () => void }> = ({ order, onClose }) => {
  const { updateOrderStatus, integrations } = useStore();
  const partners = integrations.deliveryPartners.filter((p) => p.enabled);
  const courierOptions = Array.from(
    new Set([...partners.map((p) => p.provider), 'Delhivery Express', 'BlueDart', 'DTDC', 'India Post', 'Ekart', 'XpressBees', 'Shadowfax', 'Local Delivery'])
  );
  const [courier, setCourier] = useState(partners.find((p) => p.isDefault)?.provider ?? partners[0]?.provider ?? 'Delhivery Express');
  const [tracking, setTracking] = useState('');
  const defaultCourier = partners.find((p) => p.isDefault)?.provider ?? partners[0]?.provider;
  useEffect(() => {
    if (order && defaultCourier) setCourier(defaultCourier);
  }, [order, defaultCourier]);

  const confirm = () => {
    if (!order) return;
    const awb = tracking.trim() || `AWB${Math.floor(10000000 + Math.random() * 90000000)}`;
    updateOrderStatus(order.id, 'Shipped', `Dispatched via ${courier} (AWB: ${awb})`, { courierName: courier, trackingNumber: awb });
    setTracking('');
    onClose();
  };

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title={`Dispatch order #${order?.id ?? ''}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={<Truck className="w-4 h-4" />} onClick={confirm}>
            Mark as shipped
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Courier partner">
          <Dropdown
            value={courier}
            onChange={setCourier}
            options={courierOptions.map((c) => ({
              value: c,
              label: c,
              hint: partners.some((p) => p.provider === c) ? (partners.find((p) => p.provider === c)?.isDefault ? 'default' : 'connected') : undefined,
            }))}
          />
        </Field>
        <Field label="Tracking / AWB number" hint="Leave empty to auto-generate one">
          <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. 1234567890" />
        </Field>
      </div>
    </Modal>
  );
};

// ---------- Order detail drawer ----------

export const OrderDrawer: React.FC<{ order: Order | null; onClose: () => void; onDispatch: (o: Order) => void }> = ({
  order,
  onClose,
  onDispatch,
}) => {
  const { orders, deleteOrder, integrations } = useStore();
  // Always show the latest copy from the store
  const live = order ? orders.find((o) => o.id === order.id) ?? order : null;
  if (!live) return null;
  const c = live.customer;
  const wa = c.phone.replace(/\D/g, '');

  const printInvoice = () => {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    const rows = live.items
      .map((i) => `<tr><td>${i.productName}<br/><small>${i.sizeLabel}</small></td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price * i.qty}</td></tr>`)
      .join('');
    w.document.write(`<html><head><title>Invoice ${live.id}</title><style>
      body{font-family:system-ui,sans-serif;padding:32px;color:#0f172a}h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:24px}
      td,th{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:13px}small{color:#64748b}.r{text-align:right}
      .tot td{border:none;padding:4px 10px}</style></head><body>
      <h1>Hàrpudha's</h1><small>Tax invoice · Order #${live.id} · ${formatDateTime(live.createdAt)}</small>
      <p><b>${c.fullName}</b><br/>${c.address}${c.landmark ? ', ' + c.landmark : ''}<br/>${c.city}, ${c.state} - ${c.pincode}<br/>${c.phone}</p>
      <table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>${rows}</table>
      <table class="tot"><tr><td class="r">Subtotal</td><td class="r">₹${live.subtotal}</td></tr>
      <tr><td class="r">Discount</td><td class="r">-₹${live.discount}</td></tr>
      <tr><td class="r">Shipping</td><td class="r">₹${live.shipping}</td></tr>
      <tr><td class="r"><b>Total (${live.paymentMethod.toUpperCase()})</b></td><td class="r"><b>₹${live.total}</b></td></tr></table>
      <script>window.print()</script></body></html>`);
    w.document.close();
  };

  return (
    <Drawer
      open={!!order}
      onClose={onClose}
      title={`Order #${live.id}`}
      subtitle={formatDateTime(live.createdAt)}
      footer={
        <>
          <Button
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              if (confirm(`Delete order #${live.id}? This cannot be undone.`)) {
                deleteOrder(live.id);
                onClose();
              }
            }}
          >
            Delete
          </Button>
          <div className="flex-1" />
          <Button icon={<Printer className="w-4 h-4" />} onClick={printInvoice}>
            Print invoice
          </Button>
          {live.status === 'Processing' && (
            <Button variant="primary" icon={<Truck className="w-4 h-4" />} onClick={() => onDispatch(live)}>
              Dispatch
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StatusPill status={live.status} />
            <span className="text-xs text-slate-500 uppercase font-medium">{live.paymentMethod === 'cod' ? 'Cash on delivery' : live.paymentMethod.toUpperCase()}</span>
          </div>
          <StatusDropdown order={live} onDispatch={onDispatch} />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Customer</p>
            <p className="font-semibold text-slate-900">{c.fullName}</p>
            <div className="mt-2 space-y-1.5 text-sm text-slate-600">
              <a href={`tel:${wa}`} className="flex items-center gap-2 hover:text-emerald-700">
                <Phone className="w-3.5 h-3.5" /> {c.phone}
              </a>
              {c.email && (
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:text-emerald-700 break-all">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> {c.email}
                </a>
              )}
              <a
                href={`https://wa.me/${wa.length === 10 ? '91' + wa : wa}?text=${encodeURIComponent(`Hi ${c.fullName}, regarding your Hàrpudha's order #${live.id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-emerald-700 font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp customer
              </a>
            </div>
          </Card>
          <Card>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Ship to</p>
            <p className="text-sm text-slate-700 leading-relaxed flex gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
              <span>
                {c.address}
                {c.landmark && <>, {c.landmark}</>}
                <br />
                {c.city}, {c.state} – {c.pincode}
              </span>
            </p>
            {c.notes && <p className="mt-3 text-xs bg-amber-50 text-amber-800 rounded-lg px-3 py-2">Note: {c.notes}</p>}
            {live.trackingNumber && (
              <p className="mt-3 text-xs text-slate-600">
                <Truck className="w-3.5 h-3.5 inline mr-1" />
                {live.courierName} · <span className="font-mono">{live.trackingNumber}</span>
                {(() => {
                  const tpl = integrations.deliveryPartners.find((p) => live.courierName?.startsWith(p.provider))?.trackingUrlTemplate;
                  const url = trackingUrl(tpl, live.trackingNumber);
                  return url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="ml-2 text-emerald-700 font-medium hover:underline">
                      Track →
                    </a>
                  ) : null;
                })()}
              </p>
            )}
          </Card>
        </div>

        <Card padded={false}>
          <div className="px-5 py-3 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Items ({live.items.reduce((s, i) => s + i.qty, 0)})
          </div>
          <div className="divide-y divide-slate-100">
            {live.items.map((i, idx) => (
              <div key={idx} className="flex items-center gap-3 px-5 py-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <Image src={withBasePath(i.image)} alt={i.productName} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{i.productName}</p>
                  <p className="text-xs text-slate-500">
                    {i.sizeLabel} · {i.qty} × {formatINR(i.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">{formatINR(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-slate-50/70 rounded-b-2xl space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="tabular-nums">{formatINR(live.subtotal)}</span></div>
            {live.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span className="tabular-nums">-{formatINR(live.discount)}</span></div>}
            <div className="flex justify-between text-slate-600"><span>Shipping</span><span className="tabular-nums">{live.shipping ? formatINR(live.shipping) : 'Free'}</span></div>
            <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t border-slate-200"><span>Total</span><span className="tabular-nums">{formatINR(live.total)}</span></div>
          </div>
        </Card>

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Timeline</p>
          <ol className="relative border-l border-slate-200 ml-1.5 space-y-4">
            {[...live.statusHistory].reverse().map((h, i) => (
              <li key={i} className="pl-5 relative">
                <span className={cx('absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white', STATUS_STYLES[h.status].dot)} />
                <p className="text-sm font-medium text-slate-800">{h.status}</p>
                <p className="text-xs text-slate-500">{h.note}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(h.timestamp)}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </Drawer>
  );
};
