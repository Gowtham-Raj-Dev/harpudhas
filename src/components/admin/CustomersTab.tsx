'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { CustomerRecord, Order, VisitorJourney } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import { STATUS_STYLES, dateKey, downloadCSV, formatDateKey, formatINR, normalizePhone, todayKey } from '@/lib/storeUtils';
import { timeAgo } from '@/lib/journey';
import { Badge, Button, Card, Drawer, EmptyState, Field, Input, Modal, PageHeader, StatCard, StatusPill, Textarea, cx } from './ui';
import { DispatchModal, OrderDrawer } from './OrderParts';
import {
  Download,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  Repeat,
  Crown,
  IndianRupee,
  LogIn,
  ShoppingCart,
  CreditCard,
  PackageCheck,
} from 'lucide-react';

const PRESET_TAGS = ['VIP', 'Wholesale', 'Repeat buyer', 'Influencer', 'Needs follow-up', 'Do not call'];

type CustomerStage = 'logged_in' | 'added_to_cart' | 'checkout' | 'ordered' | 'none';

const STAGE_META: Record<CustomerStage, { label: string; pill: string; dot: string }> = {
  logged_in: { label: 'Logged in', pill: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  added_to_cart: { label: 'Added to cart', pill: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  checkout: { label: 'At checkout', pill: 'bg-orange-50 text-orange-800 ring-orange-200', dot: 'bg-orange-500' },
  ordered: { label: 'Ordered', pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
  none: { label: 'No activity', pill: 'bg-white text-slate-500 ring-slate-200', dot: 'bg-slate-300' },
};

const SEGMENT_LABELS: Record<string, string> = {
  all: 'All customers',
  logged_in: 'Just logged in',
  added_to_cart: 'Added to cart',
  checkout: 'At checkout',
  ordered: 'Ordered (last stage)',
  ordered_today: 'Ordered today',
  repeat: 'Repeat (2+ orders)',
  vip: 'VIP tagged',
  new: 'One order only',
  none: 'No orders yet',
  leads: 'Leads (not in book yet)',
  inactive: 'Inactive 60+ days',
};

interface CustomerRow extends CustomerRecord {
  orders: Order[];
  orderCount: number;
  spent: number;
  lastOrder: string | null;
  stage: CustomerStage;
  lastActive: string;
  cartValue: number;
  cartItems: string;
  orderedToday: boolean;
  isLead: boolean;
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const CustomersTab: React.FC = () => {
  const { customers, orders, journeys, upsertCustomer, updateCustomer, deleteCustomer } = useStore();
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [city, setCity] = useState('all');
  const [sort, setSort] = useState('recent');
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [dispatching, setDispatching] = useState<Order | null>(null);

  const rows: CustomerRow[] = useMemo(() => {
    const byPhone = new Map<string, Order[]>();
    orders.forEach((o) => {
      const id = normalizePhone(o.customer.phone);
      byPhone.set(id, [...(byPhone.get(id) || []), o]);
    });
    // Latest journey per phone number
    const journeyByPhone = new Map<string, VisitorJourney>();
    journeys.forEach((j) => {
      if (!j.phone) return;
      const prev = journeyByPhone.get(j.phone);
      if (!prev || j.lastSeen > prev.lastSeen) journeyByPhone.set(j.phone, j);
    });

    const build = (c: CustomerRecord, isLead: boolean): CustomerRow => {
      const list = (byPhone.get(c.id) || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const valid = list.filter((o) => o.status !== 'Cancelled');
      const lastOrder = list[0]?.createdAt ?? null;
      const j = journeyByPhone.get(c.id);
      const shopping = j && j.cart.length > 0 && ['added_to_cart', 'checkout_started', 'details_entered'].includes(j.stage) && (!lastOrder || j.lastSeen > lastOrder);
      const stage: CustomerStage = shopping
        ? j!.stage === 'added_to_cart'
          ? 'added_to_cart'
          : 'checkout'
        : list.length
        ? 'ordered'
        : j || c.source === 'signup'
        ? 'logged_in'
        : 'none';
      return {
        ...c,
        orders: list,
        orderCount: list.length,
        spent: valid.reduce((s, o) => s + o.total, 0),
        lastOrder,
        stage,
        lastActive: [j?.lastSeen, lastOrder, c.createdAt].filter(Boolean).sort().pop()!,
        cartValue: shopping ? j!.cartValue : 0,
        cartItems: shopping ? j!.cart.map((x) => `${x.name} ×${x.qty}`).join(', ') : '',
        orderedToday: list.some((o) => dateKey(o.createdAt) === todayKey()),
        isLead,
      };
    };

    const book = customers.map((c) => build(c, false));
    // People who signed in or typed their phone at checkout but aren't in the book yet
    const leads = Array.from(journeyByPhone.values())
      .filter((j) => !customers.some((c) => c.id === j.phone))
      .map((j) =>
        build(
          {
            id: j.phone!,
            fullName: j.fullName || `+91 ${j.phone}`,
            phone: j.phone!,
            email: j.email,
            city: j.city,
            tags: [],
            notes: j.followUp.note,
            createdAt: j.firstSeen,
            source: 'signup',
          },
          true
        )
      );
    return [...book, ...leads];
  }, [customers, orders, journeys]);

  const cities = useMemo(() => Array.from(new Set(rows.map((r) => r.city).filter(Boolean) as string[])).sort(), [rows]);
  const sixtyDaysAgo = Date.now() - 60 * 86400000;

  const inSegment = (r: CustomerRow, s: string) => {
    switch (s) {
      case 'logged_in':
      case 'added_to_cart':
      case 'checkout':
      case 'ordered':
        return r.stage === s;
      case 'ordered_today':
        return r.orderedToday;
      case 'repeat':
        return r.orderCount > 1;
      case 'vip':
        return r.tags.includes('VIP');
      case 'new':
        return r.orderCount === 1;
      case 'none':
        return r.orderCount === 0;
      case 'leads':
        return r.isLead;
      case 'inactive':
        return !!r.lastOrder && new Date(r.lastOrder).getTime() < sixtyDaysAgo;
      default:
        return true;
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (q && !`${r.fullName} ${r.phone} ${r.email ?? ''} ${r.city ?? ''} ${r.pincode ?? ''} ${r.cartItems}`.toLowerCase().includes(q)) return false;
      if (city !== 'all' && r.city !== city) return false;
      return inSegment(r, segment);
    });
    return list.sort((a, b) => {
      if (sort === 'spent') return b.spent - a.spent;
      if (sort === 'orders') return b.orderCount - a.orderCount;
      if (sort === 'name') return a.fullName.localeCompare(b.fullName);
      if (sort === 'joined') return b.createdAt.localeCompare(a.createdAt);
      if (sort === 'cart') return b.cartValue - a.cartValue;
      if (sort === 'active') return b.lastActive.localeCompare(a.lastActive);
      return (b.lastOrder ?? '').localeCompare(a.lastOrder ?? '');
    });
  }, [rows, query, segment, city, sort, sixtyDaysAgo]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = (s: string) => rows.filter((r) => inSegment(r, s)).length;
  const sumCart = (s: string) => rows.filter((r) => inSegment(r, s)).reduce((n, r) => n + r.cartValue, 0);
  const repeatCount = count('repeat');
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
  const buyers = rows.filter((r) => r.orderCount > 0).length;
  const todayOrders = orders.filter((o) => dateKey(o.createdAt) === todayKey());
  const open = rows.find((r) => r.id === openId) || null;
  const pick = (s: string, sortBy?: string) => {
    setSegment(s);
    if (sortBy) setSort(sortBy);
  };

  const exportCSV = () =>
    downloadCSV('customers.csv', [
      ['Name', 'Phone', 'Stage', 'Cart value', 'Cart items', 'Email', 'Address', 'City', 'State', 'Pincode', 'Orders', 'Total spent', 'Last order', 'Tags', 'Notes', 'Customer since'],
      ...filtered.map((r) => [
        r.fullName,
        r.phone,
        STAGE_META[r.stage].label,
        r.cartValue || '',
        r.cartItems,
        r.email || '',
        r.address || '',
        r.city || '',
        r.state || '',
        r.pincode || '',
        r.orderCount,
        r.spent,
        r.lastOrder ? new Date(r.lastOrder).toLocaleDateString('en-IN') : '',
        r.tags.join('; '),
        r.notes,
        new Date(r.createdAt).toLocaleDateString('en-IN'),
      ]),
    ]);

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Customers"
        subtitle="Your customer book — saved separately from orders, with notes and tags"
        actions={
          <>
            <Button icon={<Download className="w-4 h-4" />} onClick={exportCSV}>
              Export CSV
            </Button>
            <Button variant="primary" icon={<UserPlus className="w-4 h-4" />} onClick={() => setAdding(true)}>
              Add customer
            </Button>
          </>
        }
      />

      {(() => {
        const cards = [
          { id: 'all', label: 'Total customers', value: rows.length, sub: `${rows.filter((r) => r.isLead).length} leads · ${buyers} buyers`, icon: Users, tone: 'sky' as const },
          { id: 'logged_in', label: 'Just logged in', value: count('logged_in'), sub: 'Signed in, not shopping yet', icon: LogIn, tone: 'slate' as const },
          { id: 'added_to_cart', label: 'Added to cart', value: count('added_to_cart'), sub: `${formatINR(sumCart('added_to_cart'))} in carts`, icon: ShoppingCart, tone: 'amber' as const },
          { id: 'checkout', label: 'At checkout', value: count('checkout'), sub: `${formatINR(sumCart('checkout'))} pending`, icon: CreditCard, tone: 'amber' as const },
          {
            id: 'ordered_today',
            label: 'Ordered today',
            value: count('ordered_today'),
            sub: `${todayOrders.length} orders · ${formatINR(todayOrders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0))}`,
            icon: PackageCheck,
            tone: 'emerald' as const,
          },
          { id: 'repeat', label: 'Repeat customers', value: repeatCount, sub: buyers ? `${Math.round((repeatCount / buyers) * 100)}% of buyers` : '—', icon: Repeat, tone: 'violet' as const },
          { id: 'vip', label: 'VIP', value: count('vip'), sub: 'Tagged VIP', icon: Crown, tone: 'amber' as const },
          {
            id: 'lifetime',
            label: 'Lifetime value',
            value: formatINR(totalSpent),
            sub: buyers ? `${formatINR(totalSpent / buyers)} per buyer` : '—',
            icon: IndianRupee,
            tone: 'emerald' as const,
          },
        ];
        const byId = Object.fromEntries(cards.map((c) => [c.id, c]));
        const groups = [
          { title: 'Customer stages', hint: 'Where each customer is right now', ids: ['logged_in', 'added_to_cart', 'checkout', 'ordered_today'] },
          { title: 'Customer value', hint: 'Who they are and what they spend', ids: ['all', 'repeat', 'vip', 'lifetime'] },
        ];
        return (
          <div className="space-y-4 mb-5">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{g.title}</h3>
                  <span className="text-[11px] text-slate-400">{g.hint}</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
                  {g.ids.map((id) => {
                    const c = byId[id];
                    const active = id === 'lifetime' ? segment === 'all' && sort === 'spent' : segment === id && !(id === 'all' && sort === 'spent');
                    return (
                      <StatCard
                        key={id}
                        active={active}
                        label={c.label}
                        value={c.value}
                        sub={c.sub}
                        icon={<c.icon className="w-4 h-4" />}
                        tone={c.tone}
                        onClick={() =>
                          id === 'lifetime'
                            ? pick('all', 'spent')
                            : pick(id, id === 'added_to_cart' || id === 'checkout' ? 'cart' : id === 'logged_in' ? 'active' : id === 'all' ? 'recent' : undefined)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {segment !== 'all' && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <span className="text-slate-500">Showing</span>
          <Badge tone="emerald">{SEGMENT_LABELS[segment] ?? segment}</Badge>
          <span className="text-slate-500">· {filtered.length} customers</span>
          <button onClick={() => pick('all', 'recent')} className="ml-1 text-xs text-slate-500 hover:text-slate-900 underline">
            Clear
          </button>
        </div>
      )}

      <Card padded={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, email, city, pincode…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            />
          </div>
          <Dropdown
            className="lg:w-48"
            value={segment}
            onChange={setSegment}
            options={Object.entries(SEGMENT_LABELS).map(([value, label]) => ({ value, label, hint: String(count(value)) }))}
          />
          <Dropdown
            className="lg:w-44"
            value={city}
            onChange={setCity}
            searchable
            options={[{ value: 'all', label: 'All cities' }, ...cities.map((c) => ({ value: c, label: c, hint: String(rows.filter((r) => r.city === c).length) }))]}
          />
          <Dropdown
            className="lg:w-48"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'recent', label: 'Last order: recent' },
              { value: 'active', label: 'Last active' },
              { value: 'cart', label: 'Cart value' },
              { value: 'spent', label: 'Highest spend' },
              { value: 'orders', label: 'Most orders' },
              { value: 'joined', label: 'Newest customers' },
              { value: 'name', label: 'Name A → Z' },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Users className="w-5 h-5" />} title="No customers match" description="Customers are added automatically when someone places an order." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Stage</th>
                  <th className="px-3 py-3 font-semibold">Location</th>
                  <th className="px-3 py-3 font-semibold text-right">Orders</th>
                  <th className="px-3 py-3 font-semibold text-right">Spent</th>
                  <th className="px-3 py-3 font-semibold">Last order</th>
                  <th className="px-3 py-3 font-semibold">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setOpenId(r.id)} className="hover:bg-slate-50/70 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-center shrink-0">
                          {initials(r.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {r.fullName} {r.isLead && <Badge tone="sky">Lead</Badge>}
                          </p>
                          <p className="text-xs text-slate-500">{r.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap', STAGE_META[r.stage].pill)}>
                        <span className={cx('w-1.5 h-1.5 rounded-full', STAGE_META[r.stage].dot)} />
                        {STAGE_META[r.stage].label}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[180px] truncate" title={r.cartItems}>
                        {r.cartValue ? `${formatINR(r.cartValue)} · ${r.cartItems}` : `Active ${timeAgo(r.lastActive)}`}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      {r.city || '—'}
                      {r.state && <span className="text-slate-400">, {r.state}</span>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-slate-900">{r.orderCount}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-slate-900">{formatINR(r.spent)}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{r.lastOrder ? formatDateKey(dateKey(r.lastOrder)) : <span className="text-slate-400">Never</span>}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.orderCount > 1 && <Badge tone="violet">Repeat</Badge>}
                        {r.tags.slice(0, 2).map((t) => (
                          <Badge key={t} tone={t === 'VIP' ? 'amber' : 'slate'}>
                            {t}
                          </Badge>
                        ))}
                        {r.tags.length > 2 && <Badge>+{r.tags.length - 2}</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && (
        <CustomerDrawer
          key={open.id}
          customer={open}
          journeys={journeys.filter((j) => j.phone === open.id)}
          onClose={() => setOpenId(null)}
          onSave={(u) =>
            open.isLead
              ? upsertCustomer({ ...open, ...u, fullName: u.fullName || open.fullName, phone: open.phone, source: 'signup' })
              : updateCustomer(open.id, u)
          }
          onDelete={() => {
            if (open.isLead) {
              setOpenId(null);
              return;
            }
            if (confirm(`Remove ${open.fullName} from the customer book? Their orders are kept.`)) {
              deleteCustomer(open.id);
              setOpenId(null);
            }
          }}
          onOpenOrder={setViewingOrder}
        />
      )}

      <AddCustomerModal
        open={adding}
        onClose={() => setAdding(false)}
        onSave={(c) => {
          upsertCustomer({ ...c, source: 'manual' });
          setAdding(false);
        }}
      />

      <OrderDrawer order={viewingOrder} onClose={() => setViewingOrder(null)} onDispatch={setDispatching} />
      <DispatchModal order={dispatching} onClose={() => setDispatching(null)} />
    </div>
  );
};

// ---------- Customer timeline ----------

const fmtDT = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const lastOf = (journeys: VisitorJourney[], type: string) =>
  journeys
    .flatMap((j) => j.events.filter((e) => e.type === type))
    .sort((a, b) => b.at.localeCompare(a.at))[0];

const CustomerTimeline: React.FC<{ customer: CustomerRow; journeys: VisitorJourney[]; onOpenOrder: (o: Order) => void }> = ({
  customer,
  journeys,
  onOpenOrder,
}) => {
  const [showVisits, setShowVisits] = useState(false);
  const latestOrder = customer.orders[0];
  const signedInAt = journeys.map((j) => j.signedInAt).filter(Boolean).sort()[0] as string | undefined;
  const cartEv = lastOf(journeys, 'added_to_cart');
  const checkoutEv = lastOf(journeys, 'checkout_started');
  const detailsEv = lastOf(journeys, 'details_entered');

  const steps: { key: CustomerStage | 'details'; label: string; at?: string; detail?: React.ReactNode }[] = [
    {
      key: 'logged_in',
      label: 'Logged in',
      at: signedInAt ?? (customer.source === 'signup' ? customer.createdAt : undefined),
      detail: signedInAt || customer.source === 'signup' ? 'Signed in on the website' : 'No sign-in recorded',
    },
    { key: 'added_to_cart', label: 'Added to cart', at: cartEv?.at, detail: cartEv?.label },
    { key: 'checkout', label: 'Checkout page', at: checkoutEv?.at, detail: checkoutEv ? 'Opened checkout' : undefined },
    { key: 'details', label: 'Details filled', at: detailsEv?.at, detail: detailsEv ? 'Name & phone entered' : undefined },
    {
      key: 'ordered',
      label: 'Ordered',
      at: latestOrder?.createdAt,
      detail: latestOrder ? (
        <span className="inline-flex items-center gap-1.5 flex-wrap">
          #{latestOrder.id} · {formatINR(latestOrder.total)} <StatusPill status={latestOrder.status} />
        </span>
      ) : undefined,
    },
  ];
  // Highlight up to the customer's current stage
  const order: (CustomerStage | 'details')[] = ['logged_in', 'added_to_cart', 'checkout', 'details', 'ordered'];
  const currentIdx = customer.stage === 'checkout' ? (detailsEv && (!checkoutEv || detailsEv.at >= checkoutEv.at) ? 3 : 2) : order.indexOf(customer.stage);

  // Unified activity feed: website activity + order status updates
  type Item = { at: string; title: string; detail?: string; dot: string; order?: Order };
  const items: Item[] = [
    ...journeys.flatMap((j) =>
      j.events
        .filter((e) => showVisits || e.type !== 'page_view')
        .filter((e) => e.type !== 'ordered') // shown from the order itself below
        .map<Item>((e) => ({
          at: e.at,
          title:
            e.type === 'signed_in'
              ? 'Logged in'
              : e.type === 'page_view'
              ? `Visited ${e.label}`
              : e.type === 'viewed_product'
              ? 'Viewed product'
              : e.type === 'added_to_cart'
              ? 'Added to cart'
              : e.type === 'checkout_started'
              ? 'Went to checkout'
              : e.type === 'details_entered'
              ? 'Filled checkout details'
              : e.type,
          detail: e.type === 'page_view' || e.type === 'checkout_started' ? undefined : e.label,
          dot:
            e.type === 'signed_in'
              ? 'bg-slate-500'
              : e.type === 'added_to_cart'
              ? 'bg-amber-500'
              : e.type === 'checkout_started' || e.type === 'details_entered'
              ? 'bg-orange-500'
              : e.type === 'viewed_product'
              ? 'bg-sky-500'
              : 'bg-slate-300',
        }))
    ),
    ...customer.orders.flatMap((o) =>
      o.statusHistory.map<Item>((h, i) => ({
        at: h.timestamp,
        title: i === 0 ? `Placed order #${o.id}` : `Order #${o.id} → ${h.status}`,
        detail: i === 0 ? `${o.items.map((it) => `${it.productName} ×${it.qty}`).join(', ')} · ${formatINR(o.total)} · ${o.paymentMethod.toUpperCase()}` : h.note,
        dot: STATUS_STYLES[h.status].dot,
        order: o,
      }))
    ),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const byDay = items.reduce<Record<string, Item[]>>((acc, it) => {
    const k = dateKey(it.at);
    (acc[k] ||= []).push(it);
    return acc;
  }, {});

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Journey</p>
          <span className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset', STAGE_META[customer.stage].pill)}>
            <span className={cx('w-1.5 h-1.5 rounded-full', STAGE_META[customer.stage].dot)} />
            Now: {STAGE_META[customer.stage].label}
          </span>
        </div>
        <ol className="relative">
          {steps.map((s, i) => {
            const done = !!s.at;
            const current = i === currentIdx;
            return (
              <li key={s.key} className="relative flex gap-4 pb-5 last:pb-0">
                {i < steps.length - 1 && <span className={cx('absolute left-[11px] top-7 bottom-0 w-0.5', done && steps[i + 1].at ? 'bg-emerald-400' : 'bg-slate-200')} />}
                <span
                  className={cx(
                    'relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold',
                    done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400',
                    current && 'ring-4 ring-emerald-100'
                  )}
                >
                  {done ? '✓' : i + 1}
                </span>
                <div className="flex-1 min-w-0 -mt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className={cx('text-sm font-semibold', done ? 'text-slate-900' : 'text-slate-400')}>
                      {s.label}
                      {current && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">current</span>}
                    </p>
                    <span className={cx('text-xs tabular-nums', done ? 'text-slate-600' : 'text-slate-300')}>{s.at ? fmtDT(s.at) : 'Not yet'}</span>
                  </div>
                  {s.detail && <div className="text-xs text-slate-500 mt-0.5">{s.detail}</div>}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Full activity ({items.length})</p>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
            <input type="checkbox" checked={showVisits} onChange={(e) => setShowVisits(e.target.checked)} className="accent-emerald-700" />
            Show page visits
          </label>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No activity recorded yet.</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(byDay).map(([day, list]) => (
              <div key={day}>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {day === todayKey() ? 'Today' : formatDateKey(day)}
                </p>
                <ol className="relative border-l border-slate-200 ml-1.5 space-y-3">
                  {list.map((it, i) => (
                    <li key={i} className="pl-5 relative">
                      <span className={cx('absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white', it.dot)} />
                      <div className="flex items-baseline justify-between gap-3">
                        {it.order ? (
                          <button onClick={() => onOpenOrder(it.order!)} className="text-sm font-medium text-slate-800 hover:text-emerald-700 text-left">
                            {it.title}
                          </button>
                        ) : (
                          <p className="text-sm font-medium text-slate-800">{it.title}</p>
                        )}
                        <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                          {new Date(it.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {it.detail && <p className="text-xs text-slate-500">{it.detail}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};

const CustomerDrawer: React.FC<{
  customer: CustomerRow;
  journeys: VisitorJourney[];
  onClose: () => void;
  onSave: (u: Partial<CustomerRecord>) => void;
  onDelete: () => void;
  onOpenOrder: (o: Order) => void;
}> = ({ customer, journeys, onClose, onSave, onDelete, onOpenOrder }) => {
  const [form, setForm] = useState<CustomerRecord>(customer);
  const [newTag, setNewTag] = useState('');
  const set = (k: keyof CustomerRecord, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTag = (t: string) => setForm((f) => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] }));
  const wa = customer.phone.replace(/\D/g, '');
  const allTags = Array.from(new Set([...PRESET_TAGS, ...form.tags]));

  return (
    <Drawer
      open
      onClose={onClose}
      title={customer.fullName}
      subtitle={`Customer since ${formatDateKey(dateKey(customer.createdAt))} · ${customer.isLead ? 'lead — save to add to the customer book' : customer.source === 'manual' ? 'added manually' : customer.source === 'signup' ? 'signed up on the website' : 'from checkout'} · ${STAGE_META[customer.stage].label}`}
      footer={
        <>
          <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={onDelete}>
            Remove
          </Button>
          <div className="flex-1" />
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => onSave(form)}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Card className="!p-4">
            <p className="text-xs text-slate-500">Orders</p>
            <p className="text-xl font-semibold text-slate-900 tabular-nums">{customer.orderCount}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-slate-500">Total spent</p>
            <p className="text-xl font-semibold text-slate-900 tabular-nums">{formatINR(customer.spent)}</p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-slate-500">Avg. order</p>
            <p className="text-xl font-semibold text-slate-900 tabular-nums">
              {formatINR(customer.orderCount ? customer.spent / Math.max(1, customer.orders.filter((o) => o.status !== 'Cancelled').length) : 0)}
            </p>
          </Card>
        </div>

        <div className="flex gap-2">
          <a href={`tel:${wa}`} className="flex-1">
            <Button className="w-full" icon={<Phone className="w-4 h-4" />}>
              Call
            </Button>
          </a>
          <a href={`https://wa.me/${wa.length === 10 ? '91' + wa : wa}`} target="_blank" rel="noreferrer" className="flex-1">
            <Button className="w-full" icon={<MessageCircle className="w-4 h-4" />}>
              WhatsApp
            </Button>
          </a>
        </div>

        <CustomerTimeline customer={customer} journeys={journeys} onOpenOrder={onOpenOrder} />

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Profile</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
            </Field>
            <Field label="Phone" hint="Phone is the customer ID and links their orders">
              <Input value={form.phone} disabled className="bg-slate-50 text-slate-500" />
            </Field>
            <Field label="Email" className="sm:col-span-2">
              <Input value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <Field label="City">
              <Input value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label="Pincode">
              <Input value={form.pincode || ''} onChange={(e) => set('pincode', e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Tags</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={cx(
                  'px-3 h-8 rounded-full text-xs font-medium border transition-colors',
                  form.tags.includes(t) ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2 mt-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (newTag.trim() && !form.tags.includes(newTag.trim())) toggleTag(newTag.trim());
              setNewTag('');
            }}
          >
            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Custom tag…" className="h-9" />
            <Button size="sm" type="submit" icon={<Plus className="w-3.5 h-3.5" />} className="h-9">
              Add
            </Button>
          </form>
        </Card>

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Private notes</p>
          <Textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Skin type, preferences, follow-up reminders…" />
        </Card>

        <Card padded={false}>
          <p className="px-5 py-3 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Order history ({customer.orders.length})
          </p>
          {customer.orders.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {customer.orders.map((o) => (
                <button key={o.id} onClick={() => onOpenOrder(o)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      <span className="font-mono text-emerald-800">#{o.id}</span> · {formatDateKey(dateKey(o.createdAt))}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{o.items.map((i) => `${i.productName} ×${i.qty}`).join(', ')}</p>
                  </div>
                  <StatusPill status={o.status} />
                  <span className="text-sm font-semibold tabular-nums w-20 text-right">{formatINR(o.total)}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Drawer>
  );
};

const AddCustomerModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (c: { fullName: string; phone: string; email?: string; city?: string; state?: string; pincode?: string; address?: string }) => void;
}> = ({ open, onClose, onSave }) => {
  const [f, setF] = useState({ fullName: '', phone: '', email: '', city: '', state: 'Tamil Nadu', pincode: '', address: '' });
  const valid = f.fullName.trim() && normalizePhone(f.phone).length === 10;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add customer"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!valid}
            onClick={() => {
              onSave(f);
              setF({ fullName: '', phone: '', email: '', city: '', state: 'Tamil Nadu', pincode: '', address: '' });
            }}
          >
            Save customer
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" required className="col-span-2">
          <Input value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} />
        </Field>
        <Field label="Mobile number" required className="col-span-2" hint="10-digit number">
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" />
        </Field>
        <Field label="Email" className="col-span-2">
          <Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field label="Address" className="col-span-2">
          <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        </Field>
        <Field label="City">
          <Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
        </Field>
        <Field label="Pincode">
          <Input value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
};
