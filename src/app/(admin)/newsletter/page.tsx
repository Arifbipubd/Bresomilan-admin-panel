"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_SIZE, Pagination, paginate } from "@/components/ui/Pagination";
import { deleteSubscriber, fetchNewsletter } from "@/lib/api/admin";
import type { NewsletterSubscriber } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function NewsletterPage() {
  const [rows, setRows] = useState<NewsletterSubscriber[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function reload(q = search) {
    setLoading(true);
    try {
      setRows(await fetchNewsletter({ search: q || undefined }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const paged = useMemo(() => paginate(rows, page, PAGE_SIZE), [rows, page]);

  return (
    <div>
      <PageHeader
        eyebrow="Engagement"
        title="Newsletter"
        description="Email subscribers collected from the storefront."
      />
      <Card className="mb-4 p-4">
        <input
          type="search"
          placeholder="Search email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ui-input max-w-sm"
        />
      </Card>
      <Card flush>
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No subscribers" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Subscribed</th>
                    <th className="w-[1%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((r) => (
                    <tr key={r.id}>
                      <td className="font-bold">{r.email}</td>
                      <td className="text-muted">{formatDate(r.subscribed_at)}</td>
                      <td>
                        <ConfirmButton
                          iconOnly
                          label="Remove subscriber"
                          title="Remove subscriber?"
                          description={`Unsubscribe ${r.email} from the list.`}
                          confirmLabel="Remove"
                          onConfirm={async () => {
                            await deleteSubscriber(r.id);
                            toast.success("Removed");
                            await reload();
                          }}
                        />
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
