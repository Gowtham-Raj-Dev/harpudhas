'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ThemeSettings } from '@/types/store';
import { ADMIN_ACCENTS, ADMIN_SIDEBARS, DEFAULT_THEME, SITE_PRESETS, isHex, sitePalette } from '@/lib/theme';
import { Badge, Button, Card, Field, Input, cx } from './ui';
import { Check, Monitor, Palette, RotateCcw, LayoutDashboard } from 'lucide-react';

const MiniStore: React.FC<{ primary: Record<string, string>; accent: Record<string, string> }> = ({ primary, accent }) => (
  <div className="rounded-xl overflow-hidden border border-black/5" style={{ background: accent['50'] }}>
    <div className="h-4 flex items-center px-2" style={{ background: primary['900'] }}>
      <span className="h-1 w-10 rounded-full" style={{ background: accent['300'] }} />
    </div>
    <div className="p-2.5 space-y-1.5">
      <span className="block h-1.5 w-14 rounded-full" style={{ background: accent['600'] }} />
      <span className="block h-2.5 w-24 rounded-full" style={{ background: primary['800'] }} />
      <div className="flex gap-1.5 pt-1">
        <span className="h-4 w-12 rounded-full" style={{ background: primary['800'] }} />
        <span className="h-4 w-10 rounded-full" style={{ background: accent['500'] }} />
      </div>
    </div>
  </div>
);

export const AppearanceSettings: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useStore();
  const theme = siteSettings.theme;
  const setTheme = (patch: { site?: Partial<ThemeSettings['site']>; admin?: Partial<ThemeSettings['admin']> }) =>
    updateSiteSettings(
      { theme: { site: { ...theme.site, ...(patch.site || {}) }, admin: { ...theme.admin, ...(patch.admin || {}) } } },
      { silent: true }
    );
  const custom = theme.site.preset === 'custom';
  const customPalette = sitePalette({ preset: 'custom', primary: theme.site.primary, accent: theme.site.accent });

  return (
    <div className="space-y-5">
      {/* Website theme */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Website theme</h3>
            <Badge tone="emerald">{custom ? 'Custom' : SITE_PRESETS.find((p) => p.id === theme.site.preset)?.name}</Badge>
          </div>
          <Button size="sm" variant="ghost" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={() => setTheme({ site: DEFAULT_THEME.site })} disabled={theme.site.preset === 'botanical'}>
            Reset to default
          </Button>
        </div>
        <p className="text-xs text-slate-500 mb-4">Colours for the storefront — header, buttons, sections, badges and page background. Applies live to open store tabs.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3">
          {SITE_PRESETS.map((p) => {
            const pal = sitePalette({ preset: p.id, primary: p.primary, accent: p.accent });
            const on = theme.site.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTheme({ site: { preset: p.id, primary: p.primary, accent: p.accent } })}
                className={cx('relative text-left p-2.5 rounded-2xl border transition-all', on ? 'border-emerald-600 ring-4 ring-emerald-600/10' : 'border-slate-200 hover:border-slate-300')}
              >
                <MiniStore primary={pal.primary} accent={pal.accent} />
                <p className="mt-2 text-sm font-medium text-slate-900 flex items-center gap-1.5">
                  {p.name}
                  {on && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </p>
                <p className="text-[11px] text-slate-500">{p.description}</p>
              </button>
            );
          })}
          <button
            onClick={() => setTheme({ site: { preset: 'custom' } })}
            className={cx('relative text-left p-2.5 rounded-2xl border transition-all', custom ? 'border-emerald-600 ring-4 ring-emerald-600/10' : 'border-dashed border-slate-300 hover:border-slate-400')}
          >
            <MiniStore primary={customPalette.primary} accent={customPalette.accent} />
            <p className="mt-2 text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Custom
              {custom && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </p>
            <p className="text-[11px] text-slate-500">Pick your own brand colours</p>
          </button>
        </div>

        {custom && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ['primary', 'Primary colour', 'Buttons, headings, dark sections & footer'],
                ['accent', 'Accent colour', 'Highlights, badges, marquee & page tint'],
              ] as const
            ).map(([key, label, hint]) => (
              <Field key={key} label={label} hint={hint}>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={isHex(theme.site[key]) ? theme.site[key] : '#000000'}
                    onChange={(e) => setTheme({ site: { [key]: e.target.value } })}
                    className="h-10 w-14 rounded-xl border border-slate-200 bg-white cursor-pointer p-1"
                  />
                  <Input value={theme.site[key]} onChange={(e) => setTheme({ site: { [key]: e.target.value } })} className="font-mono uppercase" maxLength={7} />
                </div>
                <div className="flex mt-2 rounded-lg overflow-hidden h-5">
                  {Object.entries(key === 'primary' ? customPalette.primary : customPalette.accent).map(([shade, hex]) => (
                    <span key={shade} className="flex-1" style={{ background: hex }} title={`${shade} · ${hex}`} />
                  ))}
                </div>
              </Field>
            ))}
          </div>
        )}
      </Card>

      {/* Admin theme */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Admin theme</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setTheme({ admin: DEFAULT_THEME.admin })}
            disabled={theme.admin.accent === DEFAULT_THEME.admin.accent && theme.admin.sidebar === DEFAULT_THEME.admin.sidebar}
          >
            Reset to default
          </Button>
        </div>
        <p className="text-xs text-slate-500 mb-4">Only changes this admin console — buttons, highlights and the sidebar.</p>

        <p className="text-xs font-semibold text-slate-600 mb-2">Accent colour</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {ADMIN_ACCENTS.map((a) => {
            const on = theme.admin.accent === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setTheme({ admin: { accent: a.id } })}
                className={cx('flex items-center gap-2 h-10 pl-2 pr-3.5 rounded-xl border text-sm transition-all', on ? 'border-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300')}
              >
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ background: a.scale['600'] }}>
                  {on && <Check className="w-3.5 h-3.5" />}
                </span>
                {a.name}
                {a.id === 'emerald' && <span className="text-[10px] text-slate-400">default</span>}
              </button>
            );
          })}
        </div>

        <p className="text-xs font-semibold text-slate-600 mb-2">Sidebar</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {ADMIN_SIDEBARS.map((s) => {
            const on = theme.admin.sidebar === s.id;
            const accent = (ADMIN_ACCENTS.find((a) => a.id === theme.admin.accent) ?? ADMIN_ACCENTS[0]).scale;
            return (
              <button
                key={s.id}
                onClick={() => setTheme({ admin: { sidebar: s.id } })}
                className={cx('p-1.5 rounded-xl border transition-all', on ? 'border-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300')}
              >
                <div className="h-16 rounded-lg p-2 space-y-1.5" style={{ background: s.color }}>
                  <span className="block h-1.5 w-8 rounded-full bg-white/70" />
                  <span className="block h-3 rounded" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <span className="block h-3 w-1 rounded-l" style={{ background: accent['400'] }} />
                  </span>
                  <span className="block h-1.5 w-10 rounded-full bg-white/25" />
                </div>
                <p className="text-[11px] font-medium text-slate-700 mt-1.5 flex items-center justify-center gap-1">
                  {s.name}
                  {on && <Check className="w-3 h-3" />}
                </p>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
