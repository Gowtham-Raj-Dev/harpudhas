'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { BannerTargetPage, OfferBanner } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import { readImageFile } from '@/lib/storeUtils';
import { Badge, Button, Card, Collapsible, Drawer, EmptyState, Field, IconButton, Input, PageHeader, SegmentedTabs, Textarea, Toggle } from './ui';
import { Edit2, ImageIcon, Megaphone, MousePointerClick, Plus, Trash2, Type, Upload } from 'lucide-react';

const TARGETS: { value: BannerTargetPage; label: string; description: string }[] = [
  { value: 'home', label: 'Home — hero slider', description: 'Full-width slide in the home page carousel' },
  { value: 'shop', label: 'Shop — offer strip', description: 'Promo strip above the shop catalog' },
  { value: 'product', label: 'Product pages — offer strip', description: 'Promo strip on every product page' },
  { value: 'all', label: 'Everywhere', description: 'Home slider + shop + product pages' },
];

const LINKS = [
  { value: '/shop', label: 'Shop — all products' },
  { value: '/shop?category=Hair Care', label: 'Shop — Hair Care' },
  { value: '/shop?category=Face Care', label: 'Shop — Face Care' },
  { value: '/shop?category=Skin & Body', label: 'Shop — Skin & Body' },
  { value: '/about', label: 'Our Story' },
  { value: '/contact', label: 'Contact' },
  { value: '__custom', label: 'Custom link…' },
];

const GRADIENTS = [
  { value: 'from-emerald-900 to-teal-900', label: 'Forest' },
  { value: 'from-amber-800 to-orange-900', label: 'Saffron' },
  { value: 'from-rose-900 to-pink-900', label: 'Rose' },
  { value: 'from-slate-900 to-slate-700', label: 'Charcoal' },
  { value: 'from-violet-900 to-indigo-900', label: 'Indigo' },
];

const blank = (): OfferBanner => ({
  id: '',
  title: '',
  subtitle: '',
  badge: 'Limited Offer',
  discountCode: '',
  buttonText: 'Shop Now',
  buttonLink: '/shop',
  imageUrl: '/images/hero-banner.jpg',
  bgGradient: GRADIENTS[0].value,
  targetPage: 'home',
  isActive: true,
});

export const BannersTab: React.FC = () => {
  const { banners, toggleBanner, deleteBanner } = useStore();
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState<OfferBanner | null>(null);

  const list = banners.filter((b) => filter === 'all' || (filter === 'active' ? b.isActive : filter === 'off' ? !b.isActive : b.targetPage === filter));

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Banners & offers"
        subtitle="Hero slides on the home page and offer strips on shop / product pages. Toggles apply live."
        actions={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setEditing(blank())}>
            New banner
          </Button>
        }
      />
      <div className="mb-4">
        <SegmentedTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: banners.length },
            { value: 'active', label: 'Active', count: banners.filter((b) => b.isActive).length },
            { value: 'off', label: 'Off', count: banners.filter((b) => !b.isActive).length },
            { value: 'home', label: 'Home' },
            { value: 'shop', label: 'Shop' },
            { value: 'product', label: 'Product' },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={<Megaphone className="w-5 h-5" />} title="No banners here" action={<Button onClick={() => setEditing(blank())}>Create one</Button>} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {list.map((b) => (
            <Card key={b.id} padded={false} className={b.isActive ? '' : 'opacity-70'}>
              <div className="relative h-44 rounded-t-2xl overflow-hidden">
                <Image src={withBasePath(b.imageUrl || '/images/hero-banner.jpg')} alt={b.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                  {b.badge && <span className="w-fit mb-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold uppercase tracking-wider">{b.badge}</span>}
                  <h3 className="font-serif text-xl font-semibold leading-tight line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-white/70 line-clamp-1 mt-1">{b.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Toggle checked={b.isActive} onChange={(v) => toggleBanner(b.id, v)} size="sm" />
                <span className="text-xs font-medium text-slate-700">{b.isActive ? 'Live' : 'Off'}</span>
                <Badge tone="sky">{TARGETS.find((t) => t.value === b.targetPage)?.label}</Badge>
                {b.discountCode && <Badge tone="amber">{b.discountCode}</Badge>}
                <div className="ml-auto flex gap-0.5">
                  <IconButton title="Edit" onClick={() => setEditing(b)}>
                    <Edit2 className="w-4 h-4" />
                  </IconButton>
                  <IconButton tone="danger" title="Delete" onClick={() => confirm(`Delete "${b.title}"?`) && deleteBanner(b.id)}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <BannerForm key={editing.id || 'new'} banner={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};

const BannerForm: React.FC<{ banner: OfferBanner; onClose: () => void }> = ({ banner, onClose }) => {
  const { addBanner, updateBanner, triggerToast } = useStore();
  const [b, setB] = useState<OfferBanner>(banner);
  const isNew = !banner.id;
  const set = <K extends keyof OfferBanner>(k: K, v: OfferBanner[K]) => setB((prev) => ({ ...prev, [k]: v }));
  const linkIsPreset = LINKS.some((l) => l.value === b.buttonLink);

  const save = () => {
    if (!b.title.trim()) {
      triggerToast('Banner title is required', 'error');
      return;
    }
    const payload = { ...b, title: b.title.trim(), discountCode: b.discountCode?.trim().toUpperCase() || undefined };
    if (isNew) addBanner({ ...payload, id: `banner-${Date.now()}` });
    else updateBanner(b.id, payload);
    onClose();
  };

  return (
    <Drawer
      open
      onClose={onClose}
      width="max-w-3xl"
      title={isNew ? 'New banner' : 'Edit banner'}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>
            {isNew ? 'Create banner' : 'Save banner'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Preview */}
        <div className="relative h-52 rounded-2xl overflow-hidden">
          {b.targetPage === 'home' || b.targetPage === 'all' ? (
            <>
              <Image src={withBasePath(b.imageUrl || '/images/hero-banner.jpg')} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-r ${b.bgGradient || GRADIENTS[0].value}`} />
          )}
          <div className="absolute inset-0 p-6 flex flex-col justify-center text-white max-w-lg">
            {b.badge && <span className="w-fit mb-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold uppercase tracking-wider">{b.badge}</span>}
            <h3 className="font-serif text-2xl font-semibold leading-tight">{b.title || 'Banner title'}</h3>
            <p className="text-xs text-white/75 mt-1 line-clamp-2">{b.subtitle}</p>
            <span className="mt-3 w-fit px-4 py-1.5 rounded-full bg-amber-400 text-slate-900 text-xs font-semibold">{b.buttonText} →</span>
          </div>
        </div>

        <Card className="flex flex-col sm:flex-row gap-4">
          <Field label="Where to show" className="flex-1">
            <Dropdown
              value={b.targetPage}
              onChange={(v) => set('targetPage', v)}
              options={TARGETS.map((t) => ({ value: t.value, label: t.label, description: t.description }))}
              minWidth={300}
            />
          </Field>
          <div className="sm:w-48 sm:pt-6">
            <Toggle checked={b.isActive} onChange={(v) => set('isActive', v)} label="Active" description="Show on the store" />
          </div>
        </Card>

        <Collapsible defaultOpen icon={<Type className="w-4 h-4" />} title="Text" subtitle={b.title || 'Title, subtitle, badge, promo code'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Field label="Title" required className="sm:col-span-2">
              <Input value={b.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Subtitle" className="sm:col-span-2">
              <Textarea rows={2} value={b.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
            </Field>
            <Field label="Badge">
              <Input value={b.badge || ''} onChange={(e) => set('badge', e.target.value)} />
            </Field>
            <Field label="Promo code" hint="Shown as a copyable chip">
              <Input value={b.discountCode || ''} onChange={(e) => set('discountCode', e.target.value.toUpperCase())} placeholder="HARPUDHAS15" />
            </Field>
          </div>
        </Collapsible>

        <Collapsible icon={<MousePointerClick className="w-4 h-4" />} title="Button" subtitle={`${b.buttonText} → ${b.buttonLink}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Field label="Button text">
              <Input value={b.buttonText} onChange={(e) => set('buttonText', e.target.value)} />
            </Field>
            <Field label="Button goes to">
              <Dropdown value={linkIsPreset ? b.buttonLink : '__custom'} onChange={(v) => set('buttonLink', v === '__custom' ? '/' : v)} options={LINKS} />
            </Field>
            {!linkIsPreset && (
              <Field label="Custom link" className="sm:col-span-2">
                <Input value={b.buttonLink} onChange={(e) => set('buttonLink', e.target.value)} placeholder="/product/hair-oil-1" />
              </Field>
            )}
          </div>
        </Collapsible>

        <Collapsible icon={<ImageIcon className="w-4 h-4" />} title="Image & colour" subtitle="Hero image (home) or background colour (strips)">
          <div className="space-y-4 pt-4">
            <label className="flex items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-500 cursor-pointer text-sm text-slate-600">
              <Upload className="w-4 h-4" /> Upload hero image (under 3MB, wide 16:9 works best)
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    set('imageUrl', await readImageFile(f, 3));
                  } catch (err) {
                    triggerToast((err as Error).message, 'error');
                  }
                }}
              />
            </label>
            <Field label="…or image URL">
              <Input value={b.imageUrl?.startsWith('data:') ? '' : b.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} placeholder="/images/hero-banner.jpg" />
            </Field>
            <Field label="Strip background (shop / product pages)">
              <Dropdown value={b.bgGradient || GRADIENTS[0].value} onChange={(v) => set('bgGradient', v)} options={GRADIENTS} />
            </Field>
          </div>
        </Collapsible>
      </div>
    </Drawer>
  );
};
