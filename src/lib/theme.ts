import { ThemeSettings } from '@/types/store';

export type Scale = Record<string, string>; // shade -> hex
const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (hex: string, target: string, t: number) => {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
};
export const triplet = (hex: string) => hexToRgb(hex).join(' ');
export const isHex = (v: string) => /^#([0-9a-f]{6})$/i.test(v);

/** Primary (botanical) scale: the picked colour becomes shade 800 — buttons, headings, dark sections. */
export const primaryScale = (base: string): Scale => {
  const w = '#ffffff';
  const k = '#000000';
  const s: Record<string, [string, number]> = {
    '50': [w, 0.95], '100': [w, 0.9], '200': [w, 0.8], '300': [w, 0.66], '400': [w, 0.52],
    '500': [w, 0.38], '600': [w, 0.24], '700': [w, 0.12], '800': [w, 0], '900': [k, 0.32], '950': [k, 0.5],
  };
  return Object.fromEntries(SHADES.map((sh) => [sh, mix(base, s[sh][0], s[sh][1])]));
};

/** Accent (sandal) scale: the picked colour becomes shade 500 — highlights, badges, page tint at 50/100. */
export const accentScale = (base: string): Scale => {
  const w = '#ffffff';
  const k = '#000000';
  const s: Record<string, [string, number]> = {
    '50': [w, 0.94], '100': [w, 0.86], '200': [w, 0.72], '300': [w, 0.5], '400': [w, 0.25],
    '500': [w, 0], '600': [k, 0.12], '700': [k, 0.28], '800': [k, 0.45], '900': [k, 0.6], '950': [k, 0.72],
  };
  return Object.fromEntries(SHADES.map((sh) => [sh, mix(base, s[sh][0], s[sh][1])]));
};

// The original Hàrpudha's palette, kept exact
const BOTANICAL_DEFAULT: Scale = {
  '50': '#F6F8F5', '100': '#EBF0E8', '200': '#D4E0CE', '300': '#A9C2A0', '400': '#6E9466', '500': '#2E5A44',
  '600': '#234735', '700': '#1B3B2B', '800': '#132A1F', '900': '#0C1C14', '950': '#07120C',
};
const SANDAL_DEFAULT: Scale = {
  '50': '#FCFBF7', '100': '#F7F3E8', '200': '#EFE6D1', '300': '#E2D2B0', '400': '#D6B67E', '500': '#C89D54',
  '600': '#B0843B', '700': '#8E6728', '800': '#6B4D1E', '900': '#4A3515', '950': '#2E210D',
};

export const SITE_PRESETS: { id: string; name: string; description: string; primary: string; accent: string; scales?: { primary: Scale; accent: Scale } }[] = [
  { id: 'botanical', name: 'Botanical Forest', description: 'Default · deep green & sandalwood', primary: '#132A1F', accent: '#C89D54', scales: { primary: BOTANICAL_DEFAULT, accent: SANDAL_DEFAULT } },
  { id: 'saffron', name: 'Saffron Temple', description: 'Warm maroon & saffron gold', primary: '#4A1A1A', accent: '#E3A13B' },
  { id: 'tulsi', name: 'Tulsi Leaf', description: 'Fresh herbal green & turmeric', primary: '#1F4D2B', accent: '#D9A621' },
  { id: 'rose', name: 'Rose Ayurveda', description: 'Soft plum & rose gold', primary: '#3B1F33', accent: '#C9907F' },
  { id: 'indigo', name: 'Indigo Night', description: 'Calm indigo & brass', primary: '#1C2541', accent: '#C2A060' },
  { id: 'earth', name: 'Terracotta Earth', description: 'Clay brown & ochre', primary: '#3A2618', accent: '#C27A3E' },
];

export const sitePalette = (t: ThemeSettings['site']) => {
  const preset = SITE_PRESETS.find((p) => p.id === t.preset);
  if (preset?.scales && t.preset !== 'custom') return preset.scales;
  const primary = t.preset === 'custom' ? t.primary : preset?.primary ?? t.primary;
  const accent = t.preset === 'custom' ? t.accent : preset?.accent ?? t.accent;
  return { primary: primaryScale(isHex(primary) ? primary : '#132A1F'), accent: accentScale(isHex(accent) ? accent : '#C89D54') };
};

// ---------- Admin ----------

export const ADMIN_ACCENTS: { id: string; name: string; scale: Scale }[] = [
  { id: 'emerald', name: 'Emerald', scale: { '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22' } },
  { id: 'teal', name: 'Teal', scale: { '50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4', '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e', '800': '#115e59', '900': '#134e4a', '950': '#042f2e' } },
  { id: 'blue', name: 'Blue', scale: { '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a', '950': '#172554' } },
  { id: 'indigo', name: 'Indigo', scale: { '50': '#eef2ff', '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca', '800': '#3730a3', '900': '#312e81', '950': '#1e1b4b' } },
  { id: 'violet', name: 'Violet', scale: { '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065' } },
  { id: 'rose', name: 'Rose', scale: { '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519' } },
];

export const ADMIN_SIDEBARS: { id: string; name: string; color: string }[] = [
  { id: 'forest', name: 'Forest', color: '#0E1F17' },
  { id: 'midnight', name: 'Midnight', color: '#0F172A' },
  { id: 'charcoal', name: 'Charcoal', color: '#18181B' },
  { id: 'plum', name: 'Plum', color: '#1E1530' },
  { id: 'ocean', name: 'Ocean', color: '#0B2530' },
  { id: 'cocoa', name: 'Cocoa', color: '#24180F' },
];

export const DEFAULT_THEME: ThemeSettings = {
  site: { preset: 'botanical', primary: '#132A1F', accent: '#C89D54' },
  admin: { accent: 'emerald', sidebar: 'forest' },
};

/** Write the active theme into CSS variables on <html>. */
export const applyTheme = (theme: ThemeSettings, area: 'site' | 'admin') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement.style;
  const { primary, accent } = sitePalette(theme.site);
  Object.entries(primary).forEach(([k, v]) => root.setProperty(`--botanical-${k}`, triplet(v)));
  Object.entries(accent).forEach(([k, v]) => root.setProperty(`--sandal-${k}`, triplet(v)));
  // The admin accent re-colours Tailwind's `emerald` — only inside the admin,
  // so the storefront's small green accents stay as designed.
  const adminScale = (ADMIN_ACCENTS.find((a) => a.id === theme.admin.accent) ?? ADMIN_ACCENTS[0]).scale;
  const scale = area === 'admin' ? adminScale : ADMIN_ACCENTS[0].scale;
  Object.entries(scale).forEach(([k, v]) => root.setProperty(`--emerald-${k}`, triplet(v)));
  const sidebar = ADMIN_SIDEBARS.find((s) => s.id === theme.admin.sidebar) ?? ADMIN_SIDEBARS[0];
  root.setProperty('--admin-sidebar', triplet(sidebar.color));
};
