"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  default:
    "border-line text-slate-600 hover:bg-slate-50 hover:text-ink",
  primary:
    "border-primary-100 bg-primary-50 text-primary-700 hover:bg-primary-100",
  danger:
    "border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100",
} as const;

export function IconButton({
  tone = "default",
  label,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof tones;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border bg-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
