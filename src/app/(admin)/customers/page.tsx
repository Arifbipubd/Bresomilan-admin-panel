"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_SIZE, Pagination, paginate } from "@/components/ui/Pagination";
import { fetchCustomers } from "@/lib/api/admin";
import type { AdminCustomerListItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<AdminCustomerListItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchCustomers({ search: search || undefined })
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, [search]);

  const paged = useMemo(() => paginate(customers, page, PAGE_SIZE), [customers, page]);

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Customers"
        description="Non-staff shopper accounts and order history counts."
      />
      <Card className="mb-4 p-4">
        <input
          type="search"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ui-input max-w-sm"
        />
      </Card>
      <Card flush>
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading…</p>
        ) : customers.length === 0 ? (
          <EmptyState title="No customers" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Joined</th>
                    <th>Active</th>
                    <th className="w-[1%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link
                          href={`/customers/${c.id}`}
                          className="cursor-pointer font-bold text-primary-700 hover:text-primary-500"
                        >
                          {c.name || c.email}
                        </Link>
                        <div className="text-xs text-muted">{c.email}</div>
                      </td>
                      <td>{c.phone || "—"}</td>
                      <td className="font-semibold">{c.order_count}</td>
                      <td className="text-muted">{formatDate(c.date_joined)}</td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${
                            c.is_active
                              ? "bg-success-soft text-emerald-800 ring-emerald-200/80"
                              : "bg-danger-soft text-rose-800 ring-rose-200/80"
                          }`}
                        >
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <IconButton
                          label="View customer"
                          tone="primary"
                          onClick={() => router.push(`/customers/${c.id}`)}
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
