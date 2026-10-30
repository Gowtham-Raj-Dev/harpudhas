'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string; // right-aligned meta, e.g. a count
  dot?: string; // tailwind bg class for a colored status dot
  description?: string;
}

interface DropdownProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  variant?: 'admin' | 'store';
  size?: 'sm' | 'md';
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
  icon?: React.ReactNode;
  align?: 'left' | 'right';
  minWidth?: number;
}

const VARIANTS = {
  admin: {
    button:
      'bg-white border-slate-200 text-slate-800 hover:border-slate-300 focus-visible:ring-emerald-600/30 focus-visible:border-emerald-600',
    open: 'border-emerald-600 ring-4 ring-emerald-600/10',
    menu: 'bg-white border-slate-200',
    item: 'text-slate-700 hover:bg-slate-50',
    active: 'bg-emerald-50 text-emerald-900',
    check: 'text-emerald-700',
    hint: 'text-slate-400',
  },
  store: {
    button:
      'bg-white border-sandal-300 text-botanical-900 hover:border-botanical-600 focus-visible:ring-botanical-700/20 focus-visible:border-botanical-700',
    open: 'border-botanical-700 ring-4 ring-botanical-700/10',
    menu: 'bg-white border-sandal-200',
    item: 'text-botanical-900 hover:bg-sandal-50',
    active: 'bg-botanical-50 text-botanical-900',
    check: 'text-botanical-700',
    hint: 'text-gray-400',
  },
};

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  placeholder = 'Select…',
  variant = 'admin',
  size = 'md',
  searchable,
  className = '',
  buttonClassName = '',
  icon,
  align = 'left',
  minWidth = 200,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; flip: boolean } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const v = VARIANTS[variant];

  const selected = options.find((o) => o.value === value);
  const showSearch = searchable ?? options.length > 8;
  const filtered = query
    ? options.filter((o) => `${o.label} ${o.description ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Position the menu with fixed coordinates so it never gets clipped by
  // overflow containers (tables, modals, drawers).
  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.max(r.width, minWidth);
    const spaceBelow = window.innerHeight - r.bottom;
    const flip = spaceBelow < 280 && r.top > spaceBelow;
    let left = align === 'right' ? r.right - width : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    setPos({ top: flip ? window.innerHeight - r.top + 6 : r.bottom + 6, left, width, flip });
  };

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      place();
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlight(Math.max(0, options.findIndex((o) => o.value === value)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (val: T) => {
    onChange(val);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) choose(opt.value);
    }
  };

  const pad = size === 'sm' ? 'h-9 px-3 text-xs' : 'h-11 px-3.5 text-sm';

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`block mb-1.5 text-xs font-semibold ${variant === 'admin' ? 'text-slate-600' : 'text-botanical-900'}`}>
          {label}
        </label>
      )}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`w-full flex items-center gap-2 rounded-xl border font-medium transition-all outline-none focus-visible:ring-4 ${pad} ${v.button} ${open ? v.open : ''} ${buttonClassName}`}
      >
        {icon && <span className="shrink-0 opacity-70">{icon}</span>}
        {selected?.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${selected.dot}`} />}
        <span className={`flex-1 text-left truncate ${selected ? '' : 'opacity-50'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            onKeyDown={onKeyDown}
            style={{
              position: 'fixed',
              ...(pos.flip ? { bottom: pos.top } : { top: pos.top }),
              left: pos.left,
              width: pos.width,
              zIndex: 1000,
            }}
            className={`rounded-xl border shadow-2xl shadow-slate-900/10 overflow-hidden animate-dropdown ${v.menu}`}
          >
            {showSearch && (
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setHighlight(0);
                    }}
                    placeholder="Search…"
                    className="w-full h-8 pl-8 pr-2 rounded-lg bg-slate-50 border border-slate-200 text-xs outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            )}
            <div className="max-h-72 overflow-y-auto p-1.5 custom-scrollbar">
              {filtered.length === 0 && <div className="px-3 py-6 text-center text-xs text-slate-400">No matches</div>}
              {filtered.map((o, i) => {
                const isSel = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => choose(o.value)}
                    className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${
                      isSel ? v.active : v.item
                    } ${i === highlight && !isSel ? 'bg-slate-50' : ''}`}
                  >
                    {o.dot && <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${o.dot}`} />}
                    <span className="flex-1 min-w-0">
                      <span className={`block truncate ${isSel ? 'font-semibold' : 'font-medium'}`}>{o.label}</span>
                      {o.description && <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">{o.description}</span>}
                    </span>
                    {o.hint && <span className={`text-xs tabular-nums mt-0.5 ${v.hint}`}>{o.hint}</span>}
                    {isSel && <Check className={`w-4 h-4 mt-0.5 shrink-0 ${v.check}`} />}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
