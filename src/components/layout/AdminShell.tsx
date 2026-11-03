"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { NotificationBell } from "@/components/layout/NotificationBell";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store/auth-store";
import { SIDEBAR_COLLAPSED, SIDEBAR_EXPANDED, useSidebarStore } from "@/lib/store/sidebar-store";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuthStore();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted">
        <div className="ui-card px-6 py-4 font-medium">Loading workspace…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className="admin-canvas flex min-h-screen min-w-0 flex-col transition-[margin] duration-200 ease-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur-xl">
          <div className="flex h-[68px] items-center gap-4 px-5 sm:px-7">
            <div className="ui-search hidden min-w-0 flex-1 md:block md:max-w-md">
              <Search className="ui-search-icon" aria-hidden />
              <input
                type="search"
                placeholder="Search orders, products…"
                className="ui-input border-transparent bg-slate-100 focus:border-primary-500 focus:bg-white"
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (!q) return;
                  if (q.toUpperCase().startsWith("SNG-")) router.push(`/orders/${q.toUpperCase()}`);
                  else router.push(`/orders?search=${encodeURIComponent(q)}`);
                }}
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
