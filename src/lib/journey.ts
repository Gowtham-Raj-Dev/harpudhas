import { FollowUpStatus, JourneyStage, SiteSettings, VisitorJourney } from '@/types/store';

export const STAGES: { id: JourneyStage; label: string; short: string; color: string; pill: string }[] = [
  { id: 'browsing', label: 'Browsing', short: 'Visited', color: 'bg-slate-400', pill: 'bg-slate-100 text-slate-700 ring-slate-200' },
  { id: 'viewed_product', label: 'Viewed product', short: 'Viewed', color: 'bg-sky-500', pill: 'bg-sky-50 text-sky-800 ring-sky-200' },
  { id: 'added_to_cart', label: 'Added to cart', short: 'Cart', color: 'bg-amber-500', pill: 'bg-amber-50 text-amber-800 ring-amber-200' },
  { id: 'checkout_started', label: 'Checkout started', short: 'Checkout', color: 'bg-orange-500', pill: 'bg-orange-50 text-orange-800 ring-orange-200' },
  { id: 'details_entered', label: 'Details entered', short: 'Details', color: 'bg-rose-500', pill: 'bg-rose-50 text-rose-700 ring-rose-200' },
  { id: 'ordered', label: 'Ordered', short: 'Ordered', color: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
];

export const stageRank = (s: JourneyStage) => STAGES.findIndex((x) => x.id === s);
export const stageMeta = (s: JourneyStage) => STAGES[stageRank(s)] ?? STAGES[0];

// Stages worth notifying the webhook about (page views would be far too noisy)
export const NOTIFY_STAGES: JourneyStage[] = ['added_to_cart', 'checkout_started', 'details_entered', 'ordered'];

export const FOLLOW_UP_OPTIONS: { value: FollowUpStatus; label: string; dot: string }[] = [
  { value: 'new', label: 'Not contacted', dot: 'bg-slate-400' },
  { value: 'contacted', label: 'Contacted', dot: 'bg-sky-500' },
  { value: 'converted', label: 'Converted', dot: 'bg-emerald-500' },
  { value: 'not_interested', label: 'Not interested', dot: 'bg-rose-400' },
];

export const minutesSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / 60000;

/** Left the funnel after adding to cart and hasn't come back for a while. */
export const isAbandoned = (j: VisitorJourney, afterMinutes: number) =>
  ['added_to_cart', 'checkout_started', 'details_entered'].includes(j.stage) && j.cart.length > 0 && minutesSince(j.lastSeen) >= afterMinutes;

export const visitorName = (j: VisitorJourney) => j.fullName || (j.phone ? `+91 ${j.phone}` : `Visitor ${j.id.slice(-5).toUpperCase()}`);

export const timeAgo = (iso: string) => {
  const m = Math.round(minutesSince(iso));
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
};

export const templateKeyFor = (j: VisitorJourney): keyof SiteSettings['followUpTemplates'] =>
  j.stage === 'added_to_cart' || j.stage === 'checkout_started' || j.stage === 'details_entered' || j.stage === 'ordered' ? j.stage : 'general';

export const fillTemplate = (tpl: string, j: VisitorJourney, coupon: string, storeUrl: string) =>
  tpl
    .replace(/\{name\}/g, j.fullName?.split(' ')[0] || 'there')
    .replace(/\{cart_items\}/g, j.cart.length ? j.cart.map((c) => `${c.name}${c.qty > 1 ? ` ×${c.qty}` : ''}`).join(', ') : 'your favourites')
    .replace(/\{cart_value\}/g, `₹${Math.round(j.cartValue).toLocaleString('en-IN')}`)
    .replace(/\{coupon\}/g, coupon)
    .replace(/\{store_url\}/g, storeUrl);

export const waLink = (phone: string, text: string) => {
  const d = phone.replace(/\D/g, '');
  return `https://wa.me/${d.length === 10 ? '91' + d : d}?text=${encodeURIComponent(text)}`;
};

export const detectDevice = () => {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'Mac' : 'Other';
  return `${/Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop'} · ${os}`;
};

export const detectSource = () => {
  if (typeof window === 'undefined') return 'Direct';
  const utm = new URLSearchParams(window.location.search).get('utm_source');
  if (utm) return utm;
  try {
    const ref = document.referrer ? new URL(document.referrer).hostname : '';
    if (!ref || ref === window.location.hostname) return 'Direct';
    if (/google\./.test(ref)) return 'Google';
    if (/instagram|facebook|fb\./.test(ref)) return 'Instagram / Facebook';
    if (/whatsapp|wa\.me/.test(ref)) return 'WhatsApp';
    return ref;
  } catch {
    return 'Direct';
  }
};
