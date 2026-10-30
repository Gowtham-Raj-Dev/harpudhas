'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import {
  Product,
  Order,
  OrderStatus,
  OfferBanner,
  BannerTargetPage,
  CategoryType,
  FormatType,
  PageContents,
} from '@/types/store';
import {
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
  Sliders,
  Megaphone,
  Layers,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  Save,
  RotateCcw,
  Download,
  ArrowRight,
  ExternalLink,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';

export default function AdminPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,

    orders,
    updateOrderStatus,

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

    resetToDefaults,
    exportDataJSON,
    triggerToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'banners' | 'pages' | 'header' | 'footer' | 'settings'
  >('dashboard');

  // Orders State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [courierNameInput, setCourierNameInput] = useState('Delhivery Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Products State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Product Form Fields
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pTamilName, setPTamilName] = useState('');
  const [pCategory, setPCategory] = useState<CategoryType>('Hair Care');
  const [pFormat, setPFormat] = useState<FormatType>('Oil & Serum');
  const [pPrice, setPPrice] = useState<number>(499);
  const [pMrp, setPMrp] = useState<number>(649);
  const [pRating, setPRating] = useState<number>(4.9);
  const [pReviews, setPReviews] = useState<number>(120);
  const [pBadge, setPBadge] = useState('Bestseller');
  const [pImage, setPImage] = useState('/images/hair-oil.jpg');
  const [pShortDesc, setPShortDesc] = useState('');
  const [pIngredients, setPIngredients] = useState('');
  const [pRitual, setPRitual] = useState('');
  const [pSize1Label, setPSize1Label] = useState('100 ml');
  const [pSize1Price, setPSize1Price] = useState(499);
  const [pSize2Label, setPSize2Label] = useState('200 ml');
  const [pSize2Price, setPSize2Price] = useState(899);

  // Banner State & Upload
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<OfferBanner | null>(null);
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bBadge, setBBadge] = useState('Special Offer');
  const [bDiscountCode, setBDiscountCode] = useState('HARPUDHAS15');
  const [bButtonText, setBButtonText] = useState('Shop Collection');
  const [bButtonLink, setBButtonLink] = useState('/shop');
  const [bImageUrl, setBImageUrl] = useState('/images/hero-banner.jpg');
  const [bTargetPage, setBTargetPage] = useState<BannerTargetPage>('home');
  const [bIsActive, setBIsActive] = useState(true);

  // Page Contents Local State
  const [activePageContentTab, setActivePageContentTab] = useState<'home' | 'about' | 'contact' | 'shop'>('home');
  const [pagesForm, setPagesForm] = useState<PageContents>(pageContents);

  // Header & Footer Local State
  const [headerForm, setHeaderForm] = useState(headerConfig);
  const [footerForm, setFooterForm] = useState(footerConfig);

  // Handle Banner Image File Upload (Base64)
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerToast('Image file should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBImageUrl(reader.result);
        triggerToast('Image uploaded successfully into banner preview!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Edit Product
  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPId(prod.id);
    setPName(prod.name);
    setPTamilName(prod.tamilName);
    setPCategory(prod.category);
    setPFormat(prod.format);
    setPPrice(prod.price);
    setPMrp(prod.mrp);
    setPRating(prod.rating);
    setPReviews(prod.reviews);
    setPBadge(prod.badge);
    setPImage(prod.image);
    setPShortDesc(prod.shortDesc);
    setPIngredients(prod.ingredients.join(', '));
    setPRitual(prod.ritual);

    if (prod.sizeOptions && prod.sizeOptions.length > 0) {
      setPSize1Label(prod.sizeOptions[0]?.label || '100 ml');
      setPSize1Price(prod.sizeOptions[0]?.price || prod.price);
      if (prod.sizeOptions.length > 1) {
        setPSize2Label(prod.sizeOptions[1]?.label || '200 ml');
        setPSize2Price(prod.sizeOptions[1]?.price || prod.price * 1.8);
      }
    }
    setIsAddingProduct(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setPId(`product-${Date.now().toString().slice(-4)}`);
    setPName('');
    setPTamilName('');
    setPCategory('Hair Care');
    setPFormat('Oil & Serum');
    setPPrice(499);
    setPMrp(649);
    setPRating(4.9);
    setPReviews(45);
    setPBadge('New Launch');
    setPImage('/images/hair-oil.jpg');
    setPShortDesc('');
    setPIngredients('Fresh Hibiscus, Bhringraj Leaves, Cold-Pressed Coconut Oil');
    setPRitual('Apply 2 teaspoons gently onto clean scalp and massage for 10 minutes.');
    setPSize1Label('100 ml');
    setPSize1Price(499);
    setPSize2Label('200 ml');
    setPSize2Price(899);
    setIsAddingProduct(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      triggerToast('Product name is required', 'error');
      return;
    }

    const sizes = [
      { label: pSize1Label.trim(), price: Number(pSize1Price) },
      ...(pSize2Label.trim() ? [{ label: pSize2Label.trim(), price: Number(pSize2Price) }] : []),
    ];

    const productPayload: Product = {
      id: pId || `prod-${Date.now()}`,
      name: pName.trim(),
      tamilName: pTamilName.trim() || pName.trim(),
      category: pCategory,
      format: pFormat,
      price: Number(pPrice),
      mrp: Number(pMrp),
      sizeOptions: sizes,
      rating: Number(pRating),
      reviews: Number(pReviews),
      badge: pBadge.trim() || 'Botanical',
      image: pImage.trim() || '/images/hair-oil.jpg',
      shortDesc: pShortDesc.trim(),
      ingredients: pIngredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      ritual: pRitual.trim(),
      inStock: true,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }
    setIsAddingProduct(false);
  };

  // Open Edit Banner
  const openEditBanner = (b: OfferBanner) => {
    setEditingBanner(b);
    setBTitle(b.title);
    setBSubtitle(b.subtitle);
    setBBadge(b.badge || 'Offer');
    setBDiscountCode(b.discountCode || '');
    setBButtonText(b.buttonText);
    setBButtonLink(b.buttonLink);
    setBImageUrl(b.imageUrl || '/images/hero-banner.jpg');
    setBTargetPage(b.targetPage);
    setBIsActive(b.isActive);
    setIsAddingBanner(true);
  };

  const openNewBanner = () => {
    setEditingBanner(null);
    setBTitle('Grand Herbal Radiance Sale — Flat 20% OFF');
    setBSubtitle('Pure cold-pressed virgin seed oils and Kashmiri saffron radiance creams.');
    setBBadge('Limited Deal');
    setBDiscountCode('HARPUDHAS20');
    setBButtonText('Explore Collection');
    setBButtonLink('/shop');
    setBImageUrl('/images/hero-banner.jpg');
    setBTargetPage('home');
    setBIsActive(true);
    setIsAddingBanner(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim()) {
      triggerToast('Banner title is required', 'error');
      return;
    }

    const payload: OfferBanner = {
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      title: bTitle.trim(),
      subtitle: bSubtitle.trim(),
      badge: bBadge.trim(),
      discountCode: bDiscountCode.trim() || undefined,
      buttonText: bButtonText.trim(),
      buttonLink: bButtonLink.trim(),
      imageUrl: bImageUrl,
      targetPage: bTargetPage,
      isActive: bIsActive,
    };

    if (editingBanner) {
      updateBanner(editingBanner.id, payload);
    } else {
      addBanner(payload);
    }
    setIsAddingBanner(false);
  };

  // Dispatch Shipment
  const handleConfirmShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingModalOrder) return;
    const tracking = trackingNumberInput.trim() || `DELHIVERY-TN${Math.floor(100000 + Math.random() * 900000)}`;
    const courier = courierNameInput.trim() || 'Delhivery Express';

    updateOrderStatus(
      shippingModalOrder.id,
      'Shipped',
      `Order dispatched via ${courier} (Tracking: ${tracking})`,
      { courierName: courier, trackingNumber: tracking }
    );
    setShippingModalOrder(null);
    setTrackingNumberInput('');
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.customer.city.toLowerCase().includes(q);

    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = productSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.tamilName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchSearch && matchCat;
  });

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const activeBannersCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP ADMIN NAV BAR (Clean White & Crisp Border) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-botanical-800 text-sandal-400 flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-xl text-slate-900 tracking-wide">
                Hàrpudha's Admin Suite
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Store
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Complete Control: Orders, Catalog, Dynamic Slider Banners & Page Contents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors border border-slate-200 shadow-2xs"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>
          <Link
            href="/orders"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 transition-colors border border-emerald-200 shadow-2xs"
          >
            <span>Live Order Tracker</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 2. LEFT SIDEBAR NAVIGATION (Crisp White Sidebar) */}
        <aside className="w-full lg:w-64 bg-white border-r border-slate-200 p-4 space-y-1.5 shrink-0">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: `Orders (${pendingOrders} Pending)`, icon: PackageCheck, badge: pendingOrders },
            { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
            { id: 'banners', label: `Hero Carousel Banners (${banners.length})`, icon: Megaphone },
            { id: 'pages', label: 'Page Content Manager', icon: FileText },
            { id: 'header', label: 'Header Settings', icon: Sliders },
            { id: 'footer', label: 'Footer & Contacts', icon: Layers },
            { id: 'settings', label: 'Backup & Reset', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-botanical-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sandal-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Store Analytics & Records</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Live snapshot of customer orders, revenue pipeline, and product catalog.
                </p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Order Value
                  </span>
                  <div className="text-2xl font-serif font-bold text-emerald-700">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500">Across {orders.length} placed orders</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Pending Orders
                  </span>
                  <div className="text-2xl font-serif font-bold text-amber-600">
                    {pendingOrders}
                  </div>
                  <p className="text-[11px] text-slate-500">Awaiting your approval</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Catalog Items
                  </span>
                  <div className="text-2xl font-serif font-bold text-botanical-800">
                    {products.length}
                  </div>
                  <p className="text-[11px] text-slate-500">Hair, Face, and Skin categories</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Hero Banners
                  </span>
                  <div className="text-2xl font-serif font-bold text-teal-700">
                    {activeBannersCount} / {banners.length} Active
                  </div>
                  <p className="text-[11px] text-slate-500">Gliding in carousel slider</p>
                </div>
              </div>

              {/* Quick Recent Orders */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-slate-900">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-botanical-800 hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Next Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-mono font-bold text-botanical-800">#{ord.id}</td>
                          <td className="p-3 font-bold text-slate-800">{ord.customer.fullName}</td>
                          <td className="p-3 text-slate-600">{ord.customer.phone}</td>
                          <td className="p-3 font-bold text-emerald-700">₹{ord.total}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ord.status === 'Processing'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ord.status === 'Confirmed'
                                  ? 'bg-purple-100 text-purple-800'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {ord.status === 'Pending' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'Confirmed', 'Confirmed by Admin')}
                                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px]"
                              >
                                Confirm Order
                              </button>
                            )}
                            {ord.status === 'Confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'Processing', 'Started packing')}
                                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
                              >
                                Move to Packing
                              </button>
                            )}
                            {ord.status === 'Processing' && (
                              <button
                                onClick={() => setShippingModalOrder(ord)}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                              >
                                Dispatch & Ship
                              </button>
                            )}
                            {ord.status === 'Shipped' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'Delivered', 'Delivered to recipient')}
                                className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px]"
                              >
                                Mark Delivered
                              </button>
                            )}
                            {ord.status === 'Delivered' && (
                              <span className="text-emerald-700 text-xs font-semibold">✓ Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Orders & Fulfillment Pipeline</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Full records view: Confirm orders, move to packing, dispatch with tracking number, and mark delivered.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by Order ID, customer name, phone, city..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-botanical-700"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="all">All Orders ({orders.length})</option>
                    <option value="Pending">Pending ({orders.filter((o) => o.status === 'Pending').length})</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Order ID</th>
                        <th className="p-3.5">Customer & Phone</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Total Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Stage Progression Action</th>
                        <th className="p-3.5 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            No orders found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5">
                              <span className="font-mono font-bold text-botanical-800 text-sm">#{ord.id}</span>
                              <span className="block text-[10px] text-slate-400">
                                {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-slate-900">{ord.customer.fullName}</p>
                              <p className="text-slate-600 text-[11px] font-medium">{ord.customer.phone}</p>
                              <p className="text-slate-400 text-[10px] truncate max-w-[160px]">
                                {ord.customer.city}, {ord.customer.state}
                              </p>
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-slate-800">{ord.items.length} item(s)</span>
                              <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                {ord.items.map((i) => i.productName).join(', ')}
                              </p>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-emerald-700 text-sm">₹{ord.total}</span>
                              <span className="block text-[10px] text-slate-400 uppercase">
                                {ord.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  updateOrderStatus(ord.id, e.target.value as OrderStatus, `Status updated to ${e.target.value} by Admin`)
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : ord.status === 'Shipped'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : ord.status === 'Processing'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : ord.status === 'Confirmed'
                                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : 'bg-yellow-50 text-yellow-800 border-yellow-300'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3.5 text-center">
                              {ord.status === 'Pending' && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(ord.id, 'Confirmed', 'Order confirmed by store admin')
                                  }
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                                >
                                  ✓ Confirm Order
                                </button>
                              )}
                              {ord.status === 'Confirmed' && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(ord.id, 'Processing', 'Packed with tamper seal')
                                  }
                                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                                >
                                  📦 Move to Packing
                                </button>
                              )}
                              {ord.status === 'Processing' && (
                                <button
                                  onClick={() => setShippingModalOrder(ord)}
                                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                                >
                                  🚚 Dispatch & Ship
                                </button>
                              )}
                              {ord.status === 'Shipped' && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(ord.id, 'Delivered', 'Delivered safely to customer')
                                  }
                                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                                >
                                  🎉 Mark Delivered
                                </button>
                              )}
                              {ord.status === 'Delivered' && (
                                <span className="text-emerald-700 font-semibold text-xs">✓ Complete</span>
                              )}
                              {ord.status === 'Cancelled' && (
                                <span className="text-rose-600 font-semibold text-xs">Cancelled</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setViewingOrder(ord)}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="View Complete Order"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Products Catalog</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Add new products, edit pricing, update descriptions, and manage stock status.
                  </p>
                </div>
                <button
                  onClick={openNewProduct}
                  className="px-4 py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search product by name, herb, tamil name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none"
                >
                  <option value="all">All Categories ({products.length})</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Face Care">Face Care</option>
                  <option value="Skin & Body">Skin & Body</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Selling Price / MRP</th>
                        <th className="p-3.5">Sizes</th>
                        <th className="p-3.5">Rating</th>
                        <th className="p-3.5">Badge</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                                <Image
                                  src={withBasePath(p.image)}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                                <p className="text-[11px] text-emerald-800 font-medium">{p.tamilName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800">{p.category}</span>
                            <span className="block text-[10px] text-slate-400">{p.format}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-emerald-700 text-sm">₹{p.price}</span>
                            <span className="text-slate-400 line-through ml-1.5">₹{p.mrp}</span>
                          </td>
                          <td className="p-3.5 text-slate-600">
                            {p.sizeOptions?.map((s) => s.label).join(', ')}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-amber-600">★ {p.rating}</span>
                            <span className="text-slate-400 text-[10px] block">({p.reviews} revs)</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {p.badge}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/product/${p.id}`}
                                target="_blank"
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                                title="Preview Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => openEditProduct(p)}
                                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HERO CAROUSEL BANNERS WITH IMAGE UPLOAD & ON/OFF */}
          {activeTab === 'banners' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">
                    Hero Carousel Banners (Image Upload & Slider)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload image banners, toggle ON/OFF, and watch them automatically slide in the Home Page hero carousel!
                  </p>
                </div>
                <button
                  onClick={openNewBanner}
                  className="px-4 py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload & Create Banner</span>
                </button>
              </div>

              {/* Banners List */}
              <div className="grid grid-cols-1 gap-5">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        {/* ON/OFF TOGGLE SWITCH */}
                        <button
                          onClick={() => toggleBanner(b.id)}
                          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            b.isActive
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {b.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              <span>ACTIVE (IN SLIDER)</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              <span>OFF (HIDDEN)</span>
                            </>
                          )}
                        </button>

                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          Target Page: <span className="uppercase font-bold text-botanical-800">{b.targetPage}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditBanner(b)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete banner "${b.title}"?`)) {
                              deleteBanner(b.id);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Banner Image Preview */}
                    <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
                      <Image
                        src={withBasePath(b.imageUrl || '/images/hero-banner.jpg')}
                        alt={b.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

                      <div className="relative z-10 h-full p-6 flex flex-col justify-between text-white">
                        <div className="flex items-center gap-2">
                          {b.badge && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-sandal-500 text-botanical-950">
                              {b.badge}
                            </span>
                          )}
                          {b.discountCode && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/20 border border-white/25">
                              Code: {b.discountCode}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">{b.title}</h3>
                          <p className="text-xs text-sandal-100/90 max-w-lg mt-1 line-clamp-1">{b.subtitle}</p>
                          <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-sandal-500 text-botanical-950 font-bold text-xs">
                            {b.buttonText} →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAGE CONTENT MANAGER (EDIT ALL PAGES CONTENT) */}
          {activeTab === 'pages' && (
            <div className="space-y-6 animate-fadeIn max-w-4xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Page Content Manager</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Change text, titles, subtitles, and paragraphs across Home, About, Contact, and Shop pages.
                </p>
              </div>

              {/* Sub-Tabs for Pages */}
              <div className="flex border-b border-slate-200 gap-2 pb-1 overflow-x-auto">
                {[
                  { id: 'home', label: 'Home Page Content' },
                  { id: 'about', label: 'About Us Content' },
                  { id: 'contact', label: 'Contact Us Content' },
                  { id: 'shop', label: 'Shop Catalog Content' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePageContentTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activePageContentTab === tab.id
                        ? 'bg-botanical-800 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* HOME CONTENT FORM */}
              {activePageContentTab === 'home' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
                    Home Page Headings & Subtitles
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hero Badge Pill Text</label>
                    <input
                      type="text"
                      value={pagesForm.home.heroBadge}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          home: { ...pagesForm.home, heroBadge: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-botanical-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hero Main Headline</label>
                    <input
                      type="text"
                      value={pagesForm.home.heroTitle}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          home: { ...pagesForm.home, heroTitle: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-botanical-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hero Subtitle Paragraph</label>
                    <textarea
                      rows={2}
                      value={pagesForm.home.heroSubtitle}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          home: { ...pagesForm.home, heroSubtitle: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-botanical-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Category Section Title</label>
                      <input
                        type="text"
                        value={pagesForm.home.catTitle}
                        onChange={(e) =>
                          setPagesForm({
                            ...pagesForm,
                            home: { ...pagesForm.home, catTitle: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Products Section Title</label>
                      <input
                        type="text"
                        value={pagesForm.home.prodTitle}
                        onChange={(e) =>
                          setPagesForm({
                            ...pagesForm,
                            home: { ...pagesForm.home, prodTitle: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => updatePageContent('home', pagesForm.home)}
                    className="px-6 py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Home Page Content</span>
                  </button>
                </div>
              )}

              {/* ABOUT CONTENT FORM */}
              {activePageContentTab === 'about' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
                    About Us / Heritage Page Content
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Page Headline</label>
                    <input
                      type="text"
                      value={pagesForm.about.title}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          about: { ...pagesForm.about, title: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Page Subtitle</label>
                    <input
                      type="text"
                      value={pagesForm.about.subtitle}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          about: { ...pagesForm.about, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Story Section Title</label>
                    <input
                      type="text"
                      value={pagesForm.about.storyTitle}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          about: { ...pagesForm.about, storyTitle: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Story Paragraph 1</label>
                    <textarea
                      rows={3}
                      value={pagesForm.about.storyText1}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          about: { ...pagesForm.about, storyText1: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <button
                    onClick={() => updatePageContent('about', pagesForm.about)}
                    className="px-6 py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save About Page Content</span>
                  </button>
                </div>
              )}

              {/* CONTACT CONTENT FORM */}
              {activePageContentTab === 'contact' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
                    Contact Page Content
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Contact Title</label>
                    <input
                      type="text"
                      value={pagesForm.contact.title}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          contact: { ...pagesForm.contact, title: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Operating Hours</label>
                    <input
                      type="text"
                      value={pagesForm.contact.hours}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          contact: { ...pagesForm.contact, hours: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <button
                    onClick={() => updatePageContent('contact', pagesForm.contact)}
                    className="px-6 py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Contact Page Content</span>
                  </button>
                </div>
              )}

              {/* SHOP CONTENT FORM */}
              {activePageContentTab === 'shop' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
                    Shop / Catalog Header Content
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Shop Catalog Headline</label>
                    <input
                      type="text"
                      value={pagesForm.shop.title}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          shop: { ...pagesForm.shop, title: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Shop Subtitle Description</label>
                    <input
                      type="text"
                      value={pagesForm.shop.subtitle}
                      onChange={(e) =>
                        setPagesForm({
                          ...pagesForm,
                          shop: { ...pagesForm.shop, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <button
                    onClick={() => updatePageContent('shop', pagesForm.shop)}
                    className="px-6 py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Shop Page Content</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: HEADER SETTINGS */}
          {activeTab === 'header' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Header Settings</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Change brand title, contact numbers, and promo coupon code chip.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Brand Title (Logo)</label>
                    <input
                      type="text"
                      value={headerForm.logoTitle}
                      onChange={(e) => setHeaderForm({ ...headerForm, logoTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tagline Subtitle</label>
                    <input
                      type="text"
                      value={headerForm.logoSubtitle}
                      onChange={(e) => setHeaderForm({ ...headerForm, logoSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Support Phone</label>
                    <input
                      type="text"
                      value={headerForm.phone}
                      onChange={(e) => setHeaderForm({ ...headerForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">WhatsApp Support</label>
                    <input
                      type="text"
                      value={headerForm.whatsapp}
                      onChange={(e) => setHeaderForm({ ...headerForm, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Free Shipping Minimum Amount (₹)</label>
                  <input
                    type="number"
                    value={headerForm.freeShippingThreshold}
                    onChange={(e) =>
                      setHeaderForm({ ...headerForm, freeShippingThreshold: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <button
                  onClick={() => updateHeaderConfig(headerForm)}
                  className="px-6 py-3 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Header Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: FOOTER SETTINGS */}
          {activeTab === 'footer' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Footer & Facility Info</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage brand heritage summary, physical address, and contact details.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Brand Philosophy Paragraph</label>
                  <textarea
                    rows={3}
                    value={footerForm.brandDescription}
                    onChange={(e) => setFooterForm({ ...footerForm, brandDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Facility Street Address</label>
                  <input
                    type="text"
                    value={footerForm.address}
                    onChange={(e) => setFooterForm({ ...footerForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Support Phone</label>
                    <input
                      type="text"
                      value={footerForm.phone}
                      onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Support Email</label>
                    <input
                      type="email"
                      value={footerForm.email}
                      onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Copyright Text</label>
                  <input
                    type="text"
                    value={footerForm.copyrightText}
                    onChange={(e) => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <button
                  onClick={() => updateFooterConfig(footerForm)}
                  className="px-6 py-3 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Footer Configuration</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: BACKUP & RESET */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Database Backup & Recovery</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Export snapshot of orders, products, and banners, or reset to factory demo state.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Export Store Data (JSON)</h3>
                    <p className="text-xs text-slate-500">Download backup file of all customer orders and products</p>
                  </div>
                  <button
                    onClick={() => {
                      const data = exportDataJSON();
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `harpudhas_backup_${Date.now()}.json`;
                      a.click();
                      triggerToast('Backup downloaded successfully!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Reset to Factory Defaults</h3>
                    <p className="text-xs text-slate-500">Reverts all products, orders, banners, and headers to initial state</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all store data to factory defaults?')) {
                        resetToDefaults();
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Factory Reset Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {editingProduct ? `Edit Formulation: ${editingProduct.name}` : 'Add New Herbal Product'}
              </h3>
              <button
                onClick={() => setIsAddingProduct(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Product Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Hibiscus Root Hair Oil"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-botanical-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tamil Traditional Name</label>
                  <input
                    type="text"
                    placeholder="e.g. செம்பருத்தி கூந்தல் தைலம்"
                    value={pTamilName}
                    onChange={(e) => setPTamilName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-botanical-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Hair Care">Hair Care</option>
                    <option value="Face Care">Face Care</option>
                    <option value="Skin & Body">Skin & Body</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Format</label>
                  <select
                    value={pFormat}
                    onChange={(e) => setPFormat(e.target.value as FormatType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Oil & Serum">Oil & Serum</option>
                    <option value="Shampoo & Cleanser">Shampoo & Cleanser</option>
                    <option value="Cream & Butter">Cream & Butter</option>
                    <option value="Mask & Soap">Mask & Soap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Original MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={pMrp}
                    onChange={(e) => setPMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Badge</label>
                  <input
                    type="text"
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <label className="font-bold text-slate-800 block">Sizes & Volume Pricing</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Size 1 (e.g. 100 ml)"
                    value={pSize1Label}
                    onChange={(e) => setPSize1Label(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                  />
                  <input
                    type="number"
                    placeholder="Price 1 (₹)"
                    value={pSize1Price}
                    onChange={(e) => setPSize1Price(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Size 2 (e.g. 200 ml)"
                    value={pSize2Label}
                    onChange={(e) => setPSize2Label(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                  />
                  <input
                    type="number"
                    placeholder="Price 2 (₹)"
                    value={pSize2Price}
                    onChange={(e) => setPSize2Price(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Image Picker */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Product Image</label>
                <select
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 mb-1"
                >
                  <option value="/images/hair-oil.jpg">Hair Oil (/images/hair-oil.jpg)</option>
                  <option value="/images/hair-shampoo.jpg">Hair Shampoo (/images/hair-shampoo.jpg)</option>
                  <option value="/images/hair-serum.jpg">Hair Serum (/images/hair-serum.jpg)</option>
                  <option value="/images/face-cream.jpg">Face Cream (/images/face-cream.jpg)</option>
                  <option value="/images/face-wash.jpg">Face Wash (/images/face-wash.jpg)</option>
                  <option value="/images/face-pack.jpg">Face Pack (/images/face-pack.jpg)</option>
                  <option value="/images/body-butter.jpg">Body Butter (/images/body-butter.jpg)</option>
                  <option value="/images/body-lotion.jpg">Body Lotion (/images/body-lotion.jpg)</option>
                  <option value="/images/body-soap.jpg">Body Soap (/images/body-soap.jpg)</option>
                  <option value="/images/hero-banner.jpg">Hero Banner (/images/hero-banner.jpg)</option>
                </select>
                <input
                  type="text"
                  placeholder="Or custom URL"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  required
                  value={pShortDesc}
                  onChange={(e) => setPShortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Ingredients (Comma separated)</label>
                <input
                  type="text"
                  value={pIngredients}
                  onChange={(e) => setPIngredients(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT BANNER WITH IMAGE UPLOAD */}
      {isAddingBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {editingBanner ? 'Edit Hero Banner' : 'Upload & Create Hero Banner'}
              </h3>
              <button
                onClick={() => setIsAddingBanner(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              {/* IMAGE UPLOAD SECTION */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-botanical-800" />
                    <span>Upload Banner Image from Computer</span>
                  </span>
                  <span className="text-[11px] text-slate-400">JPG, PNG (up to 5MB)</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-botanical-800 file:text-white hover:file:bg-botanical-900 cursor-pointer"
                />

                {/* Preset or Custom Image Selection */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="font-bold text-slate-600 block mb-1">Or choose an existing store photo:</label>
                  <select
                    value={bImageUrl}
                    onChange={(e) => setBImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium"
                  >
                    <option value="/images/hero-banner.jpg">Hero Banner Studio Photo (/images/hero-banner.jpg)</option>
                    <option value="/images/hair-oil.jpg">Hibiscus Hair Oil Photo (/images/hair-oil.jpg)</option>
                    <option value="/images/face-cream.jpg">Kashmiri Saffron Cream Photo (/images/face-cream.jpg)</option>
                    <option value="/images/body-soap.jpg">Artisan Herbal Soap Photo (/images/body-soap.jpg)</option>
                  </select>
                </div>

                {/* Image Live Preview */}
                {bImageUrl && (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 mt-2">
                    <Image
                      src={withBasePath(bImageUrl)}
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      Image Active Preview
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Banner Heading Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Herbal Harvest Festival"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subtitle Description</label>
                <input
                  type="text"
                  placeholder="e.g. Pure cold-pressed virgin seed oils handmade in micro-batches."
                  value={bSubtitle}
                  onChange={(e) => setBSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Badge Label</label>
                  <input
                    type="text"
                    value={bBadge}
                    onChange={(e) => setBBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Coupon Code</label>
                  <input
                    type="text"
                    value={bDiscountCode}
                    onChange={(e) => setBDiscountCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase"
                  />
                </div>
              </div>

              {/* TARGET PAGE & ON/OFF */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Show On Which Page? (Target Page)
                  </label>
                  <select
                    value={bTargetPage}
                    onChange={(e) => setBTargetPage(e.target.value as BannerTargetPage)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  >
                    <option value="home">Home Page (Hero Carousel Slider)</option>
                    <option value="shop">Shop Catalog Page</option>
                    <option value="product">Product Detail Pages</option>
                    <option value="all">Show on ALL Pages</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block">Banner Active Status (In Slider)</span>
                    <span className="text-[11px] text-slate-500">Toggle whether this banner appears in the carousel</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBIsActive(!bIsActive)}
                    className={`px-4 py-1.5 rounded-full font-bold text-xs ${
                      bIsActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {bIsActive ? 'LIVE (ON)' : 'HIDDEN (OFF)'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Button Text</label>
                  <input
                    type="text"
                    value={bButtonText}
                    onChange={(e) => setBButtonText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Button Link Target</label>
                  <input
                    type="text"
                    value={bButtonLink}
                    onChange={(e) => setBButtonLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingBanner(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-botanical-800 hover:bg-botanical-900 text-white font-bold"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW ORDER INVOICE */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Order Invoice #{viewingOrder.id}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-botanical-800 text-white">
                  {viewingOrder.status}
                </span>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1 border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">{viewingOrder.customer.fullName}</p>
                <p className="text-slate-700">Phone: {viewingOrder.customer.phone}</p>
                {viewingOrder.customer.email && (
                  <p className="text-slate-700">Email: {viewingOrder.customer.email}</p>
                )}
                <p className="text-slate-700 pt-1">
                  Address: {viewingOrder.customer.address}, {viewingOrder.customer.city},{' '}
                  {viewingOrder.customer.state} - {viewingOrder.customer.pincode}
                </p>
                {viewingOrder.customer.notes && (
                  <p className="text-amber-700 pt-1">Notes: {viewingOrder.customer.notes}</p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-500 uppercase">Items Ordered:</h4>
                <div className="space-y-2">
                  {viewingOrder.items.map((i, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{i.productName}</p>
                        <p className="text-[11px] text-slate-500">
                          {i.sizeLabel} × {i.qty}
                        </p>
                      </div>
                      <span className="font-bold text-emerald-700">₹{i.price * i.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-slate-200 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{viewingOrder.subtotal}</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount:</span>
                    <span>-₹{viewingOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{viewingOrder.shipping === 0 ? 'FREE' : `₹${viewingOrder.shipping}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-emerald-700 text-base">₹{viewingOrder.total}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Link
                  href={`/orders?id=${viewingOrder.id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5"
                >
                  <span>Customer View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-5 py-2 rounded-xl bg-botanical-800 text-white font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DISPATCH COURIER MODAL */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Dispatch Shipment #{shippingModalOrder.id}
            </h3>
            <p className="text-xs text-slate-500">
              Provide courier logistics partner and tracking AWB number to update the live timeline for customer.
            </p>

            <form onSubmit={handleConfirmShipment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Courier Logistics Partner</label>
                <input
                  type="text"
                  required
                  value={courierNameInput}
                  onChange={(e) => setCourierNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tracking AWB Number</label>
                <input
                  type="text"
                  placeholder="e.g. DELHIVERY-TN948210"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Confirm Dispatch & Move to Shipped
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
