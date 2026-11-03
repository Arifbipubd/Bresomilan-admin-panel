"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchCustomer } from "@/lib/api/admin";
import type { AdminCustomerDetail } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomer(Number(params.id))
      .then(setCustomer)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [params.id]);

  if (error) {
    return (
      <p className="rounded-xl border border-rose-200 bg-danger-soft px-4 py-3 text-sm text-rose-800">
        {error}
      </p>
    );
  }
  if (!customer) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title={customer.name || customer.email}
        description={customer.email}
        actions={
          <Link href="/customers" className="text-sm font-semibold text-muted hover:text-ink">
            ← Customers
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 text-sm">
          <h2 className="font-bold text-ink">Profile</h2>
          <dl className="mt-4 space-y-3">
            {[
              ["Phone", customer.phone || "—"],
              ["Orders", String(customer.order_count)],
              ["Joined", formatDate(customer.date_joined)],
              ["Active", customer.is_active ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0">
                <dt className="text-muted">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card flush>
          <CardHeader title="Addresses" />
          <ul className="divide-y divide-line">
            {customer.addresses.length === 0 ? (
              <li className="px-5 py-8 text-sm text-muted">No saved addresses</li>
            ) : (
              customer.addresses.map((a) => (
                <li key={a.id} className="px-5 py-4 text-sm">
                  <p className="font-bold">
                    {a.full_name}
                    {a.is_default ? (
                      <span className="ml-2 rounded-full bg-brass-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brass-700">
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-muted">{a.address}</p>
                  <p className="text-muted">
                    {a.area}, {a.city} {a.postal_code}
                  </p>
                  <p className="text-muted">{a.phone}</p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
