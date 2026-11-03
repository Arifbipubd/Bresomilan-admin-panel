import { cn } from "@/lib/utils";

const ORDER_STYLES: Record<string, string> = {
  processing: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-700 ring-sky-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const PAYMENT_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({
  value,
  kind = "order",
}: {
  value: string;
  kind?: "order" | "payment";
}) {
  const styles = kind === "payment" ? PAYMENT_STYLES : ORDER_STYLES;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset",
        styles[value] ?? "bg-slate-100 text-slate-600 ring-slate-200"
      )}
    >
      {value}
    </span>
  );
}
