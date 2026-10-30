'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Product,
  Order,
  OrderStatus,
  OfferBanner,
  HeaderConfig,
  FooterConfig,
  CartItem,
  PageContents,
  CustomerRecord,
  SiteSettings,
  IntegrationSettings,
  WebhookEvent,
  WebhookLogEntry,
  VisitorJourney,
  JourneyStage,
  JourneyEvent,
} from '@/types/store';
import { NOTIFY_STAGES, detectDevice, detectSource, stageRank, visitorName } from '@/lib/journey';
import { INITIAL_INTEGRATIONS, buildPayload, deliverWebhook, productSummary } from '@/lib/webhook';
import {
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_ORDERS,
  INITIAL_HEADER_CONFIG,
  INITIAL_FOOTER_CONFIG,
  INITIAL_PAGE_CONTENTS,
  INITIAL_SITE_SETTINGS,
} from '@/data/initialData';
import { normalizePhone } from '@/lib/storeUtils';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface UpdateOpts {
  silent?: boolean;
}

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>, opts?: UpdateOpts) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    courier?: { courierName?: string; trackingNumber?: string }
  ) => void;
  deleteOrder: (orderId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByPhone: (phone: string) => Order[];

  // Customers (stored separately from orders)
  customers: CustomerRecord[];
  upsertCustomer: (customer: Partial<CustomerRecord> & { phone: string; fullName: string }, opts?: UpdateOpts) => void;
  updateCustomer: (id: string, updated: Partial<CustomerRecord>, opts?: UpdateOpts) => void;
  deleteCustomer: (id: string) => void;

  // Banners
  banners: OfferBanner[];
  addBanner: (banner: OfferBanner) => void;
  updateBanner: (id: string, updated: Partial<OfferBanner>) => void;
  deleteBanner: (id: string) => void;
  toggleBanner: (id: string, isActive?: boolean) => void;

  // Header & Footer
  headerConfig: HeaderConfig;
  updateHeaderConfig: (config: Partial<HeaderConfig>, opts?: UpdateOpts) => void;
  footerConfig: FooterConfig;
  updateFooterConfig: (config: Partial<FooterConfig>, opts?: UpdateOpts) => void;

  // Page Content Manager for ALL pages
  pageContents: PageContents;
  updatePageContent: <K extends keyof PageContents>(
    page: K,
    content: Partial<PageContents[K]>,
    opts?: UpdateOpts
  ) => void;

  // Site-wide live controls
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>, opts?: UpdateOpts) => void;

  // Integrations (webhook + delivery partners)
  integrations: IntegrationSettings;
  updateIntegrations: (patch: Partial<IntegrationSettings>, opts?: UpdateOpts) => void;
  webhookLog: WebhookLogEntry[];
  clearWebhookLog: () => void;
  syncAllToWebhook: (include: { products: boolean; customers: boolean; orders: boolean }) => Promise<WebhookLogEntry>;
  sendTestWebhook: () => Promise<WebhookLogEntry>;
  retryWebhook: (entry: WebhookLogEntry) => Promise<WebhookLogEntry>;

  // Customer journey tracking
  journeys: VisitorJourney[];
  trackPageView: (path: string) => void;
  trackProductView: (product: Product) => void;
  trackCheckoutStarted: () => void;
  identifyVisitor: (details: { fullName?: string; phone?: string; email?: string; city?: string }) => void;
  updateJourney: (id: string, patch: Partial<VisitorJourney>) => void;
  deleteJourney: (id: string) => void;
  currentVisitor: VisitorJourney | null;
  signIn: (details: { fullName: string; phone: string; email?: string }) => void;
  signOut: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (productId: string, sizeIndex?: number, qty?: number) => void;
  updateCartQty: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotals: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  promoCode: string;
  promoApplied: boolean;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // UI Drawer / Toast
  showCartDrawer: boolean;
  setShowCartDrawer: (show: boolean) => void;
  toast: ToastState | null;
  triggerToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Maintenance
  resetToDefaults: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'harpudhas_products_v3',
  ORDERS: 'harpudhas_orders_v3',
  CUSTOMERS: 'harpudhas_customers_v1',
  BANNERS: 'harpudhas_banners_v3',
  HEADER: 'harpudhas_header_v3',
  FOOTER: 'harpudhas_footer_v3',
  PAGE_CONTENTS: 'harpudhas_pages_v3',
  SITE_SETTINGS: 'harpudhas_site_v1',
  INTEGRATIONS: 'harpudhas_integrations_v1',
  WEBHOOK_LOG: 'harpudhas_webhook_log_v1',
  JOURNEYS: 'harpudhas_journeys_v1',
  CART: 'harpudhas_cart_v3',
  WISHLIST: 'harpudhas_wishlist_v3',
};

// Journey events: keep every stage event (up to 150) but only the latest 25 page
// views, so browsing never pushes "added to cart" / "checkout" out of history.
const addEvent = (list: JourneyEvent[], e: JourneyEvent): JourneyEvent[] => {
  const next = [e, ...list];
  const important = next.filter((x) => x.type !== 'page_view').slice(0, 150);
  const views = next.filter((x) => x.type === 'page_view').slice(0, 25);
  return [...important, ...views].sort((a, b) => b.at.localeCompare(a.at));
};

const mergePageContents =(parsed: Partial<PageContents>): PageContents => ({
  ...INITIAL_PAGE_CONTENTS,
  ...parsed,
  home: { ...INITIAL_PAGE_CONTENTS.home, ...(parsed.home || {}) },
  about: { ...INITIAL_PAGE_CONTENTS.about, ...(parsed.about || {}) },
  contact: { ...INITIAL_PAGE_CONTENTS.contact, ...(parsed.contact || {}) },
  shop: { ...INITIAL_PAGE_CONTENTS.shop, ...(parsed.shop || {}) },
});

const mergeSiteSettings = (parsed: Partial<SiteSettings>): SiteSettings => ({
  ...INITIAL_SITE_SETTINGS,
  ...parsed,
  sections: { ...INITIAL_SITE_SETTINGS.sections, ...(parsed.sections || {}) },
  followUpTemplates: { ...INITIAL_SITE_SETTINGS.followUpTemplates, ...(parsed.followUpTemplates || {}) },
  theme: {
    site: { ...INITIAL_SITE_SETTINGS.theme.site, ...(parsed.theme?.site || {}) },
    admin: { ...INITIAL_SITE_SETTINGS.theme.admin, ...(parsed.theme?.admin || {}) },
  },
  homeProducts: {
    'home-featured': { ...INITIAL_SITE_SETTINGS.homeProducts['home-featured'], ...(parsed.homeProducts?.['home-featured'] || {}) },
    'home-new': { ...INITIAL_SITE_SETTINGS.homeProducts['home-new'], ...(parsed.homeProducts?.['home-new'] || {}) },
    'home-quiz': { ...INITIAL_SITE_SETTINGS.homeProducts['home-quiz'], ...(parsed.homeProducts?.['home-quiz'] || {}) },
  },
});

// Build the customer book from order history (used on first load / import)
const customersFromOrders = (orders: Order[], existing: CustomerRecord[] = []): CustomerRecord[] => {
  const map = new Map(existing.map((c) => [c.id, c]));
  [...orders]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((o) => {
      const id = normalizePhone(o.customer.phone);
      if (!id) return;
      const prev = map.get(id);
      map.set(id, {
        id,
        tags: [],
        notes: '',
        createdAt: o.createdAt,
        source: 'order',
        ...prev,
        fullName: o.customer.fullName,
        phone: o.customer.phone,
        email: o.customer.email || prev?.email,
        address: o.customer.address,
        landmark: o.customer.landmark,
        city: o.customer.city,
        state: o.customer.state,
        pincode: o.customer.pincode,
      });
    });
  return Array.from(map.values());
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  // States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => customersFromOrders(INITIAL_ORDERS));
  const [banners, setBanners] = useState<OfferBanner[]>(INITIAL_BANNERS);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(INITIAL_HEADER_CONFIG);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(INITIAL_FOOTER_CONFIG);
  const [pageContents, setPageContents] = useState<PageContents>(INITIAL_PAGE_CONTENTS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [integrations, setIntegrations] = useState<IntegrationSettings>(INITIAL_INTEGRATIONS);
  const [webhookLog, setWebhookLog] = useState<WebhookLogEntry[]>([]);
  // Refs so webhook emits always see the latest config / customers
  const integrationsRef = useRef(integrations);
  integrationsRef.current = integrations;
  const customersRef = useRef<CustomerRecord[]>([]);
  const [journeys, setJourneys] = useState<VisitorJourney[]>([]);
  const journeysRef = useRef<VisitorJourney[]>([]);
  journeysRef.current = journeys;
  const visitorIdRef = useRef('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);

  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Load from LocalStorage on mount, then keep every open tab in sync so admin
  // changes appear live on the storefront without a refresh.
  useEffect(() => {
    const appliers: Record<string, (raw: string) => void> = {
      [STORAGE_KEYS.PRODUCTS]: (raw) => setProducts(JSON.parse(raw)),
      [STORAGE_KEYS.ORDERS]: (raw) => setOrders(JSON.parse(raw)),
      [STORAGE_KEYS.CUSTOMERS]: (raw) => setCustomers(JSON.parse(raw)),
      [STORAGE_KEYS.BANNERS]: (raw) => setBanners(JSON.parse(raw)),
      [STORAGE_KEYS.HEADER]: (raw) => setHeaderConfig({ ...INITIAL_HEADER_CONFIG, ...JSON.parse(raw) }),
      [STORAGE_KEYS.FOOTER]: (raw) => setFooterConfig({ ...INITIAL_FOOTER_CONFIG, ...JSON.parse(raw) }),
      [STORAGE_KEYS.PAGE_CONTENTS]: (raw) => setPageContents(mergePageContents(JSON.parse(raw))),
      [STORAGE_KEYS.SITE_SETTINGS]: (raw) => setSiteSettings(mergeSiteSettings(JSON.parse(raw))),
      [STORAGE_KEYS.INTEGRATIONS]: (raw) => {
        const parsed = JSON.parse(raw) as Partial<IntegrationSettings>;
        setIntegrations({
          webhook: {
            ...INITIAL_INTEGRATIONS.webhook,
            ...(parsed.webhook || {}),
            events: { ...INITIAL_INTEGRATIONS.webhook.events, ...(parsed.webhook?.events || {}) },
          },
          deliveryPartners: parsed.deliveryPartners || [],
        });
      },
      [STORAGE_KEYS.WEBHOOK_LOG]: (raw) => setWebhookLog(JSON.parse(raw)),
      [STORAGE_KEYS.JOURNEYS]: (raw) => {
        const list = JSON.parse(raw);
        journeysRef.current = list;
        setJourneys(list);
      },
      [STORAGE_KEYS.CART]: (raw) => setCart(JSON.parse(raw)),
      [STORAGE_KEYS.WISHLIST]: (raw) => setWishlist(JSON.parse(raw)),
    };

    setIsClient(true);
    try {
      let vid = localStorage.getItem('harpudhas_visitor_id');
      if (!vid) {
        vid = `v_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('harpudhas_visitor_id', vid);
      }
      visitorIdRef.current = vid;
    } catch {
      // storage blocked — tracking stays off
    }
    Object.entries(appliers).forEach(([key, apply]) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) apply(raw);
      } catch (e) {
        console.warn(`Failed to load ${key}:`, e);
      }
    });

    // First run after upgrade: build the customer book from existing orders
    try {
      if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
        const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (storedOrders) setCustomers(customersFromOrders(JSON.parse(storedOrders)));
      }
    } catch {
      // ignore
    }

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.newValue === null || !appliers[e.key]) return;
      try {
        appliers[e.key](e.newValue);
      } catch {
        // ignore malformed payloads
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Persist each slice
  const usePersist = (key: string, value: unknown) => {
    useEffect(() => {
      if (!isClient) return;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn(`Could not save ${key} (storage may be full):`, e);
      }
    }, [key, value, isClient]);
  };
  usePersist(STORAGE_KEYS.PRODUCTS, products);
  usePersist(STORAGE_KEYS.ORDERS, orders);
  usePersist(STORAGE_KEYS.CUSTOMERS, customers);
  usePersist(STORAGE_KEYS.BANNERS, banners);
  usePersist(STORAGE_KEYS.HEADER, headerConfig);
  usePersist(STORAGE_KEYS.FOOTER, footerConfig);
  usePersist(STORAGE_KEYS.PAGE_CONTENTS, pageContents);
  usePersist(STORAGE_KEYS.SITE_SETTINGS, siteSettings);
  usePersist(STORAGE_KEYS.INTEGRATIONS, integrations);
  usePersist(STORAGE_KEYS.WEBHOOK_LOG, webhookLog);
  usePersist(STORAGE_KEYS.JOURNEYS, journeys);
  customersRef.current = customers;
  usePersist(STORAGE_KEYS.CART, cart);
  usePersist(STORAGE_KEYS.WISHLIST, wishlist);

  // Toast handler
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  };

  // ---------- Webhooks ----------
  const pushLog = (entry: WebhookLogEntry) => setWebhookLog((prev) => [entry, ...prev].slice(0, 40));

  const emit = (event: WebhookEvent, data: unknown, summary: string) => {
    const cfg = integrationsRef.current.webhook;
    if (!cfg.enabled || !cfg.url) return;
    if (event in cfg.events && !cfg.events[event as keyof typeof cfg.events]) return;
    deliverWebhook(cfg, event, buildPayload(cfg, event, data), summary).then(pushLog);
  };

  const syncAllToWebhook = async (include: { products: boolean; customers: boolean; orders: boolean }) => {
    const cfg = integrationsRef.current.webhook;
    const data = {
      ...(include.products ? { products } : {}),
      ...(include.customers ? { customers } : {}),
      ...(include.orders ? { orders } : {}),
      counts: {
        products: include.products ? products.length : 0,
        customers: include.customers ? customers.length : 0,
        orders: include.orders ? orders.length : 0,
      },
    };
    const summary = Object.entries(data.counts)
      .filter(([, n]) => n)
      .map(([k, n]) => `${n} ${k}`)
      .join(', ');
    const entry = await deliverWebhook(cfg, 'sync.full', buildPayload(cfg, 'sync.full', data), summary || 'nothing selected');
    pushLog(entry);
    if (entry.status !== 'failed') {
      setIntegrations((prev) => ({ ...prev, webhook: { ...prev.webhook, lastFullSync: entry.timestamp } }));
      triggerToast(entry.status === 'success' ? `Synced ${summary} to webhook` : `Sent ${summary} (receiver gave no confirmation)`, entry.status === 'success' ? 'success' : 'info');
    } else {
      triggerToast(`Sync failed: ${entry.error}`, 'error');
    }
    return entry;
  };

  const sendTestWebhook = async () => {
    const cfg = integrationsRef.current.webhook;
    const entry = await deliverWebhook(cfg, 'webhook.test', buildPayload(cfg, 'webhook.test', { message: 'Test event from Hàrpudha’s admin' }), 'Test ping');
    pushLog(entry);
    triggerToast(entry.status === 'failed' ? `Test failed: ${entry.error}` : 'Test event sent', entry.status === 'failed' ? 'error' : 'success');
    return entry;
  };

  const retryWebhook = async (old: WebhookLogEntry) => {
    if (!old.payload) {
      triggerToast('Payload too large to retry — run a full sync instead', 'error');
      return old;
    }
    const entry = await deliverWebhook(integrationsRef.current.webhook, old.event, old.payload, `Retry · ${old.summary}`);
    pushLog(entry);
    return entry;
  };

  const clearWebhookLog = () => setWebhookLog([]);

  const updateIntegrations = (patch: Partial<IntegrationSettings>, opts?: UpdateOpts) => {
    setIntegrations((prev) => ({ ...prev, ...patch }));
    if (!opts?.silent) triggerToast('Integration settings saved');
  };

  // ---------- Customer journey ----------
  const journeyPayload = (j: VisitorJourney) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { events, followUp, ...rest } = j;
    return rest;
  };

  // Read/modify/write through a ref so several calls in the same tick don't
  // clobber each other, and side effects (webhooks) stay out of state updaters.
  const mutateJourney = (fn: (j: VisitorJourney, now: string) => VisitorJourney) => {
    const vid = visitorIdRef.current;
    if (!vid || (typeof window !== 'undefined' && window.location.pathname.includes('/admin'))) return;
    const now = new Date().toISOString();
    const list = journeysRef.current;
    const existing: VisitorJourney = list.find((j) => j.id === vid) ?? {
      id: vid,
      firstSeen: now,
      lastSeen: now,
      stage: 'browsing',
      reached: { browsing: now },
      cart: [],
      cartValue: 0,
      viewedProducts: [],
      orderIds: [],
      pageViews: 0,
      source: detectSource(),
      device: detectDevice(),
      events: [],
      followUp: { status: 'new', note: '', contactCount: 0 },
    };
    const next = fn({ ...existing, lastSeen: now }, now);
    const updated = [next, ...list.filter((j) => j.id !== vid)].slice(0, 500);
    journeysRef.current = updated;
    setJourneys(updated);
    if (next.stage !== existing.stage && NOTIFY_STAGES.includes(next.stage)) {
      emit(
        'customer.stage_changed',
        { visitor: journeyPayload(next), previousStage: existing.stage, stage: next.stage },
        `${visitorName(next)}: ${existing.stage} → ${next.stage}`
      );
    }
  };

  const advance = (j: VisitorJourney, stage: JourneyStage, label: string, at: string): VisitorJourney => {
    const canMove = stageRank(stage) > stageRank(j.stage) || (j.stage === 'ordered' && stage === 'added_to_cart');
    return {
      ...j,
      stage: canMove ? stage : j.stage,
      reached: j.reached[stage] ? j.reached : { ...j.reached, [stage]: at },
      events: addEvent(j.events, { type: stage, at, label }),
    };
  };

  const trackPageView = (path: string) =>
    mutateJourney((j, now) => ({
      ...j,
      pageViews: j.pageViews + 1,
      events: addEvent(j.events, { type: 'page_view', at: now, label: path }),
    }));

  const trackProductView = (p: Product) =>
    mutateJourney((j, now) => ({
      ...advance(j, 'viewed_product', p.name, now),
      viewedProducts: [p.name, ...j.viewedProducts.filter((n) => n !== p.name)].slice(0, 20),
    }));

  const trackCheckoutStarted = () => mutateJourney((j, now) => advance(j, 'checkout_started', 'Opened checkout', now));

  const identifyVisitor = (d: { fullName?: string; phone?: string; email?: string; city?: string }) =>
    mutateJourney((j, now) => {
      const phone = d.phone ? normalizePhone(d.phone) : j.phone;
      const merged = {
        ...j,
        fullName: d.fullName?.trim() || j.fullName,
        phone,
        email: d.email?.trim() || j.email,
        city: d.city?.trim() || j.city,
      };
      return phone && phone.length === 10 && merged.fullName ? advance(merged, 'details_entered', `Entered details (${phone})`, now) : merged;
    });

  // Lightweight customer sign-in (mobile number, no OTP — there is no server to send one)
  const signIn = (d: { fullName: string; phone: string; email?: string }) => {
    const phone = normalizePhone(d.phone);
    mutateJourney((j, now) => ({
      ...j,
      fullName: d.fullName.trim(),
      phone,
      email: d.email?.trim() || j.email,
      signedIn: true,
      signedInAt: j.signedInAt ?? now,
      events: addEvent(j.events, { type: 'signed_in', at: now, label: `Signed in as ${d.fullName.trim()} (${phone})` }),
    }));
    if (!customersRef.current.some((c) => c.id === phone)) {
      upsertCustomer({ fullName: d.fullName.trim(), phone, email: d.email?.trim() || undefined, source: 'signup' }, { silent: true });
    }
    triggerToast(`Welcome, ${d.fullName.trim().split(' ')[0]}! 🌿`);
  };

  const signOut = () => {
    mutateJourney((j) => ({ ...j, signedIn: false }));
    triggerToast('Signed out', 'info');
  };

  const currentVisitor = journeys.find((j) => j.id === visitorIdRef.current) ?? null;

  const updateJourney = (id: string, patch: Partial<VisitorJourney>) => {
    const updated = journeysRef.current.map((j) => (j.id === id ? { ...j, ...patch } : j));
    journeysRef.current = updated;
    setJourneys(updated);
  };

  const deleteJourney = (id: string) => {
    const updated = journeysRef.current.filter((j) => j.id !== id);
    journeysRef.current = updated;
    setJourneys(updated);
  };

  // Keep the journey's cart snapshot in sync with the real cart
  useEffect(() => {
    if (!isClient || !visitorIdRef.current) return;
    const snapshot = cart
      .map((c) => {
        const p = products.find((x) => x.id === c.id);
        const s = p?.sizeOptions[c.sizeIndex] || p?.sizeOptions[0];
        return p ? { productId: p.id, name: p.name, size: s?.label || '', qty: c.qty, price: s?.price || p.price } : null;
      })
      .filter(Boolean) as VisitorJourney['cart'];
    const current = journeysRef.current.find((j) => j.id === visitorIdRef.current);
    if (!current && snapshot.length === 0) return;
    if (current && JSON.stringify(current.cart) === JSON.stringify(snapshot)) return;
    mutateJourney((j) => ({ ...j, cart: snapshot, cartValue: snapshot.reduce((s, i) => s + i.price * i.qty, 0) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, products, isClient]);

  // Products CRUD
  const addProduct = (product: Product) => {
    const full = { createdAt: new Date().toISOString(), ...product };
    setProducts((prev) => [full, ...prev]);
    emit('product.created', { product: full }, productSummary(full));
    triggerToast(`Added product "${product.name}"`);
  };

  const updateProduct = (id: string, updated: Partial<Product>, opts?: UpdateOpts) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    if (!opts?.silent) {
      const p = products.find((x) => x.id === id);
      if (p) emit('product.updated', { product: { ...p, ...updated } }, productSummary(p));
      triggerToast('Product details updated successfully');
    }
  };

  const deleteProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    setProducts((prev) => prev.filter((item) => item.id !== id));
    if (p) emit('product.deleted', { productId: id, name: p.name }, productSummary(p));
    triggerToast(`Deleted "${p?.name || 'Product'}"`, 'info');
  };

  const duplicateProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const copy: Product = {
      ...p,
      id: `${p.id.replace(/-copy-\d+$/, '')}-copy-${Date.now().toString().slice(-5)}`,
      name: `${p.name} (Copy)`,
      isVisible: false,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [copy, ...prev]);
    triggerToast(`Duplicated "${p.name}" as a hidden draft`);
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);

  // Customers
  const upsertCustomer = (
    c: Partial<CustomerRecord> & { phone: string; fullName: string },
    opts?: UpdateOpts
  ) => {
    const id = normalizePhone(c.phone);
    if (!id) return;
    if (!customersRef.current.some((x) => x.id === id)) {
      emit('customer.created', { customer: { ...c, id, source: c.source ?? 'manual', createdAt: new Date().toISOString() } }, `${c.fullName} (${c.phone})`);
    }
    setCustomers((prev) => {
      const existing = prev.find((x) => x.id === id);
      if (existing) {
        return prev.map((x) => (x.id === id ? { ...x, ...c, id, tags: c.tags ?? x.tags, notes: c.notes ?? x.notes } : x));
      }
      return [
        {
          tags: [],
          notes: '',
          createdAt: new Date().toISOString(),
          source: 'manual',
          ...c,
          id,
        } as CustomerRecord,
        ...prev,
      ];
    });
    if (!opts?.silent) triggerToast(`Customer "${c.fullName}" saved`);
  };

  const updateCustomer = (id: string, updated: Partial<CustomerRecord>, opts?: UpdateOpts) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    if (!opts?.silent) triggerToast('Customer updated');
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    triggerToast('Customer removed from the customer book', 'info');
  };

  // Orders Management
  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    const custId = normalizePhone(order.customer.phone);
    const isNewCustomer = !customersRef.current.some((c) => c.id === custId);
    emit('order.created', { order }, `#${order.id} · ${order.customer.fullName} · ₹${order.total}`);
    mutateJourney((j, now) => ({
      ...advance(j, 'ordered', `Order #${order.id} · ₹${order.total}`, now),
      fullName: order.customer.fullName,
      phone: normalizePhone(order.customer.phone),
      email: order.customer.email || j.email,
      city: order.customer.city,
      orderIds: [...j.orderIds, order.id],
      followUp: j.followUp.status === 'contacted' ? { ...j.followUp, status: 'converted' } : j.followUp,
    }));
    if (isNewCustomer) {
      emit('customer.created', { customer: { id: custId, ...order.customer, source: 'order', createdAt: order.createdAt } }, `${order.customer.fullName} (${order.customer.phone})`);
    }
    // Keep the separate customer book up to date
    setCustomers((prev) => customersFromOrders([order], prev));
    // Reduce tracked stock
    setProducts((prev) =>
      prev.map((p) => {
        const qty = order.items.filter((i) => i.productId === p.id).reduce((s, i) => s + i.qty, 0);
        if (!qty || typeof p.stock !== 'number') return p;
        return { ...p, stock: Math.max(0, p.stock - qty) };
      })
    );
    triggerToast(`Order #${order.id} placed successfully!`);
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    courier?: { courierName?: string; trackingNumber?: string }
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const newHistoryItem = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: note || `Order status updated to ${newStatus}`,
        };
        return {
          ...ord,
          status: newStatus,
          trackingNumber: courier?.trackingNumber ?? ord.trackingNumber,
          courierName: courier?.courierName ?? ord.courierName,
          statusHistory: [...ord.statusHistory, newHistoryItem],
        };
      })
    );
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      emit(
        'order.status_changed',
        {
          orderId,
          previousStatus: ord.status,
          status: newStatus,
          note: note || '',
          courierName: courier?.courierName ?? ord.courierName,
          trackingNumber: courier?.trackingNumber ?? ord.trackingNumber,
          customer: { fullName: ord.customer.fullName, phone: ord.customer.phone },
          total: ord.total,
        },
        `#${orderId}: ${ord.status} → ${newStatus}`
      );
    }
    triggerToast(`Order #${orderId} moved to ${newStatus}`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    triggerToast(`Order #${orderId} deleted`, 'info');
  };

  const getOrderById = (orderId: string) => {
    const cleanId = orderId.trim().toUpperCase();
    return orders.find(
      (o) => o.id.toUpperCase() === cleanId || o.id.toUpperCase().includes(cleanId)
    );
  };

  const getOrdersByPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return [];
    return orders.filter((o) => o.customer.phone.replace(/\D/g, '').includes(cleanPhone));
  };

  // Banners Management
  const addBanner = (banner: OfferBanner) => {
    setBanners((prev) => [banner, ...prev]);
    triggerToast(`Banner "${banner.title}" created`);
  };

  const updateBanner = (id: string, updated: Partial<OfferBanner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    triggerToast('Offer banner updated');
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    triggerToast('Banner deleted', 'info');
  };

  const toggleBanner = (id: string, isActive?: boolean) => {
    setBanners((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newState = typeof isActive === 'boolean' ? isActive : !b.isActive;
          return { ...b, isActive: newState };
        }
        return b;
      })
    );
    triggerToast('Banner visibility toggled');
  };

  // Header & Footer
  const updateHeaderConfig = (config: Partial<HeaderConfig>, opts?: UpdateOpts) => {
    setHeaderConfig((prev) => ({ ...prev, ...config }));
    if (!opts?.silent) triggerToast('Header configuration updated');
  };

  const updateFooterConfig = (config: Partial<FooterConfig>, opts?: UpdateOpts) => {
    setFooterConfig((prev) => ({ ...prev, ...config }));
    if (!opts?.silent) triggerToast('Footer configuration updated');
  };

  // Page Content Manager
  const updatePageContent = <K extends keyof PageContents>(
    page: K,
    content: Partial<PageContents[K]>,
    opts?: UpdateOpts
  ) => {
    setPageContents((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        ...content,
      },
    }));
    if (!opts?.silent) triggerToast(`${page.toUpperCase()} page content updated!`);
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>, opts?: UpdateOpts) => {
    setSiteSettings((prev) => ({
      ...prev,
      ...settings,
      sections: { ...prev.sections, ...(settings.sections || {}) },
    }));
    if (!opts?.silent) triggerToast('Site settings updated');
  };

  // Cart
  const addToCart = (productId: string, sizeIndex = 0, qty = 1) => {
    setCart((prev) => {
      const existing = prev.findIndex((c) => c.id === productId && c.sizeIndex === sizeIndex);
      if (existing > -1) {
        const copy = [...prev];
        copy[existing] = { ...copy[existing], qty: copy[existing].qty + qty };
        return copy;
      }
      return [...prev, { id: productId, sizeIndex, qty }];
    });
    const item = products.find((p) => p.id === productId);
    mutateJourney((j, now) => advance(j, 'added_to_cart', `${item?.name || productId} ×${qty}`, now));
    triggerToast(`Added ${item?.name || 'Item'} to your Herbal Cart!`);
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev];
      if (!copy[index]) return prev;
      const nextQty = copy[index].qty + delta;
      if (nextQty <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index] = { ...copy[index], qty: nextQty };
      }
      return copy;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    triggerToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  const cartTotals = useMemo(() => {
    let subtotal = 0;
    cart.forEach((c) => {
      const prod = products.find((p) => p.id === c.id);
      if (prod) {
        const size = prod.sizeOptions[c.sizeIndex] || prod.sizeOptions[0];
        if (size) subtotal += size.price * c.qty;
      }
    });

    const discountRate = promoApplied ? 0.15 : 0;
    const discount = Math.round(subtotal * discountRate);
    const shipping = subtotal > 0 && subtotal < headerConfig.freeShippingThreshold ? 50 : 0;
    const total = Math.max(0, subtotal - discount + shipping);

    return { subtotal, discount, shipping, total };
  }, [cart, products, promoApplied, headerConfig.freeShippingThreshold]);

  const applyPromoCode = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (
      formatted === 'HARPUDHAS15' ||
      formatted === 'HERBAL15' ||
      formatted === 'HARPUDHAS20' ||
      formatted === 'WELCOME10'
    ) {
      setPromoCode(formatted);
      setPromoApplied(true);
      triggerToast(`Code "${formatted}" applied! 15% discount activated.`);
      return true;
    }
    triggerToast('Invalid promo code. Try HARPUDHAS15', 'error');
    return false;
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoApplied(false);
    triggerToast('Coupon code removed', 'info');
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        triggerToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      }
      triggerToast('Saved to your wishlist! ♥');
      return [...prev, productId];
    });
  };

  // Reset / Backup
  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCustomers(customersFromOrders(INITIAL_ORDERS));
    setBanners(INITIAL_BANNERS);
    setHeaderConfig(INITIAL_HEADER_CONFIG);
    setFooterConfig(INITIAL_FOOTER_CONFIG);
    setPageContents(INITIAL_PAGE_CONTENTS);
    setSiteSettings(INITIAL_SITE_SETTINGS);
    localStorage.clear();
    // Keep webhook & courier credentials across a data reset (re-persist them)
    setIntegrations((prev) => ({ ...prev }));
    triggerToast('Store reset to factory default data!', 'info');
  };

  const exportDataJSON = () =>
    JSON.stringify(
      {
        products,
        orders,
        customers,
        banners,
        headerConfig,
        footerConfig,
        pageContents,
        siteSettings,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products) setProducts(data.products);
      if (data.orders) setOrders(data.orders);
      if (data.customers) setCustomers(data.customers);
      else if (data.orders) setCustomers(customersFromOrders(data.orders));
      if (data.banners) setBanners(data.banners);
      if (data.headerConfig) setHeaderConfig(data.headerConfig);
      if (data.footerConfig) setFooterConfig(data.footerConfig);
      if (data.pageContents) setPageContents(mergePageContents(data.pageContents));
      if (data.siteSettings) setSiteSettings(mergeSiteSettings(data.siteSettings));
      triggerToast('Store data imported successfully!');
      return true;
    } catch {
      triggerToast('Failed to parse JSON file.', 'error');
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        getProductById,

        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        getOrderById,
        getOrdersByPhone,

        customers,
        upsertCustomer,
        updateCustomer,
        deleteCustomer,

        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBanner,

        headerConfig,
        updateHeaderConfig,
        footerConfig,
        updateFooterConfig,

        pageContents,
        updatePageContent,

        siteSettings,
        updateSiteSettings,

        integrations,
        updateIntegrations,
        webhookLog,
        clearWebhookLog,
        syncAllToWebhook,
        sendTestWebhook,
        retryWebhook,

        journeys,
        trackPageView,
        trackProductView,
        trackCheckoutStarted,
        identifyVisitor,
        updateJourney,
        deleteJourney,
        currentVisitor,
        signIn,
        signOut,

        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotals,
        promoCode,
        promoApplied,
        applyPromoCode,
        removePromoCode,

        wishlist,
        toggleWishlist,

        showCartDrawer,
        setShowCartDrawer,
        toast,
        triggerToast,

        resetToDefaults,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
