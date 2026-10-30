'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Order,
  OrderStatus,
  OfferBanner,
  HeaderConfig,
  FooterConfig,
  CartItem,
  PageContents,
} from '@/types/store';
import {
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_ORDERS,
  INITIAL_HEADER_CONFIG,
  INITIAL_FOOTER_CONFIG,
  INITIAL_PAGE_CONTENTS,
} from '@/data/initialData';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
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
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByPhone: (phone: string) => Order[];

  // Banners
  banners: OfferBanner[];
  addBanner: (banner: OfferBanner) => void;
  updateBanner: (id: string, updated: Partial<OfferBanner>) => void;
  deleteBanner: (id: string) => void;
  toggleBanner: (id: string, isActive?: boolean) => void;

  // Header & Footer
  headerConfig: HeaderConfig;
  updateHeaderConfig: (config: Partial<HeaderConfig>) => void;
  footerConfig: FooterConfig;
  updateFooterConfig: (config: Partial<FooterConfig>) => void;

  // Page Content Manager for ALL pages
  pageContents: PageContents;
  updatePageContent: <K extends keyof PageContents>(page: K, content: Partial<PageContents[K]>) => void;

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
  BANNERS: 'harpudhas_banners_v3',
  HEADER: 'harpudhas_header_v3',
  FOOTER: 'harpudhas_footer_v3',
  PAGE_CONTENTS: 'harpudhas_pages_v3',
  CART: 'harpudhas_cart_v3',
  WISHLIST: 'harpudhas_wishlist_v3',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  // States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [banners, setBanners] = useState<OfferBanner[]>(INITIAL_BANNERS);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(INITIAL_HEADER_CONFIG);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(INITIAL_FOOTER_CONFIG);
  const [pageContents, setPageContents] = useState<PageContents>(INITIAL_PAGE_CONTENTS);

  const [cart, setCart] = useState<CartItem[]>([
    { id: 'hair-oil-1', sizeIndex: 0, qty: 1 },
    { id: 'face-cream-1', sizeIndex: 0, qty: 1 },
  ]);
  const [wishlist, setWishlist] = useState<string[]>(['hair-shampoo-1']);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);

  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProds) setProducts(JSON.parse(storedProds));

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (storedOrders) setOrders(JSON.parse(storedOrders));

      const storedBanners = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (storedBanners) setBanners(JSON.parse(storedBanners));

      const storedHeader = localStorage.getItem(STORAGE_KEYS.HEADER);
      if (storedHeader) setHeaderConfig(JSON.parse(storedHeader));

      const storedFooter = localStorage.getItem(STORAGE_KEYS.FOOTER);
      if (storedFooter) setFooterConfig(JSON.parse(storedFooter));

      const storedPages = localStorage.getItem(STORAGE_KEYS.PAGE_CONTENTS);
      if (storedPages) setPageContents(JSON.parse(storedPages));

      const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (storedCart) setCart(JSON.parse(storedCart));

      const storedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch (e) {
      console.warn('Failed to load local store data:', e);
    }
  }, []);

  // Save to LocalStorage helpers
  useEffect(() => {
    if (isClient) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  }, [banners, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem(STORAGE_KEYS.HEADER, JSON.stringify(headerConfig));
  }, [headerConfig, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(footerConfig));
  }, [footerConfig, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem(STORAGE_KEYS.PAGE_CONTENTS, JSON.stringify(pageContents));
  }, [pageContents, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist, isClient]);

  // Toast handler
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  };

  // Products CRUD
  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    triggerToast(`Added product "${product.name}"`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    triggerToast('Product details updated successfully');
  };

  const deleteProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    setProducts((prev) => prev.filter((item) => item.id !== id));
    triggerToast(`Deleted "${p?.name || 'Product'}"`, 'info');
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // Orders Management
  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
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
    triggerToast(`Order #${orderId} moved to ${newStatus}`);
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
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
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
  const updateHeaderConfig = (config: Partial<HeaderConfig>) => {
    setHeaderConfig((prev) => ({ ...prev, ...config }));
    triggerToast('Header configuration updated');
  };

  const updateFooterConfig = (config: Partial<FooterConfig>) => {
    setFooterConfig((prev) => ({ ...prev, ...config }));
    triggerToast('Footer configuration updated');
  };

  // Page Content Manager
  const updatePageContent = <K extends keyof PageContents>(page: K, content: Partial<PageContents[K]>) => {
    setPageContents((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        ...content,
      },
    }));
    triggerToast(`${page.toUpperCase()} page content updated!`);
  };

  // Cart
  const addToCart = (productId: string, sizeIndex = 0, qty = 1) => {
    setCart((prev) => {
      const existing = prev.findIndex(
        (c) => c.id === productId && c.sizeIndex === sizeIndex
      );
      if (existing > -1) {
        const copy = [...prev];
        copy[existing].qty += qty;
        return copy;
      }
      return [...prev, { id: productId, sizeIndex, qty }];
    });
    const item = products.find((p) => p.id === productId);
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

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

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
    setBanners(INITIAL_BANNERS);
    setHeaderConfig(INITIAL_HEADER_CONFIG);
    setFooterConfig(INITIAL_FOOTER_CONFIG);
    setPageContents(INITIAL_PAGE_CONTENTS);
    localStorage.clear();
    triggerToast('Store reset to factory default data!', 'info');
  };

  const exportDataJSON = () => {
    return JSON.stringify(
      {
        products,
        orders,
        banners,
        headerConfig,
        footerConfig,
        pageContents,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products) setProducts(data.products);
      if (data.orders) setOrders(data.orders);
      if (data.banners) setBanners(data.banners);
      if (data.headerConfig) setHeaderConfig(data.headerConfig);
      if (data.footerConfig) setFooterConfig(data.footerConfig);
      if (data.pageContents) setPageContents(data.pageContents);
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
        getProductById,

        orders,
        addOrder,
        updateOrderStatus,
        getOrderById,
        getOrdersByPhone,

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
