"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_SIZE, Pagination, paginate } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchOrders } from "@/lib/api/admin";
import type { AdminOrderListItem } from "@/lib/types";
import { formatBdt, formatDate } from "@/lib/utils";

const STATUSES = ["", "processing", "confirmed", "shipped", "delivered", "cancelled"];

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchOrders({ status: status || undefined, search: search || undefined })
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [status, search]);

  const paged = useMemo(() => paginate(orders, page, PAGE_SIZE), [orders, page]);

  return (
    <div>
      <PageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Filter fulfilment status, open an order, and advance the timeline."
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search order #, email, name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ui-input sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="ui-select sm:max-w-[200px]"
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? s : "All statuses"}
            </option>
          ))}
        </select>
      </Card>

      {error ? (
        <p className="mb-3 rounded-xl border border-rose-200 bg-danger-soft px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <Card flush>
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading orders…</p>
        ) : orders.length === 0 ? (
          <EmptyState title="No orders found" description="Try another status or search term." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Placed</th>
                    <th className="w-[1%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link
                          href={`/orders/${o.order_number}`}
                          className="cursor-pointer font-bold text-primary-700 hover:text-primary-500"
                        >
                          {o.order_number}
                        </Link>
                      </td>
                      <td>
                        <div className="font-semibold">{o.customer_name || "—"}</div>
                        <div className="text-xs text-muted">{o.customer_email}</div>
                      </td>
                      <td>
                        <StatusBadge value={o.status} />
                      </td>
                      <td>
                        <StatusBadge value={o.payment_status} kind="payment" />
                      </td>
                      <td className="font-semibold">{o.item_count}</td>
                      <td className="font-semibold">{formatBdt(o.total_bdt)}</td>
                      <td className="text-muted">{formatDate(o.created_at)}</td>
                      <td>
                        <IconButton
                          label="View order"
                          tone="primary"
                          onClick={() => router.push(`/orders/${o.order_number}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={paged.page}
              totalPages={paged.totalPages}
              total={paged.total}
              from={paged.from}
              to={paged.to}
              onChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <OrdersContent />
    </Suspense>
  );
}
