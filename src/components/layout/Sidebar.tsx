"use client";

import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 260;

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, tone: "tone-indigo" },
  { href: "/orders", label: "Orders", icon: ShoppingBag, tone: "tone-sky" },
  { href: "/products", label: "Products", icon: Package, tone: "tone-violet" },
  { href: "/categories", label: "Categories", icon: FolderTree, tone: "tone-amber" },
  { href: "/customers", label: "Customers", icon: Users, tone: "tone-emerald" },
  { href: "/messages", label: "Messages", icon: Mail, tone: "tone-rose" },
  { href: "/newsletter", label: "Newsletter", icon: Newspaper, tone: "tone-cyan" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-surface"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="shrink-0 px-5 pb-3 pt-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #0EA5E9 50%, #F59E0B 100%)",
            }}
          >
            B
          </div>
          <div>
            <p className="text-[15px] font-extrabold tracking-tight text-ink">Bresomilan</p>
            <p className="text-[11px] font-semibold text-muted">Admin Console</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2 pt-2">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Dashboards
        </p>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon, tone }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-ink"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition",
                    active ? tone : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {label}
                {active ? (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-line bg-surface p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2 ring-1 ring-line">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #4F46E5, #0EA5E9)" }}
          >
            {user?.avatar_initial ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight text-ink">
              {user?.name || "Staff"}
            </p>
            <p className="truncate text-[11px] font-medium text-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-danger-soft hover:text-danger"
            aria-label="Sign out"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export { SIDEBAR_WIDTH };
