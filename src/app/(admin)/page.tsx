"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchDashboard } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/store/auth-store";
import type { DashboardStats } from "@/lib/types";
import { cn, formatBdt, formatDate } from "@/lib/utils";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-36 rounded-2xl bg-white/80" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/80" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  const maxRevenue = useMemo(() => (stats ? Math.max(...stats.revenue_data, 1) : 1), [stats]);
  const periodRevenue = useMemo(
    () => (stats ? stats.revenue_data.reduce((a, b) => a + b, 0) : 0),
    [stats]
  );

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-danger-soft px-5 py-4 text-sm font-medium text-rose-800">
        {error}
      </div>
    );
  }
  if (!stats) return <Skeleton />;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  /* Lineone-style Sales Overview metric strip */
  const overview = [
    { label: "Income", value: formatBdt(stats.total_revenue), tone: "tone-indigo", icon: Wallet },
    { label: "Orders", value: String(stats.total_orders), tone: "tone-sky", icon: ShoppingBag },
    { label: "Pending", value: String(stats.pending_orders), tone: "tone-amber", icon: TrendingUp },
    { label: "Products", value: String(stats.total_products), tone: "tone-violet", icon: Package },
    { label: "Customers", value: String(stats.total_customers), tone: "tone-emerald", icon: Users },
    { label: "Messages", value: String(stats.unread_messages), tone: "tone-rose", icon: Mail },
  ];

  const kpis = [
    {
      label: "Total revenue",
      value: formatBdt(stats.total_revenue),
      delta: "14-day period",
      deltaValue: formatBdt(periodRevenue),
      up: true,
      icon: Wallet,
      tone: "tone-indigo",
      href: "/orders",
      bar: "from-indigo-500 to-violet-400",
    },
    {
      label: "Total orders",
      value: String(stats.total_orders),
      delta: "Awaiting fulfilment",
      deltaValue: String(stats.pending_orders),
      up: stats.pending_orders > 0,
      icon: ShoppingBag,
      tone: "tone-sky",
      href: "/orders",
      bar: "from-sky-500 to-cyan-400",
    },
    {
      label: "Customers",
      value: String(stats.total_customers),
      delta: "Shopper accounts",
      deltaValue: "Active",
      up: true,
      icon: Users,
      tone: "tone-emerald",
      href: "/customers",
      bar: "from-emerald-500 to-teal-400",
    },
    {
      label: "Catalogue",
      value: String(stats.total_products),
      delta: "Low stock alerts",
      deltaValue: String(stats.low_stock_count),
      up: stats.low_stock_count === 0,
      icon: Package,
      tone: "tone-violet",
      href: "/products",
      bar: "from-violet-500 to-fuchsia-400",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header row — Lineone page title style */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[1.85rem]">
            {greeting}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">CRM analytics overview · store operations</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/orders"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white shadow-sm shadow-primary-600/25 transition hover:bg-primary-500"
          >
            Review orders
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products?new=1"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-slate-50"
          >
            Add product
          </Link>
        </div>
      </div>

      {/* Sales Overview card — like Lineone */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-ink">Sales Overview</h2>
            <p className="text-sm text-muted">Key commerce metrics at a glance</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Period {formatBdt(periodRevenue)}
          </div>
        </div>
        <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {overview.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", item.tone)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-muted">{item.label}</p>
                    <p className="text-lg font-extrabold tracking-tight text-ink">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Colorful KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const DeltaIcon = kpi.up ? ArrowUpRight : ArrowDownRight;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="group ui-card relative overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90", kpi.bar)} />
              <div className="flex items-start justify-between">
                <div className={cn("rounded-2xl p-3", kpi.tone)}>
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
                    kpi.up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  )}
                >
                  <DeltaIcon className="h-3 w-3" />
                  {kpi.deltaValue}
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted">{kpi.label}</p>
              <p className="mt-1 text-[1.7rem] font-extrabold tracking-tight text-ink">{kpi.value}</p>
              <p className="mt-1.5 text-xs font-medium text-slate-400">{kpi.delta}</p>
            </Link>
          );
        })}
      </section>

      {/* Chart + top sellers */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Revenue trend</h2>
                <p className="text-sm text-muted">Daily totals · last 14 days</p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-3.5 py-2 text-right ring-1 ring-line">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Period total</p>
              <p className="text-lg font-extrabold text-ink">{formatBdt(periodRevenue)}</p>
            </div>
          </div>

          <div className="mt-6 flex h-56 items-end gap-2">
            {stats.revenue_data.map((value, i) => {
              const pct = Math.max((value / maxRevenue) * 100, value > 0 ? 8 : 3);
              return (
                <div key={stats.revenue_labels[i]} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-48 w-full items-end justify-center">
                    <div
                      className="w-full max-w-[26px] rounded-t-xl bg-gradient-to-t from-primary-700 via-primary-500 to-sky-400 transition duration-300 group-hover:from-primary-600 group-hover:to-cyan-300"
                      style={{ height: `${pct}%` }}
                    />
                    <div className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-navy-900 px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block">
                      {formatBdt(value)}
                    </div>
                  </div>
                  <span className="w-full truncate text-center text-[10px] font-semibold text-muted">
                    {stats.revenue_labels[i].split(" ")[1] ?? stats.revenue_labels[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-ink">Top sellers</h2>
          <p className="mt-0.5 text-sm text-muted">Units sold (excl. cancelled)</p>
          <ul className="mt-5 space-y-3">
            {stats.top_products.length === 0 ? (
              <li className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-muted">No sales yet</li>
            ) : (
              stats.top_products.map((p, idx) => {
                const maxUnits = stats.top_products[0]?.units || 1;
                const tones = ["tone-indigo", "tone-sky", "tone-emerald", "tone-amber", "tone-violet"];
                return (
                  <li key={p.name} className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-line">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold",
                            tones[idx % tones.length]
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span className="truncate font-semibold text-ink">{p.name}</span>
                      </div>
                      <span className="shrink-0 font-bold text-muted">{p.units}</span>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-sky-400"
                        style={{ width: `${Math.max((p.units / maxUnits) * 100, 10)}%` }}
                      />
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </Card>
      </div>

      {/* Orders + alerts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card flush className="lg:col-span-3">
          <CardHeader
            title="Recent orders"
            description="Latest storefront checkouts"
            action={
              <Link
                href="/orders"
                className="inline-flex items-center gap-1 rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-500"
              >
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {stats.recent_orders.length === 0 ? (
            <EmptyState title="No orders yet" description="New checkouts will show up here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link
                          href={`/orders/${o.order_number}`}
                          className="font-bold text-primary-700 hover:text-primary-500"
                        >
                          {o.order_number}
                        </Link>
                      </td>
                      <td>
                        <div className="font-semibold">{o.customer_name || "Guest"}</div>
                        <div className="text-xs text-muted">{o.customer_email}</div>
                      </td>
                      <td>
                        <StatusBadge value={o.status} />
                      </td>
                      <td className="font-semibold">{formatBdt(o.total_bdt)}</td>
                      <td className="text-muted">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-xl tone-rose p-2">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-ink">Stock alerts</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {stats.low_stock_products.length === 0 ? (
                <li className="rounded-xl bg-emerald-50 px-3 py-4 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
                  All products above the low-stock threshold.
                </li>
              ) : (
                stats.low_stock_products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products?edit=${encodeURIComponent(p.slug)}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-3 py-2.5 ring-1 ring-rose-100 transition hover:bg-rose-100/70"
                    >
                      <span className="truncate text-sm font-semibold text-ink">{p.name}</span>
                      <span className="shrink-0 rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        {p.stock} left
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary-600 via-primary-500 to-sky-500 p-5 text-white shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 text-indigo-100">
              <Mail className="h-4 w-4" />
              <h2 className="text-base font-bold text-white">Inbox</h2>
            </div>
            <p className="mt-4 text-4xl font-extrabold tracking-tight">{stats.unread_messages}</p>
            <p className="mt-1 text-sm text-indigo-100">unread contact messages</p>
            <Link
              href="/messages"
              className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-white hover:text-indigo-50"
            >
              Open messages
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
