'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { DeliveryPartner, WebhookConfig } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import { DELIVERY_PROVIDERS, ENV_WEBHOOK_URL, WEBHOOK_EVENTS } from '@/lib/webhook';
import { formatDateTime } from '@/lib/storeUtils';
import { Badge, Button, Card, Collapsible, Field, Input, SecretInput, Textarea, Toggle, cx } from './ui';
import { AlertTriangle, Check, KeyRound, Plus, RefreshCw, Send, Trash2, Truck, Webhook, Zap, Star } from 'lucide-react';

// ---------------- Webhook ----------------

export const WebhookSettings: React.FC = () => {
  const { integrations, updateIntegrations, webhookLog, clearWebhookLog, syncAllToWebhook, sendTestWebhook, retryWebhook, products, customers, orders } = useStore();
  const wh = integrations.webhook;
  const [include, setInclude] = useState({ products: true, customers: true, orders: true });
  const [busy, setBusy] = useState<'sync' | 'test' | null>(null);

  const setWh = (patch: Partial<WebhookConfig>) => updateIntegrations({ webhook: { ...wh, ...patch } }, { silent: true });
  const urlValid = /^https?:\/\/[^\s]+\.[^\s]+/.test(wh.url);
  const insecure = wh.url.startsWith('http://');

  const run = async (kind: 'sync' | 'test') => {
    setBusy(kind);
    try {
      if (kind === 'sync') await syncAllToWebhook(include);
      else await sendTestWebhook();
    } finally {
      setBusy(null);
    }
  };

  const statusTone = (s: string) => (s === 'success' ? 'emerald' : s === 'sent' ? 'sky' : 'rose');

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Webhook</h3>
          {wh.enabled && urlValid ? <Badge tone="emerald">Active</Badge> : <Badge>Off</Badge>}
        </div>
        <Toggle checked={wh.enabled} onChange={(v) => setWh({ enabled: v })} />
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Sends products, customers and orders as JSON to your URL (Google Sheets via Apps Script, Zapier, Make, n8n, your own server…).
      </p>

      <div className="space-y-4">
        <Field label="Webhook URL" required hint={!wh.url ? 'Paste the endpoint that should receive the data' : !urlValid ? 'This does not look like a valid URL' : insecure ? 'Use https:// — plain http may be blocked by the browser' : undefined}>
          <Input value={wh.url} onChange={(e) => setWh({ url: e.target.value.trim() })} placeholder="https://hooks.zapier.com/hooks/catch/…" className={cx('font-mono text-[13px]', wh.url && !urlValid && 'border-rose-300')} />
        </Field>
        <Field label="Signing secret (optional)" hint="If set, each request carries an X-Harpudhas-Signature: sha256=<HMAC of the body> header so your server can verify it">
          <SecretInput value={wh.secret} onChange={(v) => setWh({ secret: v })} placeholder="any long random string" />
        </Field>

        {ENV_WEBHOOK_URL ? (
          <p className="text-xs rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2">
            A site-wide webhook is built into this deployment, so orders from customers&apos; own devices are delivered too.
          </p>
        ) : (
          <div className="text-xs rounded-lg bg-amber-50 text-amber-900 px-3 py-2.5 flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This URL is saved in <b>this browser only</b>. To receive orders placed on customers&apos; phones, also add it as the
              GitHub repository variable <code className="font-mono">WEBHOOK_URL</code> and redeploy.
            </span>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Send automatically when…</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WEBHOOK_EVENTS.map((ev) => {
              const on = wh.events[ev.id];
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setWh({ events: { ...wh.events, [ev.id]: !on } })}
                  className={cx('flex items-start gap-3 p-3 rounded-xl border text-left transition-all', on ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300')}
                >
                  <span className={cx('mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0', on ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300')}>
                    {on && <Check className="w-3 h-3" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      {ev.label} <code className="ml-1 text-[10px] font-mono text-slate-400">{ev.id}</code>
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">{ev.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Toggle
          checked={wh.stripUploadedImages}
          onChange={(v) => setWh({ stripUploadedImages: v })}
          label="Leave out uploaded images"
          description="Replaces base64 image data with “[uploaded-image]” to keep payloads small. Image paths/URLs are still sent."
        />

        {/* Full sync */}
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Sync all data now
              </p>
              <p className="text-xs text-slate-500">
                Sends one <code className="font-mono">sync.full</code> event.{' '}
                {wh.lastFullSync ? `Last synced ${formatDateTime(wh.lastFullSync)}` : 'Never synced yet'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" icon={<Send className="w-3.5 h-3.5" />} disabled={!urlValid || !!busy} onClick={() => run('test')}>
                {busy === 'test' ? 'Sending…' : 'Send test'}
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<RefreshCw className={cx('w-3.5 h-3.5', busy === 'sync' && 'animate-spin')} />}
                disabled={!urlValid || !!busy || !(include.products || include.customers || include.orders)}
                onClick={() => run('sync')}
              >
                {busy === 'sync' ? 'Syncing…' : 'Sync all now'}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {(
              [
                ['products', products.length],
                ['customers', customers.length],
                ['orders', orders.length],
              ] as const
            ).map(([k, n]) => (
              <button
                key={k}
                type="button"
                onClick={() => setInclude((s) => ({ ...s, [k]: !s[k] }))}
                className={cx('h-8 px-3 rounded-full text-xs font-medium border flex items-center gap-1.5', include[k] ? 'bg-white border-emerald-600 text-emerald-800' : 'border-slate-200 text-slate-400')}
              >
                {include[k] && <Check className="w-3 h-3" />}
                <span className="capitalize">{k}</span>
                <span className="tabular-nums opacity-70">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery log */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">Recent deliveries</p>
            {webhookLog.length > 0 && (
              <button onClick={clearWebhookLog} className="text-[11px] text-slate-400 hover:text-slate-700">
                Clear log
              </button>
            )}
          </div>
          {webhookLog.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-xl">Nothing sent yet</p>
          ) : (
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto custom-scrollbar">
              {webhookLog.map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-3 py-2">
                  <Badge tone={statusTone(l.status)}>{l.status === 'sent' ? 'sent*' : l.status}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 truncate">
                      <code className="font-mono text-slate-500">{l.event}</code> · {l.summary}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate" title={l.error}>
                      {formatDateTime(l.timestamp)} · {(l.bytes / 1024).toFixed(1)} KB
                      {l.httpStatus ? ` · HTTP ${l.httpStatus}` : ''}
                      {l.error ? ` · ${l.error}` : ''}
                    </p>
                  </div>
                  {l.status === 'failed' && l.payload && (
                    <Button size="sm" variant="ghost" onClick={() => retryWebhook(l)}>
                      Retry
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          {webhookLog.some((l) => l.status === 'sent') && (
            <p className="text-[11px] text-slate-400 mt-1.5">* sent = delivered, but the receiver doesn&apos;t allow CORS, so the browser can&apos;t read its reply.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

// ---------------- Delivery partners ----------------

export const DeliveryPartnerSettings: React.FC = () => {
  const { integrations, updateIntegrations, triggerToast } = useStore();
  const partners = integrations.deliveryPartners;
  const save = (list: DeliveryPartner[]) => updateIntegrations({ deliveryPartners: list }, { silent: true });
  const patch = (id: string, p: Partial<DeliveryPartner>) => save(partners.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const addPartner = (provider: string) => {
    const meta = DELIVERY_PROVIDERS.find((d) => d.name === provider)!;
    const np: DeliveryPartner = {
      id: `dp_${Date.now()}`,
      provider,
      enabled: true,
      isDefault: partners.length === 0,
      mode: 'test',
      apiKey: '',
      apiSecret: '',
      accountId: '',
      pickupPincode: '',
      trackingUrlTemplate: meta.tracking,
      notes: '',
    };
    save([...partners, np]);
    triggerToast(`${provider} added — fill in the credentials`, 'info');
  };

  const setDefault = (id: string) => save(partners.map((x) => ({ ...x, isDefault: x.id === id })));
  const remove = (p: DeliveryPartner) => {
    if (!confirm(`Remove ${p.provider} and its saved keys?`)) return;
    const rest = partners.filter((x) => x.id !== p.id);
    if (p.isDefault && rest[0]) rest[0] = { ...rest[0], isDefault: true };
    save(rest);
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Delivery partners</h3>
          <Badge>{partners.filter((p) => p.enabled).length} active</Badge>
        </div>
        <Dropdown
          size="sm"
          className="w-48"
          align="right"
          placeholder="+ Add partner"
          value=""
          onChange={addPartner}
          options={DELIVERY_PROVIDERS.map((d) => ({ value: d.name, label: d.name, hint: partners.some((p) => p.provider === d.name) ? 'added' : undefined }))}
        />
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Saved partners appear in the <b>Dispatch</b> dialog; the default one is pre-selected and its tracking link is shown on shipped orders.
      </p>

      <div className="text-xs rounded-lg bg-amber-50 text-amber-900 px-3 py-2.5 flex gap-2 mb-4">
        <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Keys are stored only in this browser and are <b>never</b> included in webhooks, backups or the public site. Courier APIs must be called from a server
          (your webhook receiver can do that using the order + AWB data), not from the browser.
        </span>
      </div>

      {partners.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">No delivery partners yet — add one above.</p>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => {
            const meta = DELIVERY_PROVIDERS.find((d) => d.name === p.provider) ?? DELIVERY_PROVIDERS[DELIVERY_PROVIDERS.length - 1];
            const configured = !!p.apiKey;
            return (
              <Collapsible
                key={p.id}
                defaultOpen={!configured}
                icon={<Truck className="w-4 h-4" />}
                title={p.provider}
                subtitle={`${p.mode === 'live' ? 'Live' : 'Test'} mode · ${configured ? `key ••••${p.apiKey.slice(-4)}` : 'no key yet'}`}
                badge={
                  <>
                    {p.isDefault && <Badge tone="amber"><Star className="w-3 h-3" />Default</Badge>}
                    {!p.enabled && <Badge>Disabled</Badge>}
                    {!configured && <Badge tone="rose">Needs key</Badge>}
                  </>
                }
                right={<Toggle size="sm" checked={p.enabled} onChange={(v) => patch(p.id, { enabled: v })} />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <Field label="Environment">
                    <Dropdown
                      value={p.mode}
                      onChange={(v) => patch(p.id, { mode: v as 'test' | 'live' })}
                      options={[
                        { value: 'test', label: 'Test / sandbox' },
                        { value: 'live', label: 'Live / production' },
                      ]}
                    />
                  </Field>
                  <Field label={meta.accountLabel}>
                    <Input value={p.accountId} onChange={(e) => patch(p.id, { accountId: e.target.value })} />
                  </Field>
                  <Field label={meta.keyLabel} required>
                    <SecretInput value={p.apiKey} onChange={(v) => patch(p.id, { apiKey: v })} />
                  </Field>
                  <Field label={meta.secretLabel}>
                    <SecretInput value={p.apiSecret} onChange={(v) => patch(p.id, { apiSecret: v })} />
                  </Field>
                  <Field label="Pickup pincode" hint="Warehouse / pickup location">
                    <Input value={p.pickupPincode} maxLength={6} inputMode="numeric" onChange={(e) => patch(p.id, { pickupPincode: e.target.value.replace(/\D/g, '') })} />
                  </Field>
                  <Field label="Tracking link template" hint="Use {awb} where the tracking number goes">
                    <Input value={p.trackingUrlTemplate} onChange={(e) => patch(p.id, { trackingUrlTemplate: e.target.value })} placeholder="https://…/track/{awb}" className="font-mono text-[13px]" />
                  </Field>
                  <Field label="Notes" className="sm:col-span-2">
                    <Textarea rows={2} value={p.notes} onChange={(e) => patch(p.id, { notes: e.target.value })} placeholder="Pickup timings, account manager contact…" />
                  </Field>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <Button size="sm" variant="ghost" icon={<Star className="w-3.5 h-3.5" />} disabled={p.isDefault} onClick={() => setDefault(p.id)}>
                    {p.isDefault ? 'Default partner' : 'Make default'}
                  </Button>
                  <Button size="sm" variant="danger" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => remove(p)}>
                    Remove
                  </Button>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
      {partners.length > 0 && (
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Changes save automatically.
        </p>
      )}
    </Card>
  );
};
