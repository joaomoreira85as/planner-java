"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* ============ Botões ============ */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gradient" | "ghost" | "outline" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "gradient",
  loading,
  icon,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 min-h-11 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  const variants: Record<string, string> = {
    gradient:
      "insta-gradient text-white shadow-lg shadow-insta-pink/25 hover:shadow-insta-pink/40 hover:brightness-110",
    ghost: "text-ink-dim hover:text-ink hover:bg-surface-2",
    outline: "border border-edge bg-surface-2 text-ink hover:border-insta-pink/50",
    danger:
      "border border-insta-red/40 text-insta-red hover:bg-insta-red/10",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ============ Card ============ */

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-card border border-edge bg-surface p-4 sm:p-5 shadow-xl shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

/* ============ Badge de status ============ */

export const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  rascunho: { label: "Rascunho", cls: "bg-surface-2 text-ink-dim border-edge" },
  agendado: {
    label: "Agendado",
    cls: "bg-insta-purple/15 text-insta-yellow border-insta-purple/40",
  },
  pronto: {
    label: "Pronto para postar",
    cls: "bg-insta-orange/15 text-insta-orange border-insta-orange/40",
  },
  publicado: {
    label: "Publicado",
    cls: "bg-insta-pink/15 text-insta-pink border-insta-pink/40",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.rascunho;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${s.cls}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

/* ============ Campos ============ */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-ink-dim uppercase tracking-wide">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-ink-dim/70">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-edge bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-dim/50 outline-none transition-colors focus:border-insta-pink/60 focus:ring-2 focus:ring-insta-pink/20 min-h-11";

/* ============ Título de página ============ */

export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between fade-up">
      <div className="flex items-center gap-3">
        <span className="insta-gradient grid place-items-center size-11 rounded-2xl shadow-lg shadow-insta-pink/20 text-white shrink-0">
          {icon}
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-ink-dim">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ============ Estado vazio ============ */

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-edge bg-surface/50 px-6 py-12 text-center">
      <span className="grid place-items-center size-12 rounded-2xl bg-surface-2 text-ink-dim">
        {icon}
      </span>
      <p className="font-semibold">{title}</p>
      {hint && <p className="text-sm text-ink-dim max-w-sm">{hint}</p>}
      {action}
    </div>
  );
}
