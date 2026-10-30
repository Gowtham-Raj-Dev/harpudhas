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
} from '@/types/store';
import {
  ShieldCheck,
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
  CheckCircle2,
  Truck,
  Box,
  Clock,
  Eye,
  Search,
  Filter,
  Save,
  RotateCcw,
  Download,
  Upload,
  ArrowRight,
  ExternalLink,
  X,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Tag,
  ToggleLeft,
  ToggleRight,
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

    resetToDefaults,
    exportDataJSON,
    importDataJSON,
    triggerToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'banners' | 'header' | 'footer' | 'settings'
  >('dashboard');

  // Orders Filter & Search State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [courierNameInput, setCourierNameInput] = useState('Delhivery Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Products Management State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // New/Edit Product Form Fields
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

  // Banner State
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<OfferBanner | null>(null);
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bBadge, setBBadge] = useState('Special Offer');
  const [bDiscountCode, setBDiscountCode] = useState('HERBAL15');
  const [bButtonText, setBButtonText] = useState('Shop Now');
  const [bButtonLink, setBButtonLink] = useState('/shop');
  const [bBgGradient, setBBgGradient] = useState('from-emerald-900 via-botanical-800 to-teal-950');
  const [bTargetPage, setBTargetPage] = useState<BannerTargetPage>('all');
  const [bIsActive, setBIsActive] = useState(true);

  // Header Config Local State
  const [headerForm, setHeaderForm] = useState(headerConfig);

  // Footer Config Local State
  const [footerForm, setFooterForm] = useState(footerConfig);

  // Open Edit Product Modal
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
    const newId = `product-${Date.now().toString().slice(-4)}`;
    setPId(newId);
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

  // Open Edit Banner Modal
  const openEditBanner = (b: OfferBanner) => {
    setEditingBanner(b);
    setBTitle(b.title);
    setBSubtitle(b.subtitle);
    setBBadge(b.badge);
    setBDiscountCode(b.discountCode || '');
    setBButtonText(b.buttonText);
    setBButtonLink(b.buttonLink);
    setBBgGradient(b.bgGradient);
    setBTargetPage(b.targetPage);
    setBIsActive(b.isActive);
    setIsAddingBanner(true);
  };

  const openNewBanner = () => {
    setEditingBanner(null);
    setBTitle('🌿 Special Herbal Festivity Deal — Flat 15% OFF');
    setBSubtitle('Traditional cold-pressed hair care and radiance creams handmade in Pollachi.');
    setBBadge('Flash Sale');
    setBDiscountCode('HARPUDHAS15');
    setBButtonText('Explore Products');
    setBButtonLink('/shop');
    setBBgGradient('from-emerald-900 via-botanical-800 to-teal-950');
    setBTargetPage('all');
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
      bgGradient: bBgGradient.trim(),
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

  // Dispatch & Ship Order action
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

  // Dashboard Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const activeBannersCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-botanical-700 text-white flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-6 h-6 text-sandal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-lg text-white tracking-wide">
                Hàrpudha's Command Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Store Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage Products, Customer Orders, Banners, Headers & Content
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sandal-300 transition-colors border border-slate-700"
          >
            <span>View Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/orders"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 transition-colors border border-slate-700"
          >
            <span>Order Tracker</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-slate-950/80 border-r border-slate-800 p-4 space-y-1.5">
          {[
            { id: 'dashboard', label: 'Store Overview', icon: LayoutDashboard },
            { id: 'orders', label: `Orders (${pendingOrders} Pending)`, icon: PackageCheck, badge: pendingOrders },
            { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
            { id: 'banners', label: `Offer Banners (${banners.length})`, icon: Megaphone },
            { id: 'header', label: 'Header & Marquee', icon: Sliders },
            { id: 'footer', label: 'Footer & Contacts', icon: Layers },
            { id: 'settings', label: 'Backup & Reset', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-botanical-800 text-white shadow-md border border-botanical-700'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sandal-400' : 'text-slate-400'}`} />
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

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Store Analytics & Health</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time status of orders, fulfillment pipeline, and catalog configuration.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Order Value
                  </span>
                  <div className="text-2xl font-serif font-bold text-emerald-400">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-400">From {orders.length} placed orders</p>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Pending Confirmation
                  </span>
                  <div className="text-2xl font-serif font-bold text-amber-400">
                    {pendingOrders}
                  </div>
                  <p className="text-[11px] text-slate-400">Awaiting your approval</p>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Catalog Items
                  </span>
                  <div className="text-2xl font-serif font-bold text-sandal-300">
                    {products.length}
                  </div>
                  <p className="text-[11px] text-slate-400">In 3 botanical categories</p>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Promotional Banners
                  </span>
                  <div className="text-2xl font-serif font-bold text-teal-300">
                    {activeBannersCount} / {banners.length} Active
                  </div>
                  <p className="text-[11px] text-slate-400">Controlled by page target</p>
                </div>
              </div>

              {/* Recent Orders quick table */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-white">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-sandal-400 hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 uppercase font-bold">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Quick Move Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-750">
                          <td className="p-3 font-mono font-bold text-sandal-300">#{ord.id}</td>
                          <td className="p-3 font-semibold text-white">{ord.customer.fullName}</td>
                          <td className="p-3 text-slate-300">{ord.customer.phone}</td>
                          <td className="p-3 font-bold text-emerald-400">₹{ord.total}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : ord.status === 'Processing'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : ord.status === 'Confirmed'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {ord.status === 'Pending' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'Confirmed', 'Confirmed by Admin')}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                              >
                                Confirm Order
                              </button>
                            )}
                            {ord.status === 'Confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'Processing', 'Started packing')}
                                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px]"
                              >
                                Move to Packing
                              </button>
                            )}
                            {ord.status === 'Processing' && (
                              <button
                                onClick={() => setShippingModalOrder(ord)}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                              >
                                Dispatch & Ship
                              </button>
                            )}
                            {ord.status === 'Shipped' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'Delivered', 'Delivered to customer')}
                                className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[11px]"
                              >
                                Mark Delivered
                              </button>
                            )}
                            {ord.status === 'Delivered' && (
                              <span className="text-emerald-400 text-xs">✓ Complete</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Order Pipeline & Stages</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    "confrim pani next next stage move akra mari vekanum" — Step-by-step order workflow control.
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by Order ID, customer name, phone, city..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="all">All Statuses ({orders.length})</option>
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
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold border-b border-slate-700">
                      <tr>
                        <th className="p-3.5">Order ID</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Customer & Contact</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Total & Payment</th>
                        <th className="p-3.5">Current Status</th>
                        <th className="p-3.5 text-center">Stage Progression</th>
                        <th className="p-3.5">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            No orders found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-750 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-sandal-300">#{ord.id}</td>
                            <td className="p-3.5 text-slate-400 whitespace-nowrap">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-white">{ord.customer.fullName}</p>
                              <p className="text-slate-400 text-[11px]">{ord.customer.phone}</p>
                              <p className="text-slate-500 text-[10px] truncate max-w-[160px]">
                                {ord.customer.city}, {ord.customer.state}
                              </p>
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-slate-300">
                                {ord.items.length} item(s)
                              </span>
                              <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {ord.items.map((i) => i.productName).join(', ')}
                              </p>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-emerald-400 text-sm">₹{ord.total}</span>
                              <span className="block text-[10px] text-slate-400 uppercase">
                                {ord.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {/* Direct Status Selector Dropdown */}
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  updateOrderStatus(ord.id, e.target.value as OrderStatus, `Status updated to ${e.target.value} by Admin`)
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : ord.status === 'Shipped'
                                    ? 'bg-blue-950 text-blue-300 border-blue-700'
                                    : ord.status === 'Processing'
                                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                                    : ord.status === 'Confirmed'
                                    ? 'bg-purple-950 text-purple-300 border-purple-700'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                                    : 'bg-yellow-950 text-yellow-300 border-yellow-700'
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
                              {/* Quick 1-Click Move Button */}
                              {ord.status === 'Pending' && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(ord.id, 'Confirmed', 'Order confirmed by store owner')
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm whitespace-nowrap"
                                >
                                  ✓ Confirm Order
                                </button>
                              )}
                              {ord.status === 'Confirmed' && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(ord.id, 'Processing', 'Packed with tamper seal')
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shadow-sm whitespace-nowrap"
                                >
                                  📦 Pack Order
                                </button>
                              )}
                              {ord.status === 'Processing' && (
                                <button
                                  onClick={() => setShippingModalOrder(ord)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm whitespace-nowrap"
                                >
                                  🚚 Dispatch Courier
                                </button>
                              )}
                              {ord.status === 'Shipped' && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(ord.id, 'Delivered', 'Delivered safely to recipient')
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] shadow-sm whitespace-nowrap"
                                >
                                  🎉 Mark Delivered
                                </button>
                              )}
                              {ord.status === 'Delivered' && (
                                <span className="text-emerald-400 text-xs font-semibold">
                                  ✓ Completed
                                </span>
                              )}
                              {ord.status === 'Cancelled' && (
                                <span className="text-rose-400 text-xs font-semibold">Cancelled</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => setViewingOrder(ord)}
                                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                                title="View Complete Order Details"
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
                  <h2 className="text-2xl font-serif font-bold text-white">Products Management</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    "new ha priducts add pandranu delete edit all contrill need in that place"
                  </p>
                </div>
                <button
                  onClick={openNewProduct}
                  className="px-4 py-2.5 rounded-xl bg-botanical-700 hover:bg-botanical-600 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search product name, category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full px-3.5 py-2 pl-9 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Categories ({products.length})</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Face Care">Face Care</option>
                  <option value="Skin & Body">Skin & Body</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold border-b border-slate-700">
                      <tr>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Category & Format</th>
                        <th className="p-3.5">Price / MRP</th>
                        <th className="p-3.5">Sizes</th>
                        <th className="p-3.5">Rating</th>
                        <th className="p-3.5">Badge</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-750 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
                                <Image
                                  src={withBasePath(p.image)}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-white line-clamp-1">{p.name}</p>
                                <p className="text-[10px] text-emerald-400 font-medium">
                                  {p.tamilName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-300">{p.category}</span>
                            <p className="text-[10px] text-slate-500">{p.format}</p>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-emerald-400 text-sm">₹{p.price}</span>
                            <span className="text-slate-500 line-through ml-1.5">₹{p.mrp}</span>
                          </td>
                          <td className="p-3.5 text-slate-300">
                            {p.sizeOptions?.map((s) => s.label).join(', ')}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-amber-400">★ {p.rating}</span>
                            <span className="text-slate-500 text-[10px] block">
                              ({p.reviews} revs)
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-sandal-300">
                              {p.badge}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/product/${p.id}`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                                title="Preview Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => openEditProduct(p)}
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sandal-400"
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
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/40"
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

          {/* TAB 4: BANNERS & OFFERS MANAGEMENT */}
          {activeTab === 'banners' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Promotional & Offer Banners</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    "baners offers baeners la add pani athda contril also admin panel la erukanum and banner entha entha pages la show akanum on off antha mari also venum"
                  </p>
                </div>
                <button
                  onClick={openNewBanner}
                  className="px-4 py-2.5 rounded-xl bg-botanical-700 hover:bg-botanical-600 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Banner</span>
                </button>
              </div>

              {/* Banners List with Live Cards */}
              <div className="grid grid-cols-1 gap-4">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
                      <div className="flex items-center gap-3">
                        {/* ON / OFF Switch */}
                        <button
                          onClick={() => toggleBanner(b.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            b.isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {b.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              <span>ACTIVE (SHOWING)</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              <span>OFF (HIDDEN)</span>
                            </>
                          )}
                        </button>

                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900 text-sandal-300 border border-slate-700">
                          Target Page:{' '}
                          <span className="uppercase font-bold text-white">{b.targetPage}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditBanner(b)}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sandal-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete banner "${b.title}"?`)) {
                              deleteBanner(b.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-xs font-semibold text-rose-400 border border-rose-800/40 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Banner Preview Mockup */}
                    <div
                      className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${b.bgGradient} p-4 sm:p-5 text-white shadow-md border border-white/10`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sandal-500 text-botanical-950 uppercase">
                              {b.badge}
                            </span>
                            {b.discountCode && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 border border-white/20">
                                Code: {b.discountCode}
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-base">{b.title}</h4>
                          <p className="text-xs text-sandal-100/90">{b.subtitle}</p>
                        </div>
                        <span className="px-4 py-2 rounded-full bg-white text-botanical-950 font-bold text-xs shadow-xs">
                          {b.buttonText} →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HEADER & ANNOUNCEMENT CONTENT CONTROL */}
          {activeTab === 'header' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Header & Top Bar Control</h2>
                <p className="text-xs text-slate-400 mt-1">
                  "header content admin panel la chnage panna maranum" — Updates reflect on live header instantly!
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-5">
                {/* Announcement Bar Active Toggle */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div>
                    <h3 className="font-bold text-sm text-white">Top Announcement Bar Visibility</h3>
                    <p className="text-xs text-slate-400">Show or hide the marquee banner at the very top</p>
                  </div>
                  <button
                    onClick={() =>
                      setHeaderForm({
                        ...headerForm,
                        announcementActive: !headerForm.announcementActive,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      headerForm.announcementActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {headerForm.announcementActive ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                  </button>
                </div>

                {/* Announcement Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Announcement Banner Message
                  </label>
                  <input
                    type="text"
                    value={headerForm.announcementText}
                    onChange={(e) =>
                      setHeaderForm({ ...headerForm, announcementText: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Displayed in emerald top banner (free shipping notice, discounts, etc.)
                  </p>
                </div>

                {/* Logo Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Store Brand Title</label>
                    <input
                      type="text"
                      value={headerForm.logoTitle}
                      onChange={(e) =>
                        setHeaderForm({ ...headerForm, logoTitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Brand Tagline</label>
                    <input
                      type="text"
                      value={headerForm.logoSubtitle}
                      onChange={(e) =>
                        setHeaderForm({ ...headerForm, logoSubtitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                    />
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Header Phone Number</label>
                    <input
                      type="text"
                      value={headerForm.phone}
                      onChange={(e) =>
                        setHeaderForm({ ...headerForm, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">WhatsApp Support Number</label>
                    <input
                      type="text"
                      value={headerForm.whatsapp}
                      onChange={(e) =>
                        setHeaderForm({ ...headerForm, whatsapp: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                    />
                  </div>
                </div>

                {/* Free Shipping Threshold */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Free Express Delivery Minimum Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={headerForm.freeShippingThreshold}
                    onChange={(e) =>
                      setHeaderForm({
                        ...headerForm,
                        freeShippingThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                </div>

                <button
                  onClick={() => updateHeaderConfig(headerForm)}
                  className="px-6 py-3 rounded-xl bg-botanical-700 hover:bg-botanical-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Header Configuration</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: FOOTER CONTENT & IMAGES */}
          {activeTab === 'footer' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Footer & Contact Content</h2>
                <p className="text-xs text-slate-400 mt-1">
                  "and footer content s images" — Manage brand story, physical address, and contact channels.
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Footer Brand Story Paragraph</label>
                  <textarea
                    rows={3}
                    value={footerForm.brandDescription}
                    onChange={(e) =>
                      setFooterForm({ ...footerForm, brandDescription: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Facility Street Address</label>
                  <input
                    type="text"
                    value={footerForm.address}
                    onChange={(e) =>
                      setFooterForm({ ...footerForm, address: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Support Phone</label>
                    <input
                      type="text"
                      value={footerForm.phone}
                      onChange={(e) =>
                        setFooterForm({ ...footerForm, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Support Email</label>
                    <input
                      type="email"
                      value={footerForm.email}
                      onChange={(e) =>
                        setFooterForm({ ...footerForm, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Copyright Text</label>
                  <input
                    type="text"
                    value={footerForm.copyrightText}
                    onChange={(e) =>
                      setFooterForm({ ...footerForm, copyrightText: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                </div>

                <button
                  onClick={() => updateFooterConfig(footerForm)}
                  className="px-6 py-3 rounded-xl bg-botanical-700 hover:bg-botanical-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Footer Configuration</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS & BACKUP */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn max-w-3xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Database Backup & Recovery</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Export all your current store products, orders, and banners as JSON, or restore default state.
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
                  <div>
                    <h3 className="font-bold text-sm text-white">Export Store Snapshot</h3>
                    <p className="text-xs text-slate-400">Download JSON backup file with all orders and products</p>
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
                      triggerToast('Backup exported successfully');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
                  <div>
                    <h3 className="font-bold text-sm text-white">Reset to Factory Defaults</h3>
                    <p className="text-xs text-slate-400">Reverts all products, orders, banners, and headers to original state</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all store data to factory defaults?')) {
                        resetToDefaults();
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif font-bold text-lg text-white">
                {editingProduct ? `Edit Formulation: ${editingProduct.name}` : 'Add New Herbal Product'}
              </h3>
              <button
                onClick={() => setIsAddingProduct(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Product Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Hibiscus Root Hair Oil"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Tamil Traditional Name</label>
                  <input
                    type="text"
                    placeholder="e.g. செம்பருத்தி கூந்தல் தைலம்"
                    value={pTamilName}
                    onChange={(e) => setPTamilName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-botanical-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Hair Care">Hair Care</option>
                    <option value="Face Care">Face Care</option>
                    <option value="Skin & Body">Skin & Body</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Format</label>
                  <select
                    value={pFormat}
                    onChange={(e) => setPFormat(e.target.value as FormatType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
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
                  <label className="font-bold text-slate-300">Discounted Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Original MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={pMrp}
                    onChange={(e) => setPMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Badge Label</label>
                  <input
                    type="text"
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Size options */}
              <div className="p-3 bg-slate-800 rounded-xl space-y-2 border border-slate-700">
                <label className="font-bold text-sandal-300 block">Size / Volume Options & Prices</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Size 1 (e.g. 100 ml)"
                    value={pSize1Label}
                    onChange={(e) => setPSize1Label(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Price 1 (₹)"
                    value={pSize1Price}
                    onChange={(e) => setPSize1Price(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Size 2 (e.g. 200 ml or Pack of 2)"
                    value={pSize2Label}
                    onChange={(e) => setPSize2Label(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Price 2 (₹)"
                    value={pSize2Price}
                    onChange={(e) => setPSize2Price(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Image Picker */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Product Image URL / Selector</label>
                <select
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none mb-1.5"
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
                  placeholder="Or enter custom image URL"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Short Formulation Summary</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Cold-pressed virgin coconut oil slow-cooked with fresh red hibiscus flowers..."
                  value={pShortDesc}
                  onChange={(e) => setPShortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">
                  Herbal Ingredients (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Red Hibiscus Flowers, Bhringraj, Virgin Coconut Oil"
                  value={pIngredients}
                  onChange={(e) => setPIngredients(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Daily Ayurvedic Ritual / How To Use</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Massage warm oil gently into scalp for 10 minutes..."
                  value={pRitual}
                  onChange={(e) => setPRitual(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-botanical-700 hover:bg-botanical-600 text-white font-bold"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT BANNER */}
      {isAddingBanner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif font-bold text-lg text-white">
                {editingBanner ? 'Edit Promotional Banner' : 'Create New Offer Banner'}
              </h3>
              <button
                onClick={() => setIsAddingBanner(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🌿 Grand Herbal Festival — 20% Instant OFF"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Subtitle / Details</label>
                <input
                  type="text"
                  placeholder="e.g. Pure cold-pressed oils handmade in micro-batches."
                  value={bSubtitle}
                  onChange={(e) => setBSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Highlight Badge</label>
                  <input
                    type="text"
                    value={bBadge}
                    onChange={(e) => setBBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Coupon Code (Optional)</label>
                  <input
                    type="text"
                    value={bDiscountCode}
                    onChange={(e) => setBDiscountCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              {/* TARGET PAGE & ON/OFF */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-sandal-300 block">
                    Show On Which Page(s)? (Target Page Filter)
                  </label>
                  <select
                    value={bTargetPage}
                    onChange={(e) => setBTargetPage(e.target.value as BannerTargetPage)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="all">Show On ALL Pages (Home, Shop, Products)</option>
                    <option value="home">Show ONLY on Home Page</option>
                    <option value="shop">Show ONLY on Shop / Catalog Page</option>
                    <option value="product">Show ONLY on Product Detail Pages</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div>
                    <span className="font-bold text-white block">Banner Active Status</span>
                    <span className="text-[11px] text-slate-400">Toggle whether this banner is currently live</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBIsActive(!bIsActive)}
                    className={`px-3 py-1.5 rounded-full font-bold text-xs ${
                      bIsActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {bIsActive ? 'LIVE (ON)' : 'HIDDEN (OFF)'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Button Label</label>
                  <input
                    type="text"
                    value={bButtonText}
                    onChange={(e) => setBButtonText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Button Link Target</label>
                  <input
                    type="text"
                    value={bButtonLink}
                    onChange={(e) => setBButtonLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Tailwind Gradient Classes</label>
                <select
                  value={bBgGradient}
                  onChange={(e) => setBBgGradient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="from-emerald-900 via-botanical-800 to-teal-950">
                    Emerald Herbal Night
                  </option>
                  <option value="from-amber-950 via-sandal-700 to-amber-900">
                    Golden Sandalwood Glow
                  </option>
                  <option value="from-rose-950 via-terracotta-600 to-amber-950">
                    Terracotta & Kashmiri Saffron
                  </option>
                  <option value="from-slate-900 via-botanical-900 to-emerald-950">
                    Deep Forest Midnight
                  </option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingBanner(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-botanical-700 hover:bg-botanical-600 text-white font-bold"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW ORDER INVOICE */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <h3 className="font-serif font-bold text-lg text-white">
                  Order Invoice #{viewingOrder.id}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-botanical-700 text-white">
                  {viewingOrder.status}
                </span>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-xl space-y-1">
                <p className="font-bold text-white text-sm">{viewingOrder.customer.fullName}</p>
                <p className="text-slate-300">Phone: {viewingOrder.customer.phone}</p>
                {viewingOrder.customer.email && (
                  <p className="text-slate-300">Email: {viewingOrder.customer.email}</p>
                )}
                <p className="text-slate-300 pt-1">
                  Address: {viewingOrder.customer.address}, {viewingOrder.customer.city},{' '}
                  {viewingOrder.customer.state} - {viewingOrder.customer.pincode}
                </p>
                {viewingOrder.customer.notes && (
                  <p className="text-amber-400 pt-1">Notes: {viewingOrder.customer.notes}</p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-400 uppercase">Items Ordered:</h4>
                <div className="space-y-2">
                  {viewingOrder.items.map((i, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700"
                    >
                      <div>
                        <p className="font-bold text-white">{i.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          {i.sizeLabel} × {i.qty}
                        </p>
                      </div>
                      <span className="font-bold text-emerald-400">₹{i.price * i.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-slate-800 space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{viewingOrder.subtotal}</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount:</span>
                    <span>-₹{viewingOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{viewingOrder.shipping === 0 ? 'FREE' : `₹${viewingOrder.shipping}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-700">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400 text-base">₹{viewingOrder.total}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Link
                  href={`/orders?id=${viewingOrder.id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold flex items-center gap-1.5"
                >
                  <span>Customer View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-5 py-2 rounded-xl bg-botanical-700 text-white font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-white">
              Dispatch Shipment #{shippingModalOrder.id}
            </h3>
            <p className="text-xs text-slate-400">
              Provide courier details to automatically update the tracking timeline for the customer.
            </p>

            <form onSubmit={handleConfirmShipment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Courier Logistics Partner</label>
                <input
                  type="text"
                  required
                  value={courierNameInput}
                  onChange={(e) => setCourierNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Tracking AWB Number</label>
                <input
                  type="text"
                  placeholder="e.g. DELHIVERY-TN948210"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
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
