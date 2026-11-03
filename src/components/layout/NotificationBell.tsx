"use client";

import { Bell, Mail, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { fetchNotifications, markNotificationRead } from "@/lib/api/admin";
import type { AdminNotificationItem, AdminNotifications } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const POLL_MS = 45_000;

export function NotificationBell() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<AdminNotifications | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setData(await fetchNotifications());
    } catch {
      /* keep last good snapshot */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    load();
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, load]);

  const count = data?.count ?? 0;
  const badge = count > 99 ? "99+" : String(count);

  function removeItem(item: AdminNotificationItem) {
    setData((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((x) => x.id !== item.id);
      const new_orders_count =
        item.type === "order" ? Math.max(0, prev.new_orders_count - 1) : prev.new_orders_count;
      const unread_messages_count =
        item.type === "message"
          ? Math.max(0, prev.unread_messages_count - 1)
          : prev.unread_messages_count;
      return {
        items,
        new_orders_count,
        unread_messages_count,
        count: new_orders_count + unread_messages_count,
      };
    });
  }

  async function onItemClick(item: AdminNotificationItem) {
    removeItem(item);
    setOpen(false);
    try {
      await markNotificationRead(item.type, item.ref);
    } catch {
      /* navigation still proceeds; next poll will resync if mark failed */
    }
    if (item.type === "order") {
      router.push(`/orders/${item.ref}`);
      return;
    }
    router.push("/messages");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative cursor-pointer rounded-xl bg-slate-100 p-2.5 text-slate-500 transition hover:bg-primary-50 hover:text-primary-600"
        aria-label={count ? `${count} notifications` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-rose-500 px-1 py-0.5 text-[10px] font-extrabold leading-none text-white ring-2 ring-white">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(22.5rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-modal)]"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-extrabold text-ink">Notifications</p>
              <p className="text-[11px] font-medium text-muted">
                {data
                  ? `${data.new_orders_count} new order${data.new_orders_count === 1 ? "" : "s"} · ${data.unread_messages_count} message${data.unread_messages_count === 1 ? "" : "s"}`
                  : "Loading…"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-slate-100 hover:text-ink"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
            {loading && !data ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Loading…</p>
            ) : !data?.items.length ? (
              <p className="px-4 py-8 text-center text-sm text-muted">You&apos;re all caught up.</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.items.map((item) => {
                  const isOrder = item.type === "order";
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onItemClick(item)}
                        className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition hover:bg-canvas-soft"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            isOrder ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-600"
                          )}
                        >
                          {isOrder ? (
                            <ShoppingBag className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="truncate text-sm font-bold text-ink">{item.title}</span>
                            <span
                              className={cn(
                                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                isOrder ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"
                              )}
                            >
                              {isOrder ? "Order" : "Message"}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted">{item.body}</span>
                          <span className="mt-1 block text-[11px] text-slate-400">
                            {formatDate(item.created_at)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/orders");
              }}
              className="cursor-pointer bg-surface px-3 py-2.5 text-center text-xs font-bold text-primary-700 transition hover:bg-primary-50"
            >
              View orders
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/messages");
              }}
              className="cursor-pointer bg-surface px-3 py-2.5 text-center text-xs font-bold text-primary-700 transition hover:bg-primary-50"
            >
              View messages
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
