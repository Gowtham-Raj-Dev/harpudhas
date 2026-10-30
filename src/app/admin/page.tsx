'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { DateFilter, todayKey, dateKey } from '@/lib/storeUtils';
import { DashboardTab } from '@/components/admin/DashboardTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { CustomersTab } from '@/components/admin/CustomersTab';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { BannersTab } from '@/components/admin/BannersTab';
import { HomeProductsTab } from '@/components/admin/HomeProductsTab';
import { JourneyTab } from '@/components/admin/JourneyTab';
import { isAbandoned } from '@/lib/journey';
import { ContentTab } from '@/components/admin/ContentTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { cx } from '@/components/admin/ui';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Megaphone,
  PenSquare,
  Settings,
  ExternalLink,
  Menu,
  X,
  Bell,
  Home,
  Route,
} from 'lucide-react';

type Tab = 'dashboard' | 'orders' | 'customers' | 'journey' | 'products' | 'home-products' | 'banners' | 'content' | 'settings';
const TABS: Tab[] = ['dashboard', 'orders', 'customers', 'journey', 'products', 'home-products', 'banners', 'content', 'settings'];

export default function AdminPage() {
  const { orders, products, customers, banners, siteSettings, journeys } = useStore();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [ordersPreset, setOrdersPreset] = useState<{ filter: DateFilter; status?: string; n: number }>({ filter: { preset: 'today' }, n: 0 });
  const [navOpen, setNavOpen] = useState(false);

  // Remember the open tab in the URL hash so refresh keeps you in place
  useEffect(() => {
    const h = window.location.hash.replace('#', '') as Tab;
    if (TABS.includes(h)) setTab(h);
  }, []);
  const go = (t: Tab) => {
    setTab(t);
    setNavOpen(false);
    window.history.replaceState(null, '', `#${t}`);
    window.scrollTo({ top: 0 });
  };
  const openOrders = (filter: DateFilter, status?: string) => {
    setOrdersPreset((p) => ({ filter, status, n: p.n + 1 }));
    go('orders');
  };

  const pending = orders.filter((o) => o.status === 'Pending').length;
  const todayCount = orders.filter((o) => dateKey(o.createdAt) === todayKey()).length;
  const abandoned = journeys.filter((j) => j.phone && j.followUp.status === 'new' && isAbandoned(j, siteSettings.abandonAfterMinutes)).length;
  const lowStock = products.filter((p) => typeof p.stock === 'number' && p.stock <= siteSettings.lowStockThreshold).length;

  const nav: { group: string; items: { id: Tab; label: string; icon: React.ElementType; count?: number; alert?: boolean }[] }[] = [
    { group: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
    {
      group: 'Sales',
      items: [
        { id: 'orders', label: 'Orders', icon: ShoppingCart, count: pending, alert: pending > 0 },
        { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
        { id: 'journey', label: 'Customer journey', icon: Route, count: abandoned, alert: abandoned > 0 },
      ],
    },
    {
      group: 'Catalog',
      items: [
        { id: 'products', label: 'Products', icon: Package, count: products.length, alert: lowStock > 0 },
        { id: 'home-products', label: 'Home page products', icon: Home },
        { id: 'banners', label: 'Banners & offers', icon: Megaphone, count: banners.filter((b) => b.isActive).length },
      ],
    },
    {
      group: 'Website',
      items: [
        { id: 'content', label: 'Live site editor', icon: PenSquare },
        { id: 'settings', label: 'Store settings', icon: Settings },
      ],
    },
  ];
  const currentLabel = nav.flatMap((g) => g.items).find((i) => i.id === tab)?.label;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 w-64 bg-[rgb(var(--admin-sidebar))] text-slate-300 flex flex-col transition-transform lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-amber-500/40 bg-black">
            <Image src={withBasePath('/images/logo.png')} alt="" fill className="object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Hàrpudha&apos;s</p>
            <p className="text-[11px] text-slate-400">Admin console</p>
          </div>
          <button onClick={() => setNavOpen(false)} className="ml-auto lg:hidden p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {nav.map((g) => (
            <div key={g.group}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{g.group}</p>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item.id)}
                      className={cx(
                        'w-full flex items-center gap-3 h-10 px-3 rounded-xl text-sm transition-colors',
                        active ? 'bg-white/10 text-white font-medium' : 'hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className={cx('w-4 h-4', active ? 'text-emerald-400' : 'text-slate-500')} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span
                          className={cx(
                            'min-w-[22px] h-5 px-1.5 rounded-md text-[11px] font-semibold flex items-center justify-center tabular-nums',
                            item.alert ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-slate-300'
                          )}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <Link href="/" target="_blank" className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm hover:bg-white/5 hover:text-white">
            <ExternalLink className="w-4 h-4 text-slate-500" />
            View storefront
          </Link>
        </div>
      </aside>
      {navOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setNavOpen(false)} />}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setNavOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm font-medium text-slate-900">{currentLabel}</p>

          <div className="ml-auto flex items-center gap-2">
            <span
              className={cx(
                'hidden sm:inline-flex items-center gap-2 h-8 px-3 rounded-full text-xs font-medium',
                siteSettings.storeOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              )}
            >
              <span className={cx('w-1.5 h-1.5 rounded-full', siteSettings.storeOpen ? 'bg-emerald-500 animate-live' : 'bg-amber-500')} />
              {siteSettings.storeOpen ? 'Store live' : 'Orders paused'}
            </span>
            <button
              onClick={() => openOrders({ preset: 'today' })}
              className="hidden md:inline-flex items-center h-8 px-3 rounded-full bg-slate-100 text-xs text-slate-600 hover:bg-slate-200"
            >
              Today: <b className="ml-1 text-slate-900">{todayCount} orders</b>
            </button>
            <button
              onClick={() => openOrders({ preset: 'all' }, 'Pending')}
              className="relative w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center"
              title={`${pending} pending orders`}
            >
              <Bell className="w-4 h-4" />
              {pending > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pending}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1500px]">
          {tab === 'dashboard' && <DashboardTab openOrders={openOrders} openTab={(t) => go(t as Tab)} />}
          {tab === 'orders' && <OrdersTab key={ordersPreset.n} initialFilter={ordersPreset.filter} initialStatus={ordersPreset.status} />}
          {tab === 'customers' && <CustomersTab />}
          {tab === 'journey' && <JourneyTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'home-products' && <HomeProductsTab />}
          {tab === 'banners' && <BannersTab />}
          {tab === 'content' && <ContentTab />}
          {tab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}
