'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { Product, ProductPlacement } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import { PLACEMENT_OPTIONS, getPlacements, isOutOfStock, productHref, downloadCSV } from '@/lib/storeUtils';
import { Badge, Button, Card, EmptyState, IconButton, PageHeader, SegmentedTabs, Toggle, cx } from './ui';
import { ProductForm } from './ProductForm';
import { Copy, Download, Edit2, ExternalLink, LayoutGrid, List, Package, Plus, Search, Trash2, X } from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const { products, updateProduct, deleteProduct, duplicateProduct, siteSettings } = useStore();
  const [view, setView] = useState<'list' | 'pages'>('list');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [placement, setPlacement] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('order');
  const [editing, setEditing] = useState<{ product: Product | null; isNew: boolean } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (q && !`${p.name} ${p.tamilName} ${p.sku ?? ''} ${p.id}`.toLowerCase().includes(q)) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (placement !== 'all' && !getPlacements(p).includes(placement as ProductPlacement)) return false;
      if (status === 'live' && p.isVisible === false) return false;
      if (status === 'hidden' && p.isVisible !== false) return false;
      if (status === 'out' && !isOutOfStock(p)) return false;
      if (status === 'low' && !(typeof p.stock === 'number' && p.stock <= siteSettings.lowStockThreshold)) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'stock') return (a.stock ?? 9999) - (b.stock ?? 9999);
      if (sort === 'newest') return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
      return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
    });
  }, [products, query, category, placement, status, sort, siteSettings.lowStockThreshold]);

  const counts = {
    all: products.length,
    live: products.filter((p) => p.isVisible !== false).length,
    hidden: products.filter((p) => p.isVisible === false).length,
    out: products.filter(isOutOfStock).length,
  };

  const exportCSV = () =>
    downloadCSV('products.csv', [
      ['ID', 'SKU', 'Name', 'Category', 'Format', 'Price', 'MRP', 'Sizes', 'Stock', 'Visible', 'Placements'],
      ...products.map((p) => [
        p.id,
        p.sku || '',
        p.name,
        p.category,
        p.format,
        p.price,
        p.mrp,
        p.sizeOptions.map((s) => `${s.label}:${s.price}`).join('; '),
        p.stock ?? '',
        p.isVisible === false ? 'No' : 'Yes',
        getPlacements(p).join('; '),
      ]),
    ]);

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Products"
        subtitle={`${counts.live} live · ${counts.hidden} hidden · ${counts.out} out of stock`}
        actions={
          <>
            <div className="inline-flex p-1 rounded-xl bg-slate-100">
              {[
                { v: 'list', label: 'List', icon: List },
                { v: 'pages', label: 'By page', icon: LayoutGrid },
              ].map(({ v, label, icon: Icon }) => (
                <button
                  key={v}
                  onClick={() => setView(v as 'list' | 'pages')}
                  className={cx('h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5', view === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500')}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <Button icon={<Download className="w-4 h-4" />} onClick={exportCSV}>
              Export
            </Button>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setEditing({ product: null, isNew: true })}>
              Add product
            </Button>
          </>
        }
      />

      {view === 'pages' ? (
        <PlacementBoard onEdit={(p) => setEditing({ product: p, isNew: false })} />
      ) : (
        <Card padded={false}>
          <div className="p-4 border-b border-slate-100 space-y-3">
            <SegmentedTabs
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All', count: counts.all },
                { value: 'live', label: 'Live', count: counts.live },
                { value: 'hidden', label: 'Hidden', count: counts.hidden },
                { value: 'out', label: 'Out of stock', count: counts.out },
                { value: 'low', label: 'Low stock' },
              ]}
            />
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, Tamil name, SKU…"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>
              <Dropdown
                className="lg:w-44"
                value={category}
                onChange={setCategory}
                options={[
                  { value: 'all', label: 'All categories' },
                  ...['Hair Care', 'Face Care', 'Skin & Body'].map((c) => ({ value: c, label: c, hint: String(products.filter((p) => p.category === c).length) })),
                ]}
              />
              <Dropdown
                className="lg:w-52"
                value={placement}
                onChange={setPlacement}
                minWidth={260}
                options={[
                  { value: 'all', label: 'Any page' },
                  ...PLACEMENT_OPTIONS.map((o) => ({
                    value: o.id,
                    label: `${o.page} → ${o.label}`,
                    description: o.description,
                    hint: String(products.filter((p) => getPlacements(p).includes(o.id)).length),
                  })),
                ]}
              />
              <Dropdown
                className="lg:w-44"
                value={sort}
                onChange={setSort}
                options={[
                  { value: 'order', label: 'Display order' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'name', label: 'Name A → Z' },
                  { value: 'price-high', label: 'Price high → low' },
                  { value: 'price-low', label: 'Price low → high' },
                  { value: 'stock', label: 'Lowest stock' },
                ]}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<Package className="w-5 h-5" />} title="No products match" action={<Button onClick={() => setEditing({ product: null, isNew: true })}>Add product</Button>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-3 py-3 font-semibold">Price</th>
                    <th className="px-3 py-3 font-semibold">Stock</th>
                    <th className="px-3 py-3 font-semibold">Shown on</th>
                    <th className="px-3 py-3 font-semibold">Live</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => {
                    const pl = getPlacements(p);
                    const low = typeof p.stock === 'number' && p.stock <= siteSettings.lowStockThreshold;
                    return (
                      <tr key={p.id} className={cx('hover:bg-slate-50/60', p.isVisible === false && 'opacity-60')}>
                        <td className="px-4 py-3">
                          <button onClick={() => setEditing({ product: p, isNew: false })} className="flex items-center gap-3 text-left">
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <Image src={withBasePath(p.image)} alt={p.name} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate max-w-[260px] hover:text-emerald-800">{p.name}</p>
                              <p className="text-xs text-slate-500">
                                {p.category} · {p.format}
                                {p.sku && <span className="text-slate-400"> · {p.sku}</span>}
                              </p>
                            </div>
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-900 tabular-nums">₹{p.price}</p>
                          <p className="text-[11px] text-slate-400">
                            <span className="line-through">₹{p.mrp}</span> · {p.sizeOptions.length} size{p.sizeOptions.length > 1 ? 's' : ''}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={p.stock ?? ''}
                              onChange={(e) => updateProduct(p.id, { stock: e.target.value === '' ? undefined : Number(e.target.value) }, { silent: true })}
                              className={cx(
                                'w-16 h-8 px-2 rounded-lg border text-sm tabular-nums outline-none focus:border-emerald-600',
                                isOutOfStock(p) ? 'border-rose-200 bg-rose-50 text-rose-700' : low ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200'
                              )}
                            />
                            {isOutOfStock(p) && <Badge tone="rose">Out</Badge>}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {pl.length === 0 && <span className="text-xs text-slate-400">Nowhere</span>}
                            {PLACEMENT_OPTIONS.filter((o) => pl.includes(o.id)).map((o) => (
                              <Badge key={o.id} tone={o.page === 'Home' ? 'emerald' : o.page === 'Shop' ? 'sky' : 'slate'}>
                                {o.label}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Toggle size="sm" checked={p.isVisible !== false} onChange={(v) => updateProduct(p.id, { isVisible: v }, { silent: true })} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <IconButton title="Edit" onClick={() => setEditing({ product: p, isNew: false })}>
                              <Edit2 className="w-4 h-4" />
                            </IconButton>
                            <IconButton title="Duplicate" onClick={() => duplicateProduct(p.id)}>
                              <Copy className="w-4 h-4" />
                            </IconButton>
                            <Link href={productHref(p.id)} target="_blank">
                              <IconButton title="View on store">
                                <ExternalLink className="w-4 h-4" />
                              </IconButton>
                            </Link>
                            <IconButton
                              tone="danger"
                              title="Delete"
                              onClick={() => confirm(`Delete "${p.name}"? This cannot be undone.`) && deleteProduct(p.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {editing && <ProductForm key={editing.product?.id ?? 'new'} product={editing.product} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </div>
  );
};

// Page-by-page view: what appears where, with quick add/remove
const PlacementBoard: React.FC<{ onEdit: (p: Product) => void }> = ({ onEdit }) => {
  const { products, updateProduct, triggerToast } = useStore();

  const setPlaced = (p: Product, id: ProductPlacement, on: boolean) => {
    const current = getPlacements(p);
    updateProduct(p.id, { placements: on ? Array.from(new Set([...current, id])) : current.filter((x) => x !== id) }, { silent: true });
    triggerToast(`${on ? 'Added to' : 'Removed from'} ${PLACEMENT_OPTIONS.find((o) => o.id === id)?.label}`, 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {PLACEMENT_OPTIONS.map((o) => {
        const assigned = products
          .filter((p) => getPlacements(p).includes(o.id))
          .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
        const available = products.filter((p) => !getPlacements(p).includes(o.id));
        return (
          <Card key={o.id} padded={false}>
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{o.page} page</p>
                <h3 className="text-sm font-semibold text-slate-900">{o.label}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{o.description}</p>
              </div>
              <Badge tone="emerald">{assigned.filter((p) => p.isVisible !== false).length} live</Badge>
            </div>
            <div className="p-3 space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
              {assigned.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No products here yet</p>}
              {assigned.map((p) => (
                <div key={p.id} className={cx('flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50', p.isVisible === false && 'opacity-50')}>
                  <div className="relative w-8 h-8 rounded-md overflow-hidden bg-slate-100 shrink-0">
                    <Image src={withBasePath(p.image)} alt="" fill className="object-cover" />
                  </div>
                  <button onClick={() => onEdit(p)} className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400">
                      #{p.sortOrder ?? '–'} · ₹{p.price}
                      {p.isVisible === false && ' · hidden'}
                    </p>
                  </button>
                  <IconButton title="Remove from this page" tone="danger" onClick={() => setPlaced(p, o.id, false)}>
                    <X className="w-3.5 h-3.5" />
                  </IconButton>
                </div>
              ))}
            </div>
            {available.length > 0 && (
              <div className="px-3 pb-3">
                <Dropdown
                  size="sm"
                  placeholder="+ Add a product to this page"
                  value=""
                  searchable
                  onChange={(id) => {
                    const p = products.find((x) => x.id === id);
                    if (p) setPlaced(p, o.id, true);
                  }}
                  options={available.map((p) => ({ value: p.id, label: p.name, hint: p.category }))}
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
