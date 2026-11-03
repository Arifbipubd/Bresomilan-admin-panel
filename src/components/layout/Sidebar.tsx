"use client";

import {
  ChevronsLeft,
  ChevronsRight,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/lib/store/auth-store";
import { SIDEBAR_COLLAPSED, SIDEBAR_EXPANDED, useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, tone: "tone-indigo" },
  { href: "/orders", label: "Orders", icon: ShoppingBag, tone: "tone-sky" },
  { href: "/products", label: "Products", icon: Package, tone: "tone-violet" },
  { href: "/categories", label: "Categories", icon: FolderTree, tone: "tone-amber" },
  { href: "/customers", label: "Customers", icon: Users, tone: "tone-emerald" },
  { href: "/messages", label: "Messages", icon: Mail, tone: "tone-rose" },
  { href: "/newsletter", label: "Newsletter", icon: Newspaper, tone: "tone-cyan" },
];

function Avatar({
  name,
  url,
  initial,
  size = "md",
}: {
  name?: string;
  url?: string;
  initial?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name || "Avatar"}
        className={cn(dim, "shrink-0 rounded-full object-cover ring-1 ring-line")}
      />
    );
  }
  return (
    <div
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      )}
      style={{ background: "linear-gradient(135deg, #4F46E5, #0EA5E9)" }}
    >
      {initial ?? "?"}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);
  const syncToViewport = useSidebarStore((s) => s.syncToViewport);
  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  useEffect(() => {
    const onResize = () => syncToViewport(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncToViewport]);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-surface transition-[width] duration-200 ease-out"
      style={{ width }}
    >
      <div className={cn("shrink-0 pb-3 pt-5", collapsed ? "px-2" : "px-4")}>
        <Link
          href="/"
          className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}
          title="Bresomilan Admin"
        >
          <Image
            src="/bresomilan-logo.png"
            alt="Bresomilan"
            width={541}
            height={461}
            priority
            className={cn("w-auto shrink-0", collapsed ? "h-9" : "h-10")}
          />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-extrabold tracking-tight text-ink">Bresomilan</p>
              <p className="text-[11px] font-semibold text-muted">Admin Console</p>
            </div>
          ) : null}
        </Link>
      </div>

      <button
        type="button"
        onClick={toggle}
        className="absolute top-1/2 right-0 z-50 inline-flex h-8 w-8 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-slate-500 shadow-md transition hover:bg-slate-50 hover:text-ink"
        aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
        title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </button>

      <div className={cn("min-h-0 flex-1 overflow-y-auto pb-2 pt-1", collapsed ? "px-2" : "px-3")}>
        {!collapsed ? (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Menu
          </p>
        ) : null}
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon, tone }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "group flex items-center rounded-xl text-sm font-semibold transition",
                  collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-2.5 py-2",
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
                {!collapsed ? (
                  <>
                    <span className="truncate">{label}</span>
                    {active ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
                    ) : null}
                  </>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn("shrink-0 border-t border-line bg-surface", collapsed ? "p-2" : "p-3")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link href="/profile" title={user?.name || user?.email || "Profile"}>
              <Avatar name={user?.name} url={user?.avatar_url} initial={user?.avatar_initial} size="sm" />
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-danger-soft hover:text-danger"
              aria-label="Sign out"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2 ring-1 ring-line">
            <Link href="/profile" className="shrink-0" title="Open profile">
              <Avatar name={user?.name} url={user?.avatar_url} initial={user?.avatar_initial} />
            </Link>
            <Link href="/profile" className="min-w-0 flex-1 cursor-pointer">
              <p className="truncate text-sm font-bold leading-tight text-ink">
                {user?.name || "Staff"}
              </p>
              <p className="truncate text-[11px] font-medium text-muted">{user?.email}</p>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-danger-soft hover:text-danger"
              aria-label="Sign out"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export { SIDEBAR_COLLAPSED, SIDEBAR_EXPANDED };
