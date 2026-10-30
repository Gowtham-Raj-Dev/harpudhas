'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { AutoRule, CategoryType, HomeSectionConfig, HomeSectionId, Product } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  AUTO_RULES,
  HOME_SECTIONS,
  getPlacements,
  isOutOfStock,
  manualSectionList,
  resolveHomeSection,
  resolveHomeSectionAll,
  salesByProduct,
  sortByRule,
} from '@/lib/storeUtils';
import { Badge, Button, Card, EmptyState, IconButton, PageHeader, Toggle, cx } from './ui';
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Hand,
  Monitor,
  Plus,
  RotateCw,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';

const CATEGORIES: ('all' | CategoryType)[] = ['all', 'Hair Care', 'Face Care', 'Skin & Body'];

export const HomeProductsTab: React.FC = () => {
  const { products, orders, siteSettings, updateSiteSettings, updateProduct, triggerToast } = useStore();
  const [active, setActive] = useState<HomeSectionId>('home-featured');
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerCat, setPickerCat] = useState<'all' | CategoryType>('all');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const meta = HOME_SECTIONS.find((s) => s.id === active)!;
  const cfg = siteSettings.homeProducts[active];
  const isQuiz = active === 'home-quiz';
  const sectionOn = siteSettings.sections[meta.sectionKey];
  const sales = useMemo(() => salesByProduct(orders), [orders]);

  const setCfg = (patch: Partial<HomeSectionConfig>, id: HomeSectionId = active) =>
    updateSiteSettings(
      { homeProducts: { ...siteSettings.homeProducts, [id]: { ...siteSettings.homeProducts[id], ...patch } } },
      { silent: true }
    );

  // ---- manual list helpers ----
  const manual = manualSectionList(products, active, cfg);
  const liveIds = new Set(resolveHomeSection(products, orders, active, cfg).map((p) => p.id));
  const eligibleIds = new Set(resolveHomeSectionAll(products, orders, active, cfg).map((p) => p.id));

  const reason = (p: Product): string | null => {
    if (p.isVisible === false) return 'Product hidden';
    if (cfg.hideOutOfStock && isOutOfStock(p)) return 'Out of stock';
    if (cfg.category !== 'all' && p.category !== cfg.category) return `Not ${cfg.category}`;
    if (!isQuiz && !liveIds.has(p.id) && eligibleIds.has(p.id)) return `Over limit of ${cfg.limit}`;
    return null;
  };

  const setPlacement = (p: Product, on: boolean) => {
    const cur = getPlacements(p);
    updateProduct(p.id, { placements: on ? Array.from(new Set([...cur, active])) : cur.filter((x) => x !== active) }, { silent: true });
  };

  const add = (p: Product) => {
    setPlacement(p, true);
    setCfg({ order: [...manual.map((m) => m.id), p.id] });
    triggerToast(`Added “${p.name}” to ${meta.label}`, 'info');
  };
  const remove = (p: Product) => {
    setPlacement(p, false);
    setCfg({ order: cfg.order.filter((x) => x !== p.id) });
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= manual.length || from === to) return;
    const ids = manual.map((m) => m.id);
    const [x] = ids.splice(from, 1);
    ids.splice(to, 0, x);
    setCfg({ order: ids });
  };
  const replaceWith = (ids: string[], mode?: 'manual') => {
    const set = new Set(ids);
    products.forEach((p) => {
      const has = getPlacements(p).includes(active);
      if (has !== set.has(p.id)) setPlacement(p, set.has(p.id));
    });
    setCfg({ order: ids, ...(mode ? { mode } : {}) });
  };
  const fillFromRule = (rule: AutoRule) => {
    let pool = products.filter((p) => p.isVisible !== false && !isOutOfStock(p));
    if (cfg.category !== 'all') pool = pool.filter((p) => p.category === cfg.category);
    const n = isQuiz ? cfg.limit * 3 : cfg.limit;
    const ids = isQuiz
      ? (['Hair Care', 'Face Care', 'Skin & Body'] as CategoryType[]).flatMap((c) =>
          sortByRule(pool.filter((p) => p.category === c), rule, orders).slice(0, cfg.limit).map((p) => p.id)
        )
      : sortByRule(pool, rule, orders).slice(0, n).map((p) => p.id);
    replaceWith(ids, 'manual');
    triggerToast(`Filled ${meta.label} with ${ids.length} ${AUTO_RULES.find((r) => r.value === rule)?.label.toLowerCase()} products`);
  };

  // ---- picker ----
  const inSection = new Set(manual.map((m) => m.id));
  const pickable = products.filter((p) => {
    if (inSection.has(p.id)) return false;
    if (pickerCat !== 'all' && p.category !== pickerCat) return false;
    const q = pickerQuery.trim().toLowerCase();
    return !q || `${p.name} ${p.tamilName} ${p.sku ?? ''}`.toLowerCase().includes(q);
  });

  // ---- auto preview ----
  const autoList = resolveHomeSectionAll(products, orders, active, cfg);
  const autoShown = isQuiz
    ? (['Hair Care', 'Face Care', 'Skin & Body'] as CategoryType[]).flatMap((c) => autoList.filter((p) => p.category === c).slice(0, cfg.limit))
    : autoList.slice(0, cfg.limit);

  const metric = (p: Product, rule: AutoRule) => {
    switch (rule) {
      case 'bestselling':
        return `${sales[p.id] || 0} sold`;
      case 'newest':
        return p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
      case 'top-rated':
        return `★ ${p.rating.toFixed(1)}`;
      case 'most-reviewed':
        return `${p.reviews} reviews`;
      case 'discount':
        return p.mrp > p.price ? `${Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off` : '0%';
      default:
        return `₹${p.price}`;
    }
  };

  // ---- preview iframe: jump to the section being edited ----
  const scrollPreview = () => {
    try {
      const doc = iframeRef.current?.contentWindow?.document;
      doc?.getElementById(meta.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      // cross-origin or not loaded yet
    }
  };
  useEffect(() => {
    const t = setTimeout(scrollPreview, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, device, cfg.limit, cfg.columns, cfg.mode]);

  const quizCounts = (['Hair Care', 'Face Care', 'Skin & Body'] as CategoryType[]).map((c) => ({
    c,
    n: resolveHomeSection(products, orders, active, cfg, c).length,
  }));

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Home page products"
        subtitle="Choose exactly which products appear in each home section, in what order — or let them fill automatically."
      />

      {/* Section switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {HOME_SECTIONS.map((s) => {
          const c = siteSettings.homeProducts[s.id];
          const on = siteSettings.sections[s.sectionKey];
          const count =
            s.id === 'home-quiz'
              ? (['Hair Care', 'Face Care', 'Skin & Body'] as CategoryType[]).reduce((n, cat) => n + resolveHomeSection(products, orders, s.id, c, cat).length, 0)
              : resolveHomeSection(products, orders, s.id, c).length;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cx(
                'text-left p-4 rounded-2xl border bg-white transition-all',
                active === s.id ? 'border-emerald-600 ring-4 ring-emerald-600/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{s.label}</span>
                {on ? <Badge tone="emerald">Visible</Badge> : <Badge tone="amber">Section off</Badge>}
              </div>
              <p className="text-xs text-slate-500 mt-1">{s.description}</p>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <Badge tone={c.mode === 'auto' ? 'violet' : 'sky'}>
                  {c.mode === 'auto' ? <Sparkles className="w-3 h-3" /> : <Hand className="w-3 h-3" />}
                  {c.mode === 'auto' ? `Auto · ${AUTO_RULES.find((r) => r.value === c.rule)?.label}` : 'Manual'}
                </Badge>
                <span className="text-slate-500">
                  <b className="text-slate-900 tabular-nums">{count}</b> showing
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-5">
        <div className="space-y-4 min-w-0">
          {/* Section settings */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{meta.label} settings</h3>
                <p className="text-xs text-slate-500">Changes are live on the home page instantly</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Show section</span>
                <Toggle checked={sectionOn} onChange={(v) => updateSiteSettings({ sections: { ...siteSettings.sections, [meta.sectionKey]: v } }, { silent: true })} />
              </div>
            </div>

            {/* Mode */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { v: 'manual' as const, icon: Hand, title: 'Manual', desc: 'You pick products and their order' },
                { v: 'auto' as const, icon: Sparkles, title: 'Automatic', desc: 'Filled by a rule, always up to date' },
              ].map(({ v, icon: Icon, title, desc }) => (
                <button
                  key={v}
                  onClick={() => setCfg({ mode: v })}
                  className={cx(
                    'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                    cfg.mode === v ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <span className={cx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cfg.mode === v ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500')}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-900">{title}</span>
                    <span className="block text-[11px] text-slate-500">{desc}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {cfg.mode === 'auto' && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">Rule</p>
                  <Dropdown
                    value={cfg.rule}
                    onChange={(v) => setCfg({ rule: v })}
                    minWidth={260}
                    options={AUTO_RULES.map((r) => ({ value: r.value, label: r.label, description: r.description }))}
                  />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1.5">Category</p>
                <Dropdown
                  value={cfg.category}
                  onChange={(v) => setCfg({ category: v })}
                  options={CATEGORIES.map((c) => ({ value: c, label: c === 'all' ? 'All categories' : c }))}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1.5">{isQuiz ? 'Per focus area' : 'Products to show'}</p>
                <Dropdown
                  value={String(cfg.limit)}
                  onChange={(v) => setCfg({ limit: Number(v) })}
                  options={(isQuiz ? [1, 2, 3, 4, 6] : [2, 3, 4, 6, 8, 9, 12, 16]).map((n) => ({ value: String(n), label: `${n} products` }))}
                />
              </div>
              {!isQuiz && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">Layout</p>
                  <div className="inline-flex w-full p-1 rounded-xl bg-slate-100 h-11">
                    {([3, 4] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => setCfg({ columns: n })}
                        className={cx('flex-1 rounded-lg text-xs font-medium', cfg.columns === n ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500')}
                      >
                        {n} per row
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={cx('flex items-end pb-2', cfg.mode === 'auto' ? 'col-span-2 lg:col-span-4' : 'col-span-2 lg:col-span-1')}>
                <Toggle size="sm" checked={cfg.hideOutOfStock} onChange={(v) => setCfg({ hideOutOfStock: v })} />
                <span className="ml-2 text-xs text-slate-600">Hide out-of-stock</span>
              </div>
            </div>
          </Card>

          {cfg.mode === 'manual' ? (
            <>
              {/* Ordered list */}
              <Card padded={false}>
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Products in {meta.label} <span className="text-slate-400 font-normal">({manual.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Drag ⋮⋮ or use the arrows to reorder. Top items show first.</p>
                  </div>
                  <div className="flex gap-2">
                    <Dropdown<AutoRule>
                      size="sm"
                      className="w-48"
                      minWidth={240}
                      align="right"
                      placeholder="✨ Auto-fill by…"
                      value={'' as AutoRule}
                      onChange={fillFromRule}
                      options={AUTO_RULES.map((r) => ({ value: r.value, label: r.label, description: r.description }))}
                    />
                    {manual.length > 0 && (
                      <Button size="sm" variant="ghost" icon={<X className="w-3.5 h-3.5" />} onClick={() => confirm(`Remove all products from ${meta.label}?`) && replaceWith([])}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {isQuiz && (
                  <div className="flex flex-wrap gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs text-slate-600">
                    Showing per focus area:
                    {quizCounts.map(({ c, n }) => (
                      <Badge key={c} tone={n ? 'emerald' : 'rose'}>
                        {c}: {n}
                      </Badge>
                    ))}
                  </div>
                )}

                {manual.length === 0 ? (
                  <EmptyState icon={<Plus className="w-5 h-5" />} title="No products in this section" description="Add products below, or auto-fill with bestsellers." />
                ) : (
                  <ol className="p-2">
                    {manual.map((p, i) => {
                      const why = reason(p);
                      const showDivider = !isQuiz && i > 0 && liveIds.has(manual[i - 1].id) && !liveIds.has(p.id) && why?.startsWith('Over');
                      return (
                        <React.Fragment key={p.id}>
                          {showDivider && (
                            <li className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-amber-700">
                              <span className="flex-1 h-px bg-amber-200" />
                              Below this line: not shown (limit {cfg.limit}) — raise the limit or move them up
                              <span className="flex-1 h-px bg-amber-200" />
                            </li>
                          )}
                          <li
                            draggable
                            onDragStart={() => setDragIdx(i)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setOverIdx(i);
                            }}
                            onDragLeave={() => setOverIdx((o) => (o === i ? null : o))}
                            onDrop={() => {
                              if (dragIdx !== null) move(dragIdx, i);
                              setDragIdx(null);
                              setOverIdx(null);
                            }}
                            onDragEnd={() => {
                              setDragIdx(null);
                              setOverIdx(null);
                            }}
                            className={cx(
                              'group flex items-center gap-3 px-2 py-2 rounded-xl transition-all',
                              dragIdx === i && 'opacity-40',
                              overIdx === i && dragIdx !== i && 'ring-2 ring-emerald-500 bg-emerald-50/50',
                              why ? 'opacity-60' : 'hover:bg-slate-50'
                            )}
                          >
                            <GripVertical className="w-4 h-4 text-slate-300 cursor-grab active:cursor-grabbing shrink-0" />
                            <span
                              className={cx(
                                'w-6 h-6 rounded-md text-[11px] font-semibold flex items-center justify-center tabular-nums shrink-0',
                                why ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white'
                              )}
                            >
                              {i + 1}
                            </span>
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              <Image src={withBasePath(p.image)} alt="" fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                              <p className="text-xs text-slate-500">
                                {p.category} · ₹{p.price} · {sales[p.id] || 0} sold
                              </p>
                            </div>
                            {why ? <Badge tone="amber">{why}</Badge> : <Badge tone="emerald"><Check className="w-3 h-3" />Live</Badge>}
                            <div className="flex items-center opacity-60 group-hover:opacity-100">
                              <IconButton title="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="disabled:opacity-30">
                                <ArrowUp className="w-3.5 h-3.5" />
                              </IconButton>
                              <IconButton title="Move down" disabled={i === manual.length - 1} onClick={() => move(i, i + 1)} className="disabled:opacity-30">
                                <ArrowDown className="w-3.5 h-3.5" />
                              </IconButton>
                              <IconButton title="Move to top" disabled={i === 0} onClick={() => move(i, 0)} className="disabled:opacity-30 text-[10px] font-bold">
                                TOP
                              </IconButton>
                              <IconButton tone="danger" title="Remove from section" onClick={() => remove(p)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </IconButton>
                            </div>
                          </li>
                        </React.Fragment>
                      );
                    })}
                  </ol>
                )}
              </Card>

              {/* Picker */}
              <Card padded={false}>
                <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 flex-1">Add products</h3>
                  <div className="relative sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={pickerQuery}
                      onChange={(e) => setPickerQuery(e.target.value)}
                      placeholder="Search…"
                      className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>
                  <Dropdown size="sm" className="sm:w-40" value={pickerCat} onChange={setPickerCat} options={CATEGORIES.map((c) => ({ value: c, label: c === 'all' ? 'All categories' : c }))} />
                </div>
                {pickable.length === 0 ? (
                  <p className="px-5 py-8 text-center text-xs text-slate-400">Every matching product is already in this section.</p>
                ) : (
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[420px] overflow-y-auto custom-scrollbar">
                    {pickable.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => add(p)}
                        className="group relative text-left rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md overflow-hidden transition-all"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          <Image src={withBasePath(p.image)} alt="" fill className="object-cover" />
                          <span className="absolute inset-0 bg-emerald-700/0 group-hover:bg-emerald-700/70 flex items-center justify-center transition-colors">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold flex items-center gap-1">
                              <Plus className="w-4 h-4" /> Add
                            </span>
                          </span>
                          {p.isVisible === false && <span className="absolute top-1.5 left-1.5"><Badge tone="amber">Hidden</Badge></span>}
                          {isOutOfStock(p) && <span className="absolute top-1.5 right-1.5"><Badge tone="rose">Out</Badge></span>}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-slate-800 line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-slate-500">₹{p.price} · {p.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card padded={false}>
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Auto-selected right now</h3>
                  <p className="text-xs text-slate-500">
                    {AUTO_RULES.find((r) => r.value === cfg.rule)?.description}
                    {cfg.category !== 'all' && ` · ${cfg.category} only`} — updates by itself as orders and products change.
                  </p>
                </div>
                <Button size="sm" icon={<Wand2 className="w-3.5 h-3.5" />} onClick={() => replaceWith(autoShown.map((p) => p.id), 'manual')}>
                  Customize this list
                </Button>
              </div>
              {autoShown.length === 0 ? (
                <EmptyState title="No products match this rule" description="Try another category or turn off “Hide out-of-stock”." />
              ) : (
                <ol className="p-2">
                  {autoShown.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50">
                      <span className="w-6 h-6 rounded-md bg-violet-600 text-white text-[11px] font-semibold flex items-center justify-center tabular-nums">{i + 1}</span>
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <Image src={withBasePath(p.image)} alt="" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.category} · ₹{p.price}
                        </p>
                      </div>
                      <Badge tone="violet">{metric(p, cfg.rule)}</Badge>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          )}
        </div>

        {/* Live preview */}
        <div className="2xl:sticky 2xl:top-20 h-fit min-w-0">
          <Card padded={false} className="overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
              <span className="flex-1 text-xs font-medium text-slate-600">Live home page · {meta.label}</span>
              <button onClick={() => setDevice('desktop')} className={cx('p-1.5 rounded-md', device === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400')}>
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setDevice('mobile')} className={cx('p-1.5 rounded-md', device === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400')}>
                <Smartphone className="w-4 h-4" />
              </button>
              <button onClick={scrollPreview} className="p-1.5 rounded-md text-slate-400 hover:text-slate-900" title="Jump to section">
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-100 flex justify-center">
              {sectionOn ? (
                <iframe
                  ref={iframeRef}
                  src={withBasePath('/')}
                  onLoad={() => setTimeout(scrollPreview, 400)}
                  title="Home preview"
                  className={cx('bg-white', device === 'mobile' ? 'w-[390px] my-4 rounded-2xl shadow-lg' : 'w-full')}
                  style={{ height: 680 }}
                />
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center p-6">
                  <p className="text-sm font-medium text-slate-700">This section is switched off</p>
                  <p className="text-xs text-slate-500 mt-1 mb-3">Turn on “Show section” to display it on the home page.</p>
                  <Button size="sm" onClick={() => updateSiteSettings({ sections: { ...siteSettings.sections, [meta.sectionKey]: true } }, { silent: true })}>
                    Turn on
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
