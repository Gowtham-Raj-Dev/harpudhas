'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { withBasePath } from '@/data/products';
import { FollowUpStatus, JourneyStage, SiteSettings, VisitorJourney } from '@/types/store';
import { Dropdown } from '@/components/ui/Dropdown';
import { DateFilter, downloadCSV, formatDateTime, formatINR, inDateRange, resolveDateRange } from '@/lib/storeUtils';
import { ENV_WEBHOOK_URL } from '@/lib/webhook';
import {
  FOLLOW_UP_OPTIONS,
  STAGES,
  fillTemplate,
  isAbandoned,
  stageMeta,
  stageRank,
  templateKeyFor,
  timeAgo,
  visitorName,
  waLink,
} from '@/lib/journey';
import { Badge, Button, Card, Collapsible, Drawer, EmptyState, Field, Input, PageHeader, SegmentedTabs, Textarea, cx } from './ui';
import { DateFilterBar } from './OrderParts';
import { AlertTriangle, Copy, Download, Megaphone, MessageCircle, Phone, Route, ShoppingCart, Trash2 } from 'lucide-react';

type Segment = 'all' | 'abandoned_phone' | 'abandoned_anon' | 'identified' | 'ordered' | 'contacted';

const TEMPLATE_LABELS: Record<keyof SiteSettings['followUpTemplates'], string> = {
  added_to_cart: 'Added to cart (abandoned)',
  checkout_started: 'Checkout started (abandoned)',
  details_entered: 'Details entered (abandoned)',
  ordered: 'After order (feedback / repeat)',
  general: 'General campaign',
};

const StagePill: React.FC<{ stage: JourneyStage }> = ({ stage }) => {
  const m = stageMeta(stage);
  return (
    <span className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap', m.pill)}>
      <span className={cx('w-1.5 h-1.5 rounded-full', m.color)} />
      {m.label}
    </span>
  );
};

export const JourneyTab: React.FC = () => {
  const { journeys, updateJourney, deleteJourney, siteSettings, updateSiteSettings, triggerToast } = useStore();
  const [dateFilter, setDateFilter] = useState<DateFilter>({ preset: '7d' });
  const [segment, setSegment] = useState<Segment>('all');
  const [stageFilter, setStageFilter] = useState<'all' | JourneyStage>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const storeUrl = typeof window !== 'undefined' ? `${window.location.origin}${withBasePath('/')}` : '';
  const coupon = siteSettings.followUpCoupon;
  const abandonMin = siteSettings.abandonAfterMinutes;

  const range = resolveDateRange(dateFilter);
  const inPeriod = useMemo(() => journeys.filter((j) => inDateRange(j.lastSeen, range)), [journeys, range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps

  const segmentOf = (j: VisitorJourney, s: Segment) => {
    switch (s) {
      case 'abandoned_phone':
        return isAbandoned(j, abandonMin) && !!j.phone;
      case 'abandoned_anon':
        return isAbandoned(j, abandonMin) && !j.phone;
      case 'identified':
        return !!j.phone;
      case 'ordered':
        return j.orderIds.length > 0;
      case 'contacted':
        return j.followUp.status !== 'new';
      default:
        return true;
    }
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inPeriod
      .filter((j) => segmentOf(j, segment))
      .filter((j) => stageFilter === 'all' || j.stage === stageFilter)
      .filter((j) => !q || `${j.fullName ?? ''} ${j.phone ?? ''} ${j.email ?? ''} ${j.city ?? ''} ${j.cart.map((c) => c.name).join(' ')}`.toLowerCase().includes(q))
      .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
  }, [inPeriod, segment, stageFilter, query, abandonMin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Funnel: how many visitors ever reached each stage
  const funnel = STAGES.map((s) => ({ ...s, count: inPeriod.filter((j) => j.reached[s.id] || stageRank(j.stage) >= stageRank(s.id)).length }));
  const visitors = Math.max(1, funnel[0].count);
  const abandonedValue = inPeriod.filter((j) => isAbandoned(j, abandonMin)).reduce((s, j) => s + j.cartValue, 0);
  const counts: Record<Segment, number> = {
    all: inPeriod.length,
    abandoned_phone: inPeriod.filter((j) => segmentOf(j, 'abandoned_phone')).length,
    abandoned_anon: inPeriod.filter((j) => segmentOf(j, 'abandoned_anon')).length,
    identified: inPeriod.filter((j) => segmentOf(j, 'identified')).length,
    ordered: inPeriod.filter((j) => segmentOf(j, 'ordered')).length,
    contacted: inPeriod.filter((j) => segmentOf(j, 'contacted')).length,
  };

  const markContacted = (j: VisitorJourney) =>
    updateJourney(j.id, {
      followUp: {
        ...j.followUp,
        status: j.followUp.status === 'converted' ? 'converted' : 'contacted',
        contactCount: j.followUp.contactCount + 1,
        lastContactedAt: new Date().toISOString(),
      },
    });

  const messageFor = (j: VisitorJourney, key = templateKeyFor(j)) => fillTemplate(siteSettings.followUpTemplates[key], j, coupon, storeUrl);

  const open = journeys.find((j) => j.id === openId) || null;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Customer journey"
        subtitle="See which stage every visitor reached — then follow up on WhatsApp or build a campaign."
      />

      {!ENV_WEBHOOK_URL && (
        <div className="mb-5 text-xs rounded-xl bg-amber-50 text-amber-900 px-4 py-3 flex gap-2.5 border border-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            This list shows journeys recorded <b>in this browser</b>. To collect journeys from customers&apos; own phones, set the{' '}
            <code className="font-mono">WEBHOOK_URL</code> repository variable (see Settings → Webhook) — every stage change is then sent as a{' '}
            <code className="font-mono">customer.stage_changed</code> event.
          </span>
        </div>
      )}

      <Card className="mb-5">
        <DateFilterBar value={dateFilter} onChange={setDateFilter} />
      </Card>

      {/* Funnel */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Conversion funnel</h3>
            <p className="text-xs text-slate-500">Visitors who reached each stage · click a stage to filter</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Left in abandoned carts</p>
            <p className="text-sm font-semibold text-rose-600 tabular-nums">{formatINR(abandonedValue)}</p>
          </div>
        </div>
        <div className="space-y-2">
          {funnel.map((s, i) => {
            const pct = Math.round((s.count / visitors) * 100);
            const step = i === 0 ? null : funnel[i - 1].count ? Math.round((s.count / funnel[i - 1].count) * 100) : 0;
            return (
              <button
                key={s.id}
                onClick={() => setStageFilter(stageFilter === s.id ? 'all' : s.id)}
                className={cx('w-full grid grid-cols-[130px_1fr_90px] items-center gap-3 group text-left rounded-lg px-1 py-0.5', stageFilter === s.id && 'bg-emerald-50')}
              >
                <span className="text-xs font-medium text-slate-700 truncate">{s.label}</span>
                <span className="relative h-7 rounded-md bg-slate-100 overflow-hidden">
                  <span className="absolute inset-y-0 left-0 rounded-md bg-emerald-600/80 group-hover:bg-emerald-600 transition-all" style={{ width: `${Math.max(pct, s.count ? 2 : 0)}%` }} />
                  <span className="absolute inset-0 flex items-center px-2.5 text-xs font-semibold text-slate-900 tabular-nums">{s.count}</span>
                </span>
                <span className="text-[11px] text-slate-500 text-right tabular-nums">
                  {pct}%{step !== null && <span className="block text-slate-400">{step}% from prev</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card padded={false} className="mb-5">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <SegmentedTabs
            value={segment}
            onChange={setSegment}
            options={[
              { value: 'all', label: 'All visitors', count: counts.all },
              { value: 'abandoned_phone', label: 'Abandoned · has phone', count: counts.abandoned_phone },
              { value: 'abandoned_anon', label: 'Abandoned · anonymous', count: counts.abandoned_anon },
              { value: 'identified', label: 'Identified', count: counts.identified },
              { value: 'ordered', label: 'Ordered', count: counts.ordered },
              { value: 'contacted', label: 'Followed up', count: counts.contacted },
            ]}
          />
          <div className="flex flex-col md:flex-row gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, city, cart product…"
              className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            />
            <Dropdown
              className="md:w-48"
              value={stageFilter}
              onChange={setStageFilter}
              options={[{ value: 'all', label: 'Any current stage' }, ...STAGES.map((s) => ({ value: s.id, label: s.label, dot: s.color }))]}
            />
            <Dropdown
              className="md:w-56"
              value={String(abandonMin)}
              onChange={(v) => updateSiteSettings({ abandonAfterMinutes: Number(v) }, { silent: true })}
              options={[15, 30, 60, 180, 720, 1440].map((m) => ({ value: String(m), label: `Abandoned after ${m < 60 ? `${m} min` : `${m / 60} hr`}` }))}
            />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState icon={<Route className="w-5 h-5" />} title="No visitors in this view" description="Journeys appear as people browse, add to cart and check out." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-3 font-semibold">Visitor</th>
                  <th className="px-3 py-3 font-semibold">Stage</th>
                  <th className="px-3 py-3 font-semibold">Cart</th>
                  <th className="px-3 py-3 font-semibold">Source</th>
                  <th className="px-3 py-3 font-semibold">Last seen</th>
                  <th className="px-3 py-3 font-semibold">Follow-up</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((j) => {
                  const abandoned = isAbandoned(j, abandonMin);
                  return (
                    <tr key={j.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <button onClick={() => setOpenId(j.id)} className="text-left">
                          <p className={cx('font-medium hover:text-emerald-800', j.phone ? 'text-slate-900' : 'text-slate-500')}>{visitorName(j)}</p>
                          <p className="text-xs text-slate-400">
                            {j.phone ? `${j.phone}${j.city ? ` · ${j.city}` : ''}` : `${j.pageViews} page views`}
                          </p>
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <StagePill stage={j.stage} />
                          {abandoned && <Badge tone="rose">Abandoned</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-3 max-w-[220px]">
                        {j.cart.length ? (
                          <>
                            <p className="font-semibold text-slate-900 tabular-nums">{formatINR(j.cartValue)}</p>
                            <p className="text-xs text-slate-500 truncate">{j.cart.map((c) => `${c.name} ×${c.qty}`).join(', ')}</p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">{j.orderIds.length ? `${j.orderIds.length} order(s)` : 'Empty'}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        {j.source}
                        <span className="block text-slate-400">{j.device}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{timeAgo(j.lastSeen)}</td>
                      <td className="px-3 py-3">
                        <Dropdown<FollowUpStatus>
                          size="sm"
                          className="w-36"
                          value={j.followUp.status}
                          onChange={(v) => updateJourney(j.id, { followUp: { ...j.followUp, status: v } })}
                          options={FOLLOW_UP_OPTIONS}
                        />
                      </td>
                      <td className="px-3 py-3">
                        {j.phone ? (
                          <a
                            href={waLink(j.phone, messageFor(j))}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => markContacted(j)}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Follow up
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">No phone yet</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CampaignBuilder journeys={inPeriod} segmentOf={segmentOf} messageFor={messageFor} markContacted={markContacted} />

      {open && (
        <JourneyDrawer
          journey={open}
          onClose={() => setOpenId(null)}
          messageFor={messageFor}
          markContacted={markContacted}
          onUpdate={(p) => updateJourney(open.id, p)}
          onDelete={() => {
            if (confirm('Delete this visitor journey?')) {
              deleteJourney(open.id);
              setOpenId(null);
              triggerToast('Journey deleted', 'info');
            }
          }}
        />
      )}
    </div>
  );
};

// ---------- Drawer ----------

const JourneyDrawer: React.FC<{
  journey: VisitorJourney;
  onClose: () => void;
  messageFor: (j: VisitorJourney, key?: keyof SiteSettings['followUpTemplates']) => string;
  markContacted: (j: VisitorJourney) => void;
  onUpdate: (p: Partial<VisitorJourney>) => void;
  onDelete: () => void;
}> = ({ journey: j, onClose, messageFor, markContacted, onUpdate, onDelete }) => {
  const [tplKey, setTplKey] = useState<keyof SiteSettings['followUpTemplates']>(templateKeyFor(j));
  const [message, setMessage] = useState(messageFor(j, tplKey));

  return (
    <Drawer
      open
      onClose={onClose}
      title={visitorName(j)}
      subtitle={`First seen ${formatDateTime(j.firstSeen)} · ${j.device} · via ${j.source}`}
      footer={
        <>
          <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={onDelete}>
            Delete
          </Button>
          <div className="flex-1" />
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Stage progress */}
        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Journey progress</p>
          <div className="flex items-center">
            {STAGES.map((s, i) => {
              const done = !!j.reached[s.id] || stageRank(j.stage) >= i;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1 min-w-0" title={j.reached[s.id] ? formatDateTime(j.reached[s.id]!) : undefined}>
                    <span className={cx('w-3 h-3 rounded-full ring-4', done ? `${s.color} ring-emerald-50` : 'bg-slate-200 ring-white')} />
                    <span className={cx('text-[10px] text-center leading-tight', done ? 'text-slate-800 font-medium' : 'text-slate-400')}>{s.short}</span>
                  </div>
                  {i < STAGES.length - 1 && <span className={cx('flex-1 h-0.5 mx-1 mb-4', stageRank(j.stage) > i ? 'bg-emerald-400' : 'bg-slate-200')} />}
                </React.Fragment>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Contact</p>
            {j.phone ? (
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-slate-900">{j.fullName || '—'}</p>
                <a href={`tel:${j.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-emerald-700">
                  <Phone className="w-3.5 h-3.5" /> {j.phone}
                </a>
                {j.email && <p className="text-slate-600 break-all">{j.email}</p>}
                {j.city && <p className="text-slate-500 text-xs">{j.city}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Anonymous — no details typed at checkout yet.</p>
            )}
          </Card>
          <Card>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Cart ({formatINR(j.cartValue)})</p>
            {j.cart.length ? (
              <ul className="space-y-1 text-sm">
                {j.cart.map((c, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span className="text-slate-700 truncate">
                      {c.name} <span className="text-slate-400">({c.size}) ×{c.qty}</span>
                    </span>
                    <span className="tabular-nums text-slate-900">{formatINR(c.price * c.qty)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Empty{j.orderIds.length ? ` · ordered ${j.orderIds.map((o) => `#${o}`).join(', ')}` : ''}</p>
            )}
            {j.viewedProducts.length > 0 && <p className="text-xs text-slate-400 mt-3">Viewed: {j.viewedProducts.slice(0, 5).join(', ')}</p>}
          </Card>
        </div>

        {j.phone && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Send follow-up</p>
              <Dropdown
                size="sm"
                className="w-64"
                value={tplKey}
                onChange={(k) => {
                  setTplKey(k);
                  setMessage(messageFor(j, k));
                }}
                options={(Object.keys(TEMPLATE_LABELS) as (keyof SiteSettings['followUpTemplates'])[]).map((k) => ({ value: k, label: TEMPLATE_LABELS[k] }))}
              />
            </div>
            <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500">
                Contacted {j.followUp.contactCount}×{j.followUp.lastContactedAt ? ` · last ${timeAgo(j.followUp.lastContactedAt)}` : ''}
              </span>
              <a href={waLink(j.phone, message)} target="_blank" rel="noreferrer" onClick={() => markContacted(j)}>
                <Button variant="primary" icon={<MessageCircle className="w-4 h-4" />}>
                  Send on WhatsApp
                </Button>
              </a>
            </div>
          </Card>
        )}

        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4">
            <Field label="Follow-up status">
              <Dropdown<FollowUpStatus> value={j.followUp.status} onChange={(v) => onUpdate({ followUp: { ...j.followUp, status: v } })} options={FOLLOW_UP_OPTIONS} />
            </Field>
            <Field label="Notes">
              <Textarea rows={2} value={j.followUp.note} onChange={(e) => onUpdate({ followUp: { ...j.followUp, note: e.target.value } })} placeholder="Called — will order next week…" />
            </Field>
          </div>
        </Card>

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Activity</p>
          <ol className="relative border-l border-slate-200 ml-1.5 space-y-3">
            {j.events.map((e, i) => (
              <li key={i} className="pl-5 relative">
                <span
                  className={cx(
                    'absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white',
                    e.type === 'page_view' ? 'bg-slate-300' : e.type === 'removed_from_cart' ? 'bg-slate-400' : stageMeta(e.type as JourneyStage).color
                  )}
                />
                <p className="text-sm text-slate-800">
                  {e.type === 'page_view' ? <span className="text-slate-500">Visited {e.label}</span> : e.label}
                </p>
                <p className="text-[11px] text-slate-400">{formatDateTime(e.at)}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </Drawer>
  );
};

// ---------- Campaigns ----------

const CampaignBuilder: React.FC<{
  journeys: VisitorJourney[];
  segmentOf: (j: VisitorJourney, s: Segment) => boolean;
  messageFor: (j: VisitorJourney, key?: keyof SiteSettings['followUpTemplates']) => string;
  markContacted: (j: VisitorJourney) => void;
}> = ({ journeys, segmentOf, messageFor, markContacted }) => {
  const { siteSettings, updateSiteSettings, triggerToast } = useStore();
  const [audience, setAudience] = useState<string>('abandoned_phone');
  const [tplKey, setTplKey] = useState<keyof SiteSettings['followUpTemplates']>('details_entered');
  const [onlyNew, setOnlyNew] = useState(true);

  const recipients = journeys
    .filter((j) => !!j.phone)
    .filter((j) => (audience.startsWith('stage:') ? j.stage === audience.slice(6) : segmentOf(j, audience as Segment)))
    .filter((j) => !onlyNew || j.followUp.status === 'new');

  const setTemplate = (v: string) =>
    updateSiteSettings({ followUpTemplates: { ...siteSettings.followUpTemplates, [tplKey]: v } }, { silent: true });

  const exportCSV = () =>
    downloadCSV(`campaign-${audience.replace(':', '-')}.csv`, [
      ['Name', 'Phone', 'Email', 'City', 'Stage', 'Cart items', 'Cart value', 'Last seen', 'Follow-up', 'Message'],
      ...recipients.map((j) => [
        j.fullName || '',
        j.phone || '',
        j.email || '',
        j.city || '',
        stageMeta(j.stage).label,
        j.cart.map((c) => `${c.name} x${c.qty}`).join('; '),
        j.cartValue,
        new Date(j.lastSeen).toLocaleString('en-IN'),
        j.followUp.status,
        messageFor(j, tplKey),
      ]),
    ]);

  return (
    <Collapsible
      icon={<Megaphone className="w-4 h-4" />}
      title="Campaign builder"
      subtitle={`${recipients.length} recipients with a phone number in the selected audience`}
      defaultOpen
    >
      <div className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Audience">
            <Dropdown
              value={audience}
              onChange={setAudience}
              minWidth={260}
              options={[
                { value: 'abandoned_phone', label: 'Abandoned cart / checkout', description: 'Left after adding to cart — highest intent' },
                { value: 'identified', label: 'Everyone with a phone' },
                { value: 'ordered', label: 'Past buyers', description: 'For reviews, repeat orders, new launches' },
                ...STAGES.filter((s) => s.id !== 'browsing' && s.id !== 'viewed_product').map((s) => ({ value: `stage:${s.id}`, label: `Currently at: ${s.label}` })),
              ]}
            />
          </Field>
          <Field label="Message template">
            <Dropdown
              value={tplKey}
              onChange={setTplKey}
              options={(Object.keys(TEMPLATE_LABELS) as (keyof SiteSettings['followUpTemplates'])[]).map((k) => ({ value: k, label: TEMPLATE_LABELS[k] }))}
            />
          </Field>
          <Field label="Coupon code" hint="Inserted for {coupon}">
            <Input value={siteSettings.followUpCoupon} onChange={(e) => updateSiteSettings({ followUpCoupon: e.target.value.toUpperCase() }, { silent: true })} />
          </Field>
        </div>

        <Field label="Template text" hint="Variables: {name} {cart_items} {cart_value} {coupon} {store_url} — edits are saved for next time">
          <Textarea rows={3} value={siteSettings.followUpTemplates[tplKey]} onChange={(e) => setTemplate(e.target.value)} />
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600 mr-auto cursor-pointer">
            <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} className="accent-emerald-700" />
            Only people not contacted yet
          </label>
          <Button
            size="sm"
            icon={<Copy className="w-3.5 h-3.5" />}
            disabled={!recipients.length}
            onClick={() => {
              navigator.clipboard?.writeText(recipients.map((j) => `+91${j.phone}`).join(', '));
              triggerToast(`Copied ${recipients.length} numbers (paste into a WhatsApp broadcast list)`);
            }}
          >
            Copy numbers
          </Button>
          <Button size="sm" icon={<Download className="w-3.5 h-3.5" />} disabled={!recipients.length} onClick={exportCSV}>
            Export CSV
          </Button>
        </div>

        {recipients.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">No recipients — try another audience or date range.</p>
        ) : (
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar">
            {recipients.map((j) => (
              <div key={j.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {j.fullName || j.phone} <span className="text-xs text-slate-400 font-normal">· {j.phone}</span>
                  </p>
                  <p className="text-xs text-slate-500 truncate">{messageFor(j, tplKey)}</p>
                </div>
                <StagePill stage={j.stage} />
                {j.followUp.status !== 'new' && <Badge tone="sky">{FOLLOW_UP_OPTIONS.find((o) => o.value === j.followUp.status)?.label}</Badge>}
                <a
                  href={waLink(j.phone!, messageFor(j, tplKey))}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => markContacted(j)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Send
                </a>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-slate-400 flex items-center gap-1">
          <ShoppingCart className="w-3 h-3" /> Each “Send” opens WhatsApp with the message ready and marks the person as contacted. For fully automatic sending, connect the webhook to a WhatsApp Business API tool (e.g. via n8n / Zapier).
        </p>
      </div>
    </Collapsible>
  );
};
