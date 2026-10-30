'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { PageContents, SiteSettings } from '@/types/store';
import { Badge, Button, Card, Collapsible, Field, Input, PageHeader, SegmentedTabs, Textarea, Toggle, cx } from './ui';
import { ExternalLink, Eye, EyeOff, Monitor, RotateCw, Smartphone } from 'lucide-react';

type FieldDef = { key: string; label: string; type?: 'text' | 'textarea' | 'number'; wide?: boolean };
type Group = { title: string; section?: keyof SiteSettings['sections']; fields: FieldDef[] };

const HOME_GROUPS: Group[] = [
  {
    title: 'Hero (shown when no banner is active)',
    section: 'homeHero',
    fields: [
      { key: 'heroBadge', label: 'Badge text', wide: true },
      { key: 'heroTitle', label: 'Headline', wide: true },
      { key: 'heroSubtitle', label: 'Subtitle', type: 'textarea', wide: true },
      { key: 'heroBtn1', label: 'Primary button' },
      { key: 'heroBtn2', label: 'Secondary button' },
      { key: 'marqueeText', label: 'Scrolling marquee text (empty = hide)', wide: true },
    ],
  },
  {
    title: 'Feature bar (4 USPs)',
    section: 'homeUsp',
    fields: [1, 2, 3, 4].flatMap((n) => [
      { key: `usp${n}Title`, label: `USP ${n} title` },
      { key: `usp${n}Desc`, label: `USP ${n} description` },
    ]),
  },
  {
    title: 'Shop by category',
    section: 'homeCategories',
    fields: [
      { key: 'catEyebrow', label: 'Eyebrow' },
      { key: 'catTitle', label: 'Title' },
      { key: 'catSubtitle', label: 'Subtitle', wide: true },
    ],
  },
  {
    title: 'Bestsellers',
    section: 'homeFeatured',
    fields: [
      { key: 'prodEyebrow', label: 'Eyebrow' },
      { key: 'prodTitle', label: 'Title' },
      { key: 'prodSubtitle', label: 'Subtitle', wide: true },
      { key: 'prodBtnText', label: 'View-all button' },
    ],
  },
  { title: 'New arrivals', section: 'homeNew', fields: [] },
  {
    title: 'Routine finder (quiz)',
    section: 'homeQuiz',
    fields: [
      { key: 'quizEyebrow', label: 'Eyebrow' },
      { key: 'quizTitle', label: 'Title' },
      { key: 'quizSubtitle', label: 'Subtitle', type: 'textarea', wide: true },
      { key: 'quizMatchTitle', label: 'Result heading' },
    ],
  },
  {
    title: 'Our process (4 steps)',
    section: 'homeProcess',
    fields: [
      { key: 'processEyebrow', label: 'Eyebrow' },
      { key: 'processTitle', label: 'Title' },
      { key: 'processSubtitle', label: 'Subtitle', wide: true },
      ...[1, 2, 3, 4].flatMap((n) => [
        { key: `step${n}Title`, label: `Step ${n} title` },
        { key: `step${n}Desc`, label: `Step ${n} text` },
      ]),
    ],
  },
  {
    title: 'FAQ',
    section: 'homeFaq',
    fields: [
      { key: 'faqEyebrow', label: 'Eyebrow' },
      { key: 'faqTitle', label: 'Title' },
      ...[1, 2, 3, 4].flatMap((n) => [
        { key: `faq${n}Q`, label: `Question ${n}`, wide: true },
        { key: `faq${n}A`, label: `Answer ${n}`, type: 'textarea' as const, wide: true },
      ]),
    ],
  },
];

const PAGE_GROUPS: Record<'shop' | 'about' | 'contact', Group[]> = {
  shop: [{ title: 'Shop header', fields: [{ key: 'title', label: 'Title', wide: true }, { key: 'subtitle', label: 'Subtitle', type: 'textarea', wide: true }] }],
  about: [
    {
      title: 'About page',
      fields: [
        { key: 'title', label: 'Title', wide: true },
        { key: 'subtitle', label: 'Subtitle', type: 'textarea', wide: true },
        { key: 'storyTitle', label: 'Story heading', wide: true },
        { key: 'storyText1', label: 'Story paragraph 1', type: 'textarea', wide: true },
        { key: 'storyText2', label: 'Story paragraph 2', type: 'textarea', wide: true },
      ],
    },
  ],
  contact: [
    {
      title: 'Contact page',
      fields: [
        { key: 'title', label: 'Title', wide: true },
        { key: 'subtitle', label: 'Subtitle', type: 'textarea', wide: true },
        { key: 'hours', label: 'Opening hours', wide: true },
      ],
    },
  ],
};

const HEADER_FIELDS: FieldDef[] = [
  { key: 'announcementText', label: 'Announcement bar text', wide: true },
  { key: 'phone', label: 'Phone' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'logoTitle', label: 'Brand name' },
  { key: 'logoSubtitle', label: 'Brand tagline' },
  { key: 'freeShippingThreshold', label: 'Free shipping above (₹)', type: 'number' },
];

const FOOTER_FIELDS: FieldDef[] = [
  { key: 'brandDescription', label: 'Brand description', type: 'textarea', wide: true },
  { key: 'address', label: 'Address', type: 'textarea', wide: true },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram URL' },
  { key: 'facebook', label: 'Facebook URL' },
  { key: 'youtube', label: 'YouTube URL' },
  { key: 'copyrightText', label: 'Copyright line', wide: true },
];

type PageKey = 'home' | 'shop' | 'about' | 'contact' | 'header' | 'footer';
const PREVIEW_PATH: Record<PageKey, string> = { home: '/', shop: '/shop/', about: '/about/', contact: '/contact/', header: '/', footer: '/' };

const FieldGrid: React.FC<{ fields: FieldDef[]; get: (k: string) => string | number; set: (k: string, v: string | number) => void }> = ({ fields, get, set }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
    {fields.map((f) => (
      <Field key={f.key} label={f.label} className={f.wide ? 'sm:col-span-2' : ''}>
        {f.type === 'textarea' ? (
          <Textarea rows={3} value={String(get(f.key) ?? '')} onChange={(e) => set(f.key, e.target.value)} />
        ) : (
          <Input
            type={f.type === 'number' ? 'number' : 'text'}
            value={get(f.key) ?? ''}
            onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
          />
        )}
      </Field>
    ))}
  </div>
);

export const ContentTab: React.FC = () => {
  const { pageContents, updatePageContent, siteSettings, updateSiteSettings, headerConfig, updateHeaderConfig, footerConfig, updateFooterConfig } = useStore();
  const [page, setPage] = useState<PageKey>('home');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const touch = () => setSavedAt(new Date());
  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const setSection = (k: keyof SiteSettings['sections'], v: boolean) => {
    updateSiteSettings({ sections: { ...siteSettings.sections, [k]: v } }, { silent: true });
    touch();
  };

  const contentGetter = (p: keyof PageContents) => (k: string) => (pageContents[p] as unknown as Record<string, string>)[k];
  const contentSetter = (p: keyof PageContents) => (k: string, v: string | number) => {
    updatePageContent(p, { [k]: v } as Partial<PageContents[typeof p]>, { silent: true });
    touch();
  };

  const visibleCount = Object.values(siteSettings.sections).filter(Boolean).length;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Live site editor"
        subtitle="Every change saves instantly and updates the open storefront live — no publish button needed."
        actions={
          <>
            <span className={cx('inline-flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-medium transition-colors', savedAt ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
              <span className="relative flex w-2 h-2">
                <span className={cx('absolute inset-0 rounded-full bg-emerald-500', savedAt && 'animate-live')} />
              </span>
              {savedAt ? 'Saved · live now' : 'Live'}
            </span>
            <Button icon={showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} onClick={() => setShowPreview((s) => !s)}>
              {showPreview ? 'Hide preview' : 'Show preview'}
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <SegmentedTabs
          value={page}
          onChange={setPage}
          options={[
            { value: 'home', label: 'Home page' },
            { value: 'shop', label: 'Shop' },
            { value: 'about', label: 'About' },
            { value: 'contact', label: 'Contact' },
            { value: 'header', label: 'Header & announcement' },
            { value: 'footer', label: 'Footer' },
          ]}
        />
      </div>

      <div className={cx('grid gap-5', showPreview ? 'grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : 'grid-cols-1 max-w-4xl')}>
        <div className="space-y-3 min-w-0">
          {page === 'home' && (
            <>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Home page sections</p>
                    <p className="text-xs text-slate-500">{visibleCount} of {Object.keys(siteSettings.sections).length} sections visible</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {HOME_GROUPS.filter((g) => g.section).map((g) => (
                    <Toggle key={g.section} checked={siteSettings.sections[g.section!]} onChange={(v) => setSection(g.section!, v)} label={g.title.replace(/ \(.*\)$/, '')} />
                  ))}
                </div>
              </Card>

              <Card>
                <p className="text-sm font-semibold text-slate-900">New arrivals heading</p>
                <p className="text-xs text-slate-500 mb-3">Which products appear, their order and count are set in <b>Home page products</b>.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="New arrivals title">
                    <Input
                      value={siteSettings.newSectionTitle}
                      onChange={(e) => {
                        updateSiteSettings({ newSectionTitle: e.target.value }, { silent: true });
                        touch();
                      }}
                    />
                  </Field>
                  <Field label="New arrivals subtitle">
                    <Input
                      value={siteSettings.newSectionSubtitle}
                      onChange={(e) => {
                        updateSiteSettings({ newSectionSubtitle: e.target.value }, { silent: true });
                        touch();
                      }}
                    />
                  </Field>
                </div>
              </Card>

              {HOME_GROUPS.filter((g) => g.fields.length).map((g, i) => (
                <Collapsible
                  key={g.title}
                  defaultOpen={i === 0}
                  title={g.title}
                  subtitle={`${g.fields.length} fields`}
                  badge={g.section && !siteSettings.sections[g.section] ? <Badge tone="amber">Hidden</Badge> : null}
                  right={g.section ? <Toggle size="sm" checked={siteSettings.sections[g.section]} onChange={(v) => setSection(g.section!, v)} /> : null}
                >
                  <FieldGrid fields={g.fields} get={contentGetter('home')} set={contentSetter('home')} />
                </Collapsible>
              ))}
            </>
          )}

          {(page === 'shop' || page === 'about' || page === 'contact') &&
            PAGE_GROUPS[page].map((g) => (
              <Collapsible key={g.title} defaultOpen title={g.title} subtitle={`${g.fields.length} fields`}>
                <FieldGrid fields={g.fields} get={contentGetter(page)} set={contentSetter(page)} />
              </Collapsible>
            ))}

          {page === 'header' && (
            <>
              <Card>
                <div className="space-y-3">
                  <Toggle
                    checked={headerConfig.announcementActive && siteSettings.sections.announcementBar}
                    onChange={(v) => {
                      updateHeaderConfig({ announcementActive: v }, { silent: true });
                      setSection('announcementBar', v);
                    }}
                    label="Announcement bar"
                    description="Thin strip at the very top of every page"
                  />
                </div>
              </Card>
              <Collapsible defaultOpen title="Header details" subtitle="Brand, contact & shipping threshold">
                <FieldGrid
                  fields={HEADER_FIELDS}
                  get={(k) => (headerConfig as unknown as Record<string, string | number>)[k]}
                  set={(k, v) => {
                    updateHeaderConfig({ [k]: v }, { silent: true });
                    touch();
                  }}
                />
              </Collapsible>
            </>
          )}

          {page === 'footer' && (
            <Collapsible defaultOpen title="Footer & contact details" subtitle="Shown at the bottom of every page">
              <FieldGrid
                fields={FOOTER_FIELDS}
                get={(k) => (footerConfig as unknown as Record<string, string>)[k]}
                set={(k, v) => {
                  updateFooterConfig({ [k]: v }, { silent: true });
                  touch();
                }}
              />
            </Collapsible>
          )}
        </div>

        {showPreview && (
          <div className="2xl:sticky 2xl:top-20 h-fit min-w-0">
            <Card padded={false} className="overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="flex-1 mx-2 h-7 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 flex items-center truncate">
                  {PREVIEW_PATH[page]}
                </span>
                <button onClick={() => setDevice('desktop')} className={cx('p-1.5 rounded-md', device === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400')}>
                  <Monitor className="w-4 h-4" />
                </button>
                <button onClick={() => setDevice('mobile')} className={cx('p-1.5 rounded-md', device === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400')}>
                  <Smartphone className="w-4 h-4" />
                </button>
                <button onClick={() => iframeRef.current?.contentWindow?.location.reload()} className="p-1.5 rounded-md text-slate-400 hover:text-slate-900" title="Reload">
                  <RotateCw className="w-4 h-4" />
                </button>
                <a href={withBasePath(PREVIEW_PATH[page])} target="_blank" rel="noreferrer" className="p-1.5 rounded-md text-slate-400 hover:text-slate-900" title="Open in new tab">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="bg-slate-100 flex justify-center">
                <iframe
                  ref={iframeRef}
                  key={page}
                  src={withBasePath(PREVIEW_PATH[page])}
                  title="Live preview"
                  className={cx('bg-white transition-all', device === 'mobile' ? 'w-[390px] my-4 rounded-2xl shadow-lg' : 'w-full')}
                  style={{ height: 720 }}
                />
              </div>
            </Card>
            <p className="text-[11px] text-slate-400 mt-2 text-center">The preview is the real site — it updates as you type.</p>
          </div>
        )}
      </div>
    </div>
  );
};
