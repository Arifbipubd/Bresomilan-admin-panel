"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchOrder, updateOrderStatus } from "@/lib/api/admin";
import type { AdminOrderDetail, OrderStatus } from "@/lib/types";
import { formatBdt, formatDate } from "@/lib/utils";

const NEXT_STATUSES: OrderStatus[] = ["processing", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder(orderNumber)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [orderNumber]);

  async function onStatusChange(status: OrderStatus) {
    if (!order || status === order.status) return;
    setBusy(true);
    try {
      const updated = await updateOrderStatus(order.order_number, status);
      setOrder(updated);
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <p className="rounded-xl border border-rose-200 bg-danger-soft px-4 py-3 text-sm text-rose-800">
        {error}
      </p>
    );
  }
  if (!order) return <p className="text-sm text-muted">Loading order…</p>;

  return (
    <div>
      <PageHeader
        eyebrow="Commerce"
        title={order.order_number}
        description={`Placed ${formatDate(order.created_at)}`}
        actions={
          <Link href="/orders" className="text-sm font-semibold text-muted hover:text-ink">
            ← All orders
          </Link>
        }
      />

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <StatusBadge value={order.status} />
        <StatusBadge value={order.payment_status} kind="payment" />
        <label className="ml-auto flex items-center gap-2 text-sm font-semibold text-muted">
          Update status
          <select
            disabled={busy || order.status === "cancelled"}
            value={order.status}
            onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
            className="ui-select w-auto min-w-[180px]"
          >
            {NEXT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card flush className="lg:col-span-2">
          <CardHeader title="Line items" />
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3 px-5 py-3.5">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 ring-line" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-canvas" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{item.name}</p>
                  <p className="text-xs text-muted">
                    {[item.color, item.size].filter(Boolean).join(" · ") || "—"} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatBdt(item.line_total)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-line bg-canvas-soft/50 px-5 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">{formatBdt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="font-semibold">{formatBdt(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Discount</span>
              <span className="font-semibold">{formatBdt(order.discount)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold">
              <span>Total ({order.currency})</span>
              <span>{formatBdt(order.total)}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 text-sm">
            <h2 className="font-bold text-ink">Customer</h2>
            <p className="mt-3 font-semibold">{order.customer_name}</p>
            <p className="text-muted">{order.customer_email}</p>
            <p className="text-muted">{order.contact_phone || order.shipping_address.phone}</p>
            {order.customer_id ? (
              <Link
                href={`/customers/${order.customer_id}`}
                className="mt-3 inline-block font-bold text-brass-600 hover:text-brass-500"
              >
                View customer →
              </Link>
            ) : null}
          </Card>

          <Card className="p-5 text-sm">
            <h2 className="font-bold text-ink">Shipping</h2>
            <p className="mt-3 font-semibold">{order.shipping_address.full_name}</p>
            <p className="text-muted">{order.shipping_address.address}</p>
            <p className="text-muted">
              {order.shipping_address.area}, {order.shipping_address.city}{" "}
              {order.shipping_address.postal_code}
            </p>
            <p className="mt-3 text-muted">Method: {order.delivery_method}</p>
            <p className="text-muted">Est. delivery: {order.estimated_delivery || "—"}</p>
          </Card>

          <Card className="p-5 text-sm">
            <h2 className="font-bold text-ink">Timeline</h2>
            <ol className="mt-4 space-y-3">
              {order.timeline.map((event) => (
                <li key={`${event.status}-${event.order_index}`} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${
                      event.completed
                        ? "bg-success ring-success-soft"
                        : "bg-navy-300 ring-navy-50"
                    }`}
                  />
                  <div>
                    <p className="font-semibold">{event.label}</p>
                    <p className="text-xs text-muted">{formatDate(event.date)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
