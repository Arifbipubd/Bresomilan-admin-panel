"use client";

import { Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { SIDEBAR_WIDTH, Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store/auth-store";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuthStore();

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
      <div className="admin-canvas flex min-h-screen min-w-0 flex-col" style={{ marginLeft: SIDEBAR_WIDTH }}>
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
              <button
                type="button"
                className="relative rounded-xl bg-slate-100 p-2.5 text-slate-500 transition hover:bg-primary-50 hover:text-primary-600"
                aria-label="Notifications"
                onClick={() => router.push("/messages")}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
