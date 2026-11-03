import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 shadow-sm border border-transparent",
  accent:
    "bg-primary-600 text-white hover:bg-primary-500 shadow-sm border border-transparent font-semibold",
  secondary:
    "bg-white text-navy-700 border border-line-strong hover:bg-canvas-soft shadow-sm",
  ghost: "bg-transparent text-navy-600 hover:bg-navy-100 border border-transparent",
  danger: "bg-danger text-white hover:bg-rose-600 shadow-sm border border-transparent",
  dangerOutline:
    "bg-white text-danger border border-rose-200 hover:bg-danger-soft shadow-sm",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-sm rounded-xl",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
