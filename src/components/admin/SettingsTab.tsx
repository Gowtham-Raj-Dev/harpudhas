'use client';

import React, { useRef, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Badge, Button, Card, Field, Input, PageHeader, Textarea, Toggle, cx } from './ui';
import { Download, RotateCcw, Upload, Store, ShieldAlert, Database, Palette, Webhook, Truck, Package } from 'lucide-react';
import { WebhookSettings, DeliveryPartnerSettings } from './IntegrationSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { SITE_PRESETS } from '@/lib/theme';

type Section = 'general' | 'appearance' | 'webhook' | 'delivery' | 'backup';

export const SettingsTab: React.FC = () => {
  const {
    siteSettings,
    updateSiteSettings,
    headerConfig,
    updateHeaderConfig,
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
    orders,
    products,
    customers,
    integrations,
  } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<Section>('general');

  const backup = () => {
    const blob = new Blob([exportDataJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harpudhas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wh = integrations.webhook;
  const nav: { id: Section; label: string; description: string; icon: React.ElementType; status?: React.ReactNode }[] = [
    {
      id: 'general',
      label: 'General',
      description: 'Orders, payments, shipping, stock',
      icon: Store,
      status: siteSettings.storeOpen ? <Badge tone="emerald">Open</Badge> : <Badge tone="amber">Paused</Badge>,
    },
    {
      id: 'appearance',
      label: 'Appearance',
      description: 'Website & admin colour themes',
      icon: Palette,
      status: <Badge>{siteSettings.theme.site.preset === 'custom' ? 'Custom' : SITE_PRESETS.find((p) => p.id === siteSettings.theme.site.preset)?.name.split(' ')[0]}</Badge>,
    },
    {
      id: 'webhook',
      label: 'Webhook',
      description: 'Send products, customers & orders',
      icon: Webhook,
      status: wh.enabled && wh.url ? <Badge tone="emerald">On</Badge> : <Badge>Off</Badge>,
    },
    {
      id: 'delivery',
      label: 'Delivery partners',
      description: 'Courier API keys & tracking',
      icon: Truck,
      status: <Badge>{integrations.deliveryPartners.filter((p) => p.enabled).length}</Badge>,
    },
    { id: 'backup', label: 'Backup & reset', description: 'Export, restore, factory reset', icon: Database },
  ];

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Store settings" subtitle="Switches here take effect on the storefront immediately." />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
        {/* Section menu */}
        <nav className="lg:sticky lg:top-20 bg-white rounded-2xl border border-slate-200/80 p-2 flex lg:flex-col gap-1 overflow-x-auto">
          {nav.map((n) => {
            const Icon = n.icon;
            const on = section === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={cx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors shrink-0 lg:w-full',
                  on ? 'bg-emerald-50 text-emerald-900' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span className={cx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', on ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500')}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium whitespace-nowrap">{n.label}</span>
                  <span className="hidden lg:block text-[11px] text-slate-400 truncate">{n.description}</span>
                </span>
                <span className="hidden lg:block">{n.status}</span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-5">
          {section === 'general' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Orders & payments</h3>
                </div>
                <div className="space-y-4">
                  <Toggle
                    checked={siteSettings.storeOpen}
                    onChange={(v) => updateSiteSettings({ storeOpen: v })}
                    label="Accept new orders"
                    description="Turn off to pause checkout (customers can still browse)"
                  />
                  {!siteSettings.storeOpen && (
                    <Field label="Message shown at checkout while paused">
                      <Textarea rows={2} value={siteSettings.closedMessage} onChange={(e) => updateSiteSettings({ closedMessage: e.target.value }, { silent: true })} />
                    </Field>
                  )}
                  <div className="border-t border-slate-100" />
                  <Toggle
                    checked={siteSettings.codEnabled}
                    onChange={(v) => updateSiteSettings({ codEnabled: v })}
                    label="Cash on delivery"
                    description="Show COD as a payment option at checkout"
                  />
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Shipping & stock</h3>
                </div>
                <div className="space-y-4">
                  <Field label="Free shipping above (₹)" hint="Orders below this pay ₹50 delivery">
                    <Input
                      type="number"
                      min={0}
                      value={headerConfig.freeShippingThreshold}
                      onChange={(e) => updateHeaderConfig({ freeShippingThreshold: Number(e.target.value) }, { silent: true })}
                    />
                  </Field>
                  <Field label="Low-stock alert at" hint="Products at or below this quantity are flagged">
                    <Input
                      type="number"
                      min={0}
                      value={siteSettings.lowStockThreshold}
                      onChange={(e) => updateSiteSettings({ lowStockThreshold: Number(e.target.value) }, { silent: true })}
                    />
                  </Field>
                </div>
              </Card>
            </div>
          )}

          {section === 'appearance' && <AppearanceSettings />}
          {section === 'webhook' && <WebhookSettings />}
          {section === 'delivery' && <DeliveryPartnerSettings />}

          {section === 'backup' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Backup & restore</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {products.length} products · {orders.length} orders · {customers.length} customers. Data is stored in this browser — download a backup regularly.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button icon={<Download className="w-4 h-4" />} onClick={backup}>
                    Download backup (.json)
                  </Button>
                  <Button icon={<Upload className="w-4 h-4" />} onClick={() => fileRef.current?.click()}>
                    Restore from backup
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (!confirm('Restoring replaces current products, orders, customers and content. Continue?')) return;
                      f.text().then(importDataJSON);
                      e.target.value = '';
                    }}
                  />
                </div>
              </Card>

              <Card className="border-rose-200">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-semibold text-rose-700">Danger zone</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Reset every product, order, customer, banner and page text to the original demo data. Webhook and courier settings are kept.
                </p>
                <Button
                  variant="danger"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={() => confirm('Reset the entire store to defaults? Download a backup first — this cannot be undone.') && resetToDefaults()}
                >
                  Reset store to defaults
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
