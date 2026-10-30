import {
  AutoRule,
  CategoryType,
  HomeSectionConfig,
  HomeSectionId,
  Order,
  OrderStatus,
  Product,
  ProductPlacement,
} from '@/types/store';
import { PRODUCTS } from '@/data/products';

// ---------- Product placements ----------

export const PLACEMENT_OPTIONS: {
  id: ProductPlacement;
  label: string;
  page: string;
  description: string;
}[] = [
  { id: 'home-featured', label: 'Bestsellers', page: 'Home', description: 'Signature products grid on the home page' },
  { id: 'home-new', label: 'New Arrivals', page: 'Home', description: 'New arrivals strip on the home page' },
  { id: 'home-quiz', label: 'Routine Finder', page: 'Home', description: 'Recommended in the routine / dosha quiz' },
  { id: 'shop', label: 'Shop Catalog', page: 'Shop', description: 'Listed in the main shop catalog & search' },
  { id: 'product-related', label: 'Related Products', page: 'Product', description: '"Complementary" block on product pages' },
  { id: 'cart-upsell', label: 'Cart Upsell', page: 'Cart', description: '"You may also like" on the cart page' },
];

export const DEFAULT_PLACEMENTS: ProductPlacement[] = ['home-featured', 'home-quiz', 'shop', 'product-related'];

export const getPlacements = (p: Product): ProductPlacement[] => p.placements ?? DEFAULT_PLACEMENTS;

export const isPlacedOn = (p: Product, placement: ProductPlacement) =>
  p.isVisible !== false && getPlacements(p).includes(placement);

export const productsFor = (products: Product[], placement: ProductPlacement) =>
  products
    .filter((p) => isPlacedOn(p, placement))
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

export const isOutOfStock = (p: Product) =>
  p.inStock === false || (typeof p.stock === 'number' && p.stock <= 0);

// ---------- Home page product sections ----------

export const HOME_SECTIONS: {
  id: HomeSectionId;
  label: string;
  description: string;
  sectionKey: 'homeFeatured' | 'homeNew' | 'homeQuiz';
  anchor: string;
}[] = [
  { id: 'home-featured', label: 'Bestsellers', description: 'Main product grid below the categories', sectionKey: 'homeFeatured', anchor: 'home-featured' },
  { id: 'home-new', label: 'New Arrivals', description: '“Fresh from the apothecary” strip', sectionKey: 'homeNew', anchor: 'home-new' },
  { id: 'home-quiz', label: 'Routine Finder', description: 'Recommendations in the quiz, per focus area', sectionKey: 'homeQuiz', anchor: 'routine-finder' },
];

export const AUTO_RULES: { value: AutoRule; label: string; description: string }[] = [
  { value: 'bestselling', label: 'Bestselling', description: 'Most units sold across all orders' },
  { value: 'newest', label: 'Newest', description: 'Most recently added products first' },
  { value: 'top-rated', label: 'Top rated', description: 'Highest star rating first' },
  { value: 'most-reviewed', label: 'Most reviewed', description: 'Highest review count first' },
  { value: 'discount', label: 'Biggest discount', description: 'Largest % off MRP first' },
  { value: 'price-low', label: 'Price: low → high', description: 'Cheapest first' },
  { value: 'price-high', label: 'Price: high → low', description: 'Premium first' },
];

export const salesByProduct = (orders: Order[]) => {
  const map: Record<string, number> = {};
  orders
    .filter((o) => o.status !== 'Cancelled')
    .forEach((o) => o.items.forEach((i) => (map[i.productId] = (map[i.productId] || 0) + i.qty)));
  return map;
};

const discountPct = (p: Product) => (p.mrp > p.price ? (p.mrp - p.price) / p.mrp : 0);

export const sortByRule = (list: Product[], rule: AutoRule, orders: Order[]) => {
  const sales = rule === 'bestselling' ? salesByProduct(orders) : {};
  return [...list].sort((a, b) => {
    switch (rule) {
      case 'bestselling':
        return (sales[b.id] || 0) - (sales[a.id] || 0) || b.rating - a.rating;
      case 'newest':
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      case 'top-rated':
        return b.rating - a.rating || b.reviews - a.reviews;
      case 'most-reviewed':
        return b.reviews - a.reviews;
      case 'discount':
        return discountPct(b) - discountPct(a);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
    }
  });
};

// Manual mode: products placed in the section, in the admin's chosen order.
export const manualSectionList = (products: Product[], id: HomeSectionId, cfg: HomeSectionConfig) => {
  const idx = (pid: string) => {
    const i = cfg.order.indexOf(pid);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return products
    .filter((p) => getPlacements(p).includes(id))
    .sort((a, b) => idx(a.id) - idx(b.id) || (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
};

/** Everything that would be eligible for the section, before the limit is applied. */
export const resolveHomeSectionAll = (
  products: Product[],
  orders: Order[],
  id: HomeSectionId,
  cfg: HomeSectionConfig,
  focusCategory?: CategoryType
) => {
  let list =
    cfg.mode === 'manual'
      ? manualSectionList(products, id, cfg).filter((p) => p.isVisible !== false)
      : sortByRule(products.filter((p) => p.isVisible !== false), cfg.rule, orders);
  if (cfg.category !== 'all') list = list.filter((p) => p.category === cfg.category);
  if (focusCategory) list = list.filter((p) => p.category === focusCategory);
  if (cfg.hideOutOfStock) list = list.filter((p) => !isOutOfStock(p));
  return list;
};

export const resolveHomeSection = (...args: Parameters<typeof resolveHomeSectionAll>) =>
  resolveHomeSectionAll(...args).slice(0, args[3].limit);

// Built-in products are pre-rendered at /product/[id]. Products created from the
// admin panel don't exist at build time, so they use the query-string route.
const STATIC_IDS = new Set(PRODUCTS.map((p) => p.id));
export const productHref = (id: string) =>
  STATIC_IDS.has(id) ? `/product/${id}` : `/product/view?id=${encodeURIComponent(id)}`;

// ---------- Formatting ----------

export const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

// ---------- Dates (always local time) ----------

export const dateKey = (d: Date | string) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

export const todayKey = () => dateKey(new Date());
export const yesterdayKey = () => dateKey(addDays(new Date(), -1));

export const formatDateKey = (key: string) =>
  new Date(`${key}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export type DatePreset = 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'all' | 'date' | 'range';

export interface DateFilter {
  preset: DatePreset;
  date?: string; // for 'date'
  from?: string; // for 'range'
  to?: string;
}

export const resolveDateRange = (f: DateFilter): { from: string | null; to: string | null } => {
  const now = new Date();
  switch (f.preset) {
    case 'today':
      return { from: todayKey(), to: todayKey() };
    case 'yesterday':
      return { from: yesterdayKey(), to: yesterdayKey() };
    case '7d':
      return { from: dateKey(addDays(now, -6)), to: todayKey() };
    case '30d':
      return { from: dateKey(addDays(now, -29)), to: todayKey() };
    case 'month':
      return { from: dateKey(new Date(now.getFullYear(), now.getMonth(), 1)), to: todayKey() };
    case 'date':
      return { from: f.date || todayKey(), to: f.date || todayKey() };
    case 'range':
      return { from: f.from || null, to: f.to || null };
    default:
      return { from: null, to: null };
  }
};

export const inDateRange = (iso: string, range: { from: string | null; to: string | null }) => {
  const k = dateKey(iso);
  if (range.from && k < range.from) return false;
  if (range.to && k > range.to) return false;
  return true;
};

export const describeDateFilter = (f: DateFilter) => {
  switch (f.preset) {
    case 'today':
      return `Today · ${formatDateKey(todayKey())}`;
    case 'yesterday':
      return `Yesterday · ${formatDateKey(yesterdayKey())}`;
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case 'month':
      return 'This month';
    case 'date':
      return formatDateKey(f.date || todayKey());
    case 'range':
      return `${f.from ? formatDateKey(f.from) : 'Start'} → ${f.to ? formatDateKey(f.to) : 'Today'}`;
    default:
      return 'All time';
  }
};

// ---------- Order metrics ----------

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const STATUS_STYLES: Record<OrderStatus, { pill: string; dot: string }> = {
  Pending: { pill: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  Confirmed: { pill: 'bg-violet-50 text-violet-800 ring-violet-200', dot: 'bg-violet-500' },
  Processing: { pill: 'bg-sky-50 text-sky-800 ring-sky-200', dot: 'bg-sky-500' },
  Shipped: { pill: 'bg-blue-50 text-blue-800 ring-blue-200', dot: 'bg-blue-600' },
  Delivered: { pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
  Cancelled: { pill: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
};

export const summarizeOrders = (orders: Order[]) => {
  const valid = orders.filter((o) => o.status !== 'Cancelled');
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const items = valid.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
  return {
    count: orders.length,
    revenue,
    items,
    avg: valid.length ? revenue / valid.length : 0,
    pending: orders.filter((o) => o.status === 'Pending').length,
    cancelled: orders.length - valid.length,
    cod: orders.filter((o) => o.paymentMethod === 'cod').length,
    prepaid: orders.filter((o) => o.paymentMethod !== 'cod').length,
  };
};

export const pctChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
};

// ---------- CSV export ----------

export const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const readImageFile = (file: File, maxMB = 3): Promise<string> =>
  new Promise((resolve, reject) => {
    if (file.size > maxMB * 1024 * 1024) {
      reject(new Error(`Image must be under ${maxMB}MB`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
