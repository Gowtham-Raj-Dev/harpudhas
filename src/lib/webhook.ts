import { IntegrationSettings, Product, WebhookConfig, WebhookEvent, WebhookLogEntry } from '@/types/store';

// A webhook URL baked in at build time reaches every visitor's browser, so orders
// placed on customers' own phones are delivered too. Never put secrets here.
export const ENV_WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || '';

export const WEBHOOK_EVENTS: { id: keyof WebhookConfig['events']; label: string; description: string }[] = [
  { id: 'order.created', label: 'New order', description: 'Every order placed at checkout' },
  { id: 'order.status_changed', label: 'Order status changed', description: 'Confirmed, packed, shipped (with AWB), delivered, cancelled' },
  { id: 'customer.created', label: 'New customer', description: 'First order from a new phone number, or added manually' },
  {
    id: 'customer.stage_changed',
    label: 'Customer journey stage',
    description: 'Added to cart, started checkout, entered details, ordered — for follow-up & abandoned-cart automation',
  },
  { id: 'product.created', label: 'New product', description: 'Product created in the admin panel' },
  { id: 'product.updated', label: 'Product edited', description: 'Saved from the product form (quick stock/visibility toggles are not sent)' },
  { id: 'product.deleted', label: 'Product deleted', description: 'Product removed from the catalog' },
];

export const INITIAL_INTEGRATIONS: IntegrationSettings = {
  webhook: {
    enabled: !!ENV_WEBHOOK_URL,
    url: ENV_WEBHOOK_URL,
    secret: '',
    events: {
      'order.created': true,
      'order.status_changed': false,
      'customer.created': true,
      'customer.stage_changed': true,
      'product.created': true,
      'product.updated': false,
      'product.deleted': false,
    },
    stripUploadedImages: true,
  },
  deliveryPartners: [],
};

export const DELIVERY_PROVIDERS: { name: string; tracking: string; keyLabel: string; secretLabel: string; accountLabel: string }[] = [
  { name: 'Shiprocket', tracking: 'https://shiprocket.co/tracking/{awb}', keyLabel: 'API user email', secretLabel: 'API user password', accountLabel: 'Channel ID' },
  { name: 'Delhivery', tracking: 'https://www.delhivery.com/track/package/{awb}', keyLabel: 'API token', secretLabel: 'Client secret (optional)', accountLabel: 'Client name / warehouse' },
  { name: 'BlueDart', tracking: '', keyLabel: 'License key', secretLabel: 'API secret', accountLabel: 'Login ID / customer code' },
  { name: 'DTDC', tracking: '', keyLabel: 'API key', secretLabel: 'Access token', accountLabel: 'Customer code' },
  { name: 'XpressBees', tracking: '', keyLabel: 'API key', secretLabel: 'Password', accountLabel: 'Business account ID' },
  { name: 'Ekart', tracking: '', keyLabel: 'Client ID', secretLabel: 'Client secret', accountLabel: 'Merchant code' },
  { name: 'Shadowfax', tracking: '', keyLabel: 'API token', secretLabel: 'Secret', accountLabel: 'Client code' },
  { name: 'India Post', tracking: '', keyLabel: 'API key', secretLabel: 'Secret', accountLabel: 'Customer ID' },
  { name: 'Custom / Other', tracking: '', keyLabel: 'API key', secretLabel: 'API secret', accountLabel: 'Account ID' },
];

export const trackingUrl = (template: string | undefined, awb?: string) =>
  template && awb ? template.replace('{awb}', encodeURIComponent(awb)) : '';

const stripImages = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stripImages);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        typeof v === 'string' && v.startsWith('data:') ? '[uploaded-image]' : stripImages(v),
      ])
    );
  }
  return value;
};

const hmacHex = async (secret: string, body: string) => {
  if (!secret || typeof crypto === 'undefined' || !crypto.subtle) return '';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const buildPayload = (cfg: WebhookConfig, event: WebhookEvent, data: unknown) => {
  const envelope = {
    event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    source: "harpudhas-store",
    data: cfg.stripUploadedImages ? stripImages(data) : data,
  };
  return JSON.stringify(envelope);
};

/**
 * POST a payload to the webhook. Browsers block cross-origin JSON posts unless the
 * receiver allows CORS, so on a CORS/network failure we resend as a "simple"
 * request (text/plain, no-cors). That one is delivered but its response can't be
 * read, so it's logged as "sent" rather than "success".
 */
export const deliverWebhook = async (
  cfg: WebhookConfig,
  event: WebhookEvent,
  body: string,
  summary: string
): Promise<WebhookLogEntry> => {
  const base: WebhookLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    event,
    timestamp: new Date().toISOString(),
    status: 'failed',
    bytes: body.length,
    summary,
    payload: body.length < 150_000 ? body : undefined,
  };
  if (!cfg.url) return { ...base, error: 'No webhook URL set' };

  const signature = await hmacHex(cfg.secret, body);
  try {
    const res = await fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Harpudhas-Event': event,
        ...(signature ? { 'X-Harpudhas-Signature': `sha256=${signature}` } : {}),
      },
      body,
    });
    return res.ok
      ? { ...base, status: 'success', httpStatus: res.status, payload: undefined }
      : { ...base, httpStatus: res.status, error: `HTTP ${res.status} ${res.statusText}` };
  } catch {
    try {
      await fetch(cfg.url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body });
      return { ...base, status: 'sent', payload: undefined, error: 'Receiver does not allow CORS — delivered without confirmation (signature header not sent)' };
    } catch (e) {
      return { ...base, error: `Network error: ${(e as Error).message}` };
    }
  }
};

export const productSummary = (p: Product) => `${p.name} (${p.id})`;
