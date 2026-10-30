'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { OrderStatus } from '@/types/store';
import { STATUS_STYLES } from '@/lib/storeUtils';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; padded?: boolean }> = ({ children, className, padded = true }) => (
  <div className={cx('bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]', padded && 'p-5', className)}>
    {children}
  </div>
);

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; icon?: React.ReactNode }
> = ({ variant = 'secondary', size = 'md', icon, className, children, ...rest }) => (
  <button
    {...rest}
    className={cx(
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-4',
      size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
      variant === 'primary' && 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm focus-visible:ring-emerald-600/30',
      variant === 'secondary' && 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-300/40',
      variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
      variant === 'danger' && 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 focus-visible:ring-rose-300/40',
      className
    )}
  >
    {icon}
    {children}
  </button>
);

export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'danger' }> = ({
  tone = 'default',
  className,
  ...rest
}) => (
  <button
    {...rest}
    className={cx(
      'w-8 h-8 inline-flex items-center justify-center rounded-lg transition-colors',
      tone === 'danger' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
      className
    )}
  />
);

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; className?: string; required?: boolean }> = ({
  label,
  hint,
  children,
  className,
  required,
}) => (
  <div className={className}>
    <label className="block mb-1.5 text-xs font-semibold text-slate-600">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
  </div>
);

const inputBase =
  'w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...rest }, ref) => (
  <input ref={ref} {...rest} className={cx(inputBase, 'h-10 px-3.5', className)} />
));
Input.displayName = 'Input';

export const SecretInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(inputBase, 'h-10 pl-3.5 pr-20 font-mono text-[13px]')}
      />
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex">
        <button type="button" onClick={() => setShow((s) => !s)} className="h-7 px-2 rounded-lg text-[11px] font-medium text-slate-500 hover:bg-slate-100">
          {show ? 'Hide' : 'Show'}
        </button>
        {value && (
          <button type="button" onClick={() => navigator.clipboard?.writeText(value)} className="h-7 px-2 rounded-lg text-[11px] font-medium text-slate-500 hover:bg-slate-100">
            Copy
          </button>
        )}
      </div>
    </div>
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...rest }) => (
  <textarea {...rest} className={cx(inputBase, 'px-3.5 py-2.5 leading-relaxed resize-y', className)} />
);

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string; size?: 'sm' | 'md' }> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
}) => {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative shrink-0 rounded-full transition-colors outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20',
        size === 'sm' ? 'w-8 h-[18px]' : 'w-10 h-6',
        checked ? 'bg-emerald-600' : 'bg-slate-300'
      )}
    >
      <span
        className={cx(
          'absolute top-0.5 rounded-full bg-white shadow transition-all',
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5',
          checked ? (size === 'sm' ? 'left-[16px]' : 'left-[18px]') : 'left-0.5'
        )}
      />
    </button>
  );
  if (!label) return sw;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {sw}
    </div>
  );
};

export const Collapsible: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
  right?: React.ReactNode;
}> = ({ title, subtitle, icon, defaultOpen = false, badge, children, right }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cx('rounded-2xl border bg-white transition-colors', open ? 'border-slate-300 shadow-sm' : 'border-slate-200')}>
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex-1 flex items-center gap-3 text-left min-w-0">
          {icon && <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">{icon}</span>}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 truncate">{title}</span>
              {badge}
            </span>
            {subtitle && <span className="block text-xs text-slate-500 truncate mt-0.5">{subtitle}</span>}
          </span>
          <ChevronDown className={cx('w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
        </button>
        {right}
      </div>
      <div className={cx('grid transition-all duration-300 ease-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const StatusPill: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset', STATUS_STYLES[status].pill)}>
    <span className={cx('w-1.5 h-1.5 rounded-full', STATUS_STYLES[status].dot)} />
    {status}
  </span>
);

export const Badge: React.FC<{ children: React.ReactNode; tone?: 'slate' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' }> = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  return <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap', tones[tone])}>{children}</span>;
};

export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  delta?: number | null;
  tone?: 'emerald' | 'amber' | 'sky' | 'violet' | 'slate';
  onClick?: () => void;
  active?: boolean;
}> = ({ label, value, sub, icon, delta, tone = 'slate', onClick, active }) => {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={cx(
        'w-full h-full flex flex-col text-left bg-white rounded-2xl border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        active ? 'border-emerald-600 ring-4 ring-emerald-600/10' : 'border-slate-200/80',
        onClick && !active && 'hover:border-slate-300 hover:shadow-md',
        onClick && 'transition-all'
      )}
    >
      <div className="w-full flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon && <span className={cx('w-8 h-8 rounded-lg flex items-center justify-center', tones[tone])}>{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</div>
      <div className="mt-auto pt-1 flex items-center gap-2 text-xs min-h-[20px]">
        {typeof delta === 'number' && (
          <span className={cx('font-semibold', delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-400')}>
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {Math.abs(delta)}%
          </span>
        )}
        {sub && <span className="text-slate-500">{sub}</span>}
      </div>
    </Comp>
  );
};

export const Drawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, subtitle, width = 'max-w-2xl', children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fadeIn" onClick={onClose} />
      <div className={cx('absolute inset-y-0 right-0 w-full bg-slate-50 shadow-2xl flex flex-col animate-slide-left', width)}>
        <div className="flex items-start justify-between gap-4 px-6 py-4 bg-white border-b border-slate-200">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">{title}</h2>
            {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
          </div>
          <IconButton onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }> = ({
  open,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-modal-pop">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <IconButton onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="py-16 text-center">
    {icon && <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">{icon}</div>}
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    {description && <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const SegmentedTabs = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
}) => (
  <div className="inline-flex p-1 rounded-xl bg-slate-100 gap-0.5 overflow-x-auto max-w-full">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={cx(
          'px-3 h-8 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
          value === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
        )}
      >
        {o.label}
        {typeof o.count === 'number' && (
          <span className={cx('px-1.5 rounded-md text-[10px] tabular-nums', value === o.value ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/70 text-slate-500')}>
            {o.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
