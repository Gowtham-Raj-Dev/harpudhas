'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { CategoryType, FormatType, HomeSectionId, Product, ProductPlacement } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import { ProductCard } from '@/components/ProductCard';
import { DEFAULT_PLACEMENTS, PLACEMENT_OPTIONS, readImageFile } from '@/lib/storeUtils';
import { Badge, Button, Collapsible, Drawer, Field, Input, Textarea, Toggle, cx } from './ui';
import { Check, Eye, FileText, ImageIcon, IndianRupee, LayoutGrid, Plus, Tag, Trash2, Upload, X, Star } from 'lucide-react';

const CATEGORY_OPTIONS: CategoryType[] = ['Hair Care', 'Face Care', 'Skin & Body'];
const FORMAT_OPTIONS: FormatType[] = ['Oil & Serum', 'Shampoo & Cleanser', 'Cream & Butter', 'Mask & Soap'];
const BADGE_OPTIONS = ['Bestseller', 'New Launch', 'Limited Edition', 'Sulfate-Free', 'Signature', 'Bridal Glow', 'Organic', 'Gift Pick', 'Botanical'];
const IMAGE_LIBRARY = [
  '/images/hair-oil.jpg',
  '/images/hair-shampoo.jpg',
  '/images/hair-serum.jpg',
  '/images/face-cream.jpg',
  '/images/face-wash.jpg',
  '/images/face-pack.jpg',
  '/images/body-butter.jpg',
  '/images/body-lotion.jpg',
  '/images/body-soap.jpg',
  '/images/hero-banner.jpg',
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);

export const blankProduct = (): Product => ({
  id: '',
  name: '',
  tamilName: '',
  category: 'Hair Care',
  format: 'Oil & Serum',
  price: 499,
  mrp: 649,
  sizeOptions: [{ label: '100 ml', price: 499 }],
  rating: 4.8,
  reviews: 0,
  badge: 'New Launch',
  image: '/images/hair-oil.jpg',
  shortDesc: '',
  ingredients: [],
  ritual: '',
  inStock: true,
  isVisible: true,
  placements: [...DEFAULT_PLACEMENTS, 'home-new'],
  stock: 50,
  sku: '',
  sortOrder: 1,
});

export const ProductForm: React.FC<{ product: Product | null; isNew: boolean; onClose: () => void }> = ({ product, isNew, onClose }) => {
  const { products, addProduct, updateProduct, triggerToast, siteSettings } = useStore();
  const [p, setP] = useState<Product>(() => ({ ...blankProduct(), ...(product || {}), placements: product?.placements ?? (isNew ? blankProduct().placements : DEFAULT_PLACEMENTS) }));
  const [ingredientDraft, setIngredientDraft] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }));
  const placements = p.placements ?? [];
  const togglePlacement = (id: ProductPlacement) =>
    set('placements', placements.includes(id) ? placements.filter((x) => x !== id) : [...placements, id]);

  const setSize = (i: number, patch: Partial<{ label: string; price: number }>) =>
    set(
      'sizeOptions',
      p.sizeOptions.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );

  const addIngredient = () => {
    const parts = ingredientDraft.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) set('ingredients', [...p.ingredients, ...parts.filter((x) => !p.ingredients.includes(x))]);
    setIngredientDraft('');
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      set('image', await readImageFile(file, 2));
      triggerToast('Image uploaded');
    } catch (err) {
      triggerToast((err as Error).message, 'error');
    }
    e.target.value = '';
  };

  const save = () => {
    const errs: Record<string, string> = {};
    if (!p.name.trim()) errs.name = 'Product name is required';
    if (!p.sizeOptions.length || p.sizeOptions.some((s) => !s.label.trim() || !(s.price > 0))) errs.sizes = 'Every size needs a label and a price';
    if (p.mrp < (p.sizeOptions[0]?.price ?? 0)) errs.mrp = 'MRP should be ≥ the first size price';
    const id = isNew ? p.id.trim() || slugify(p.name) || `product-${Date.now()}` : p.id;
    if (isNew && products.some((x) => x.id === id)) errs.id = 'This URL slug is already used by another product';
    setErrors(errs);
    if (Object.keys(errs).length) {
      triggerToast(Object.values(errs)[0], 'error');
      return;
    }
    const payload: Product = {
      ...p,
      id,
      name: p.name.trim(),
      tamilName: p.tamilName.trim(),
      price: p.sizeOptions[0].price,
      inStock: p.inStock !== false && (p.stock ?? 1) > 0,
    };
    if (isNew) addProduct(payload);
    else updateProduct(p.id, payload);
    onClose();
  };

  const off = p.mrp > (p.sizeOptions[0]?.price ?? 0) ? Math.round(((p.mrp - p.sizeOptions[0].price) / p.mrp) * 100) : 0;
  const previewProduct: Product = { ...p, name: p.name || 'Product name', price: p.sizeOptions[0]?.price ?? 0 };

  return (
    <Drawer
      open
      onClose={onClose}
      width="max-w-6xl"
      title={isNew ? 'Add new product' : `Edit · ${product?.name}`}
      subtitle={isNew ? 'Fill each section — open one at a time' : `ID: ${p.id}`}
      footer={
        <>
          <span className="mr-auto text-xs text-slate-500">
            {p.isVisible === false ? 'Saved as hidden draft' : `Will appear in ${placements.length} place${placements.length === 1 ? '' : 's'}`}
          </span>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={<Check className="w-4 h-4" />} onClick={save}>
            {isNew ? 'Create product' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-3">
          {/* 1. Basic */}
          <Collapsible
            defaultOpen
            icon={<FileText className="w-4 h-4" />}
            title="Basic information"
            subtitle={p.name ? `${p.name} · ${p.category}` : 'Name, category, format & badge'}
            badge={errors.name || errors.id ? <Badge tone="rose">Fix</Badge> : null}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Field label="Product name" required className="sm:col-span-2">
                <Input
                  value={p.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Hibiscus Root-Revive Hair Oil"
                  className={errors.name ? 'border-rose-300' : ''}
                />
              </Field>
              <Field label="Tamil name" className="sm:col-span-2">
                <Input value={p.tamilName} onChange={(e) => set('tamilName', e.target.value)} placeholder="செம்பருத்தி கூந்தல் தைலம்" />
              </Field>
              <Field label="Category" required>
                <Dropdown value={p.category} onChange={(v) => set('category', v)} options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))} />
              </Field>
              <Field label="Format" required>
                <Dropdown value={p.format} onChange={(v) => set('format', v)} options={FORMAT_OPTIONS.map((c) => ({ value: c, label: c }))} />
              </Field>
              <Field label="Badge">
                <Dropdown
                  value={BADGE_OPTIONS.includes(p.badge) ? p.badge : '__custom'}
                  onChange={(v) => set('badge', v === '__custom' ? '' : v)}
                  options={[...BADGE_OPTIONS.map((b) => ({ value: b, label: b })), { value: '__custom', label: 'Custom text…' }]}
                />
              </Field>
              <Field label="Badge text">
                <Input value={p.badge} onChange={(e) => set('badge', e.target.value)} placeholder="Shown on the card" />
              </Field>
              <Field label="SKU">
                <Input value={p.sku || ''} onChange={(e) => set('sku', e.target.value)} placeholder="HRP-HAIR-OIL" />
              </Field>
              <Field label="URL slug" hint={isNew ? 'Leave empty to generate from the name' : 'Cannot change after creation'}>
                <Input
                  value={isNew ? p.id : p.id}
                  disabled={!isNew}
                  onChange={(e) => set('id', slugify(e.target.value))}
                  placeholder={slugify(p.name) || 'auto'}
                  className={cx(!isNew && 'bg-slate-50 text-slate-500', errors.id && 'border-rose-300')}
                />
              </Field>
            </div>
          </Collapsible>

          {/* 2. Pricing */}
          <Collapsible
            icon={<IndianRupee className="w-4 h-4" />}
            title="Pricing & sizes"
            subtitle={`${p.sizeOptions.length} size${p.sizeOptions.length === 1 ? '' : 's'} · from ₹${p.sizeOptions[0]?.price ?? 0}${off ? ` · ${off}% off MRP` : ''}`}
            badge={errors.sizes || errors.mrp ? <Badge tone="rose">Fix</Badge> : null}
          >
            <div className="pt-4 space-y-4">
              <Field label="MRP (₹)" hint="Shown struck-through. The first size price is the selling price.">
                <Input type="number" min={0} value={p.mrp} onChange={(e) => set('mrp', Number(e.target.value))} className={cx('max-w-[200px]', errors.mrp && 'border-rose-300')} />
              </Field>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Sizes / variants</p>
                <div className="space-y-2">
                  {p.sizeOptions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-xs text-slate-400 text-center">{i + 1}</span>
                      <Input value={s.label} onChange={(e) => setSize(i, { label: e.target.value })} placeholder="100 ml" className="flex-1" />
                      <div className="relative w-36">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                        <Input type="number" min={0} value={s.price} onChange={(e) => setSize(i, { price: Number(e.target.value) })} className="pl-7" />
                      </div>
                      <button
                        type="button"
                        disabled={p.sizeOptions.length === 1}
                        onClick={() => set('sizeOptions', p.sizeOptions.filter((_, idx) => idx !== i))}
                        className="w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-3"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => set('sizeOptions', [...p.sizeOptions, { label: '', price: p.sizeOptions[p.sizeOptions.length - 1]?.price ?? 0 }])}
                >
                  Add size
                </Button>
              </div>
            </div>
          </Collapsible>

          {/* 3. Media */}
          <Collapsible icon={<ImageIcon className="w-4 h-4" />} title="Product image" subtitle={p.image.startsWith('data:') ? 'Uploaded image' : p.image}>
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image src={withBasePath(p.image)} alt="Preview" fill className="object-cover" />
              </div>
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center gap-1 h-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer text-center transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700">Upload from computer</span>
                  <span className="text-[11px] text-slate-400">JPG / PNG / WebP, under 2MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
                <Field label="…or image URL">
                  <Input value={p.image.startsWith('data:') ? '' : p.image} onChange={(e) => set('image', e.target.value)} placeholder="https://… or /images/…" />
                </Field>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">…or pick from library</p>
                  <div className="grid grid-cols-5 gap-2">
                    {IMAGE_LIBRARY.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => set('image', src)}
                        className={cx('relative aspect-square rounded-lg overflow-hidden ring-2 transition-all', p.image === src ? 'ring-emerald-600' : 'ring-transparent hover:ring-slate-300')}
                      >
                        <Image src={withBasePath(src)} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Collapsible>

          {/* 4. Description */}
          <Collapsible
            icon={<Tag className="w-4 h-4" />}
            title="Description & ingredients"
            subtitle={`${p.ingredients.length} ingredients${p.shortDesc ? ' · description added' : ' · no description yet'}`}
          >
            <div className="pt-4 space-y-4">
              <Field label="Short description" hint={`${p.shortDesc.length}/220 characters — shown on cards and the product page`}>
                <Textarea rows={3} maxLength={220} value={p.shortDesc} onChange={(e) => set('shortDesc', e.target.value)} />
              </Field>
              <Field label="Key ingredients" hint="Type and press Enter. Paste a comma-separated list to add several.">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {p.ingredients.map((ing) => (
                    <span key={ing} className="inline-flex items-center gap-1 pl-2.5 pr-1 h-7 rounded-full bg-emerald-50 text-emerald-800 text-xs">
                      {ing}
                      <button type="button" onClick={() => set('ingredients', p.ingredients.filter((x) => x !== ing))} className="w-5 h-5 rounded-full hover:bg-emerald-100 flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  value={ingredientDraft}
                  onChange={(e) => setIngredientDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addIngredient();
                    }
                  }}
                  onBlur={addIngredient}
                  placeholder="Fresh hibiscus, bhringraj…"
                />
              </Field>
              <Field label="How to use (ritual)">
                <Textarea rows={3} value={p.ritual} onChange={(e) => set('ritual', e.target.value)} />
              </Field>
            </div>
          </Collapsible>

          {/* 5. Placement */}
          <Collapsible
            defaultOpen
            icon={<LayoutGrid className="w-4 h-4" />}
            title="Visibility & where to show"
            subtitle={p.isVisible === false ? 'Hidden from the store' : `${placements.length} of ${PLACEMENT_OPTIONS.length} placements`}
            badge={p.isVisible === false ? <Badge tone="amber">Hidden</Badge> : <Badge tone="emerald">Live</Badge>}
          >
            <div className="pt-4 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50">
                <Toggle checked={p.isVisible !== false} onChange={(v) => set('isVisible', v)} label="Visible on store" description="Off = hidden everywhere (draft)" />
                <Toggle checked={p.inStock !== false} onChange={(v) => set('inStock', v)} label="Available to buy" description="Off = shows “Out of stock”" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600">Show this product on</p>
                  <div className="flex gap-3 text-xs">
                    <button type="button" className="text-emerald-700 font-medium" onClick={() => set('placements', PLACEMENT_OPTIONS.map((o) => o.id))}>
                      Select all
                    </button>
                    <button type="button" className="text-slate-500" onClick={() => set('placements', [])}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLACEMENT_OPTIONS.map((o) => {
                    const on = placements.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => togglePlacement(o.id)}
                        className={cx(
                          'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                          on ? 'border-emerald-600 bg-emerald-50/50 ring-4 ring-emerald-600/5' : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <span className={cx('mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0', on ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white')}>
                          {on && <Check className="w-3 h-3" />}
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-slate-900">
                            <span className="text-slate-400 font-normal">{o.page} →</span> {o.label}
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">{o.description}</span>
                          {o.id in siteSettings.homeProducts && siteSettings.homeProducts[o.id as HomeSectionId].mode === 'auto' && (
                            <span className="block text-[11px] text-violet-600 mt-0.5">Section is on Auto — this tick is ignored</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Stock quantity" hint="Reduces automatically on each order">
                  <Input type="number" min={0} value={p.stock ?? ''} onChange={(e) => set('stock', e.target.value === '' ? undefined : Number(e.target.value))} />
                </Field>
                <Field label="Display order" hint="Lower numbers show first">
                  <Input type="number" min={0} value={p.sortOrder ?? ''} onChange={(e) => set('sortOrder', e.target.value === '' ? undefined : Number(e.target.value))} />
                </Field>
              </div>
            </div>
          </Collapsible>

          {/* 6. Reviews */}
          <Collapsible icon={<Star className="w-4 h-4" />} title="Rating & reviews" subtitle={`★ ${p.rating} · ${p.reviews} reviews`}>
            <div className="pt-4 grid grid-cols-2 gap-4 max-w-md">
              <Field label="Rating (0–5)">
                <Input type="number" step={0.1} min={0} max={5} value={p.rating} onChange={(e) => set('rating', Math.min(5, Math.max(0, Number(e.target.value))))} />
              </Field>
              <Field label="Review count">
                <Input type="number" min={0} value={p.reviews} onChange={(e) => set('reviews', Number(e.target.value))} />
              </Field>
            </div>
          </Collapsible>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-0 h-fit space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Live card preview
          </p>
          <div className="pointer-events-none">
            <ProductCard product={previewProduct} preview />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PLACEMENT_OPTIONS.filter((o) => placements.includes(o.id)).map((o) => (
              <Badge key={o.id} tone="emerald">
                {o.page} · {o.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
