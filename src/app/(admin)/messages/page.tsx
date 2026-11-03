"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_SIZE, Pagination, paginate } from "@/components/ui/Pagination";
import { deleteMessage, fetchMessages, markMessageRead } from "@/lib/api/admin";
import type { ContactMessage } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      const params =
        filter === "all" ? undefined : { is_read: filter === "read" ? "true" : "false" };
      const data = await fetchMessages(params);
      setMessages(data);
      if (selected) {
        setSelected(data.find((m) => m.id === selected.id) ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const paged = useMemo(() => paginate(messages, page, PAGE_SIZE), [messages, page]);

  return (
    <div>
      <PageHeader
        eyebrow="Engagement"
        title="Contact messages"
        description="Inbound form submissions from the storefront."
      />

      <div className="mb-4 flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "cursor-pointer rounded-xl px-3.5 py-2 text-sm font-bold capitalize transition",
              filter === f
                ? "bg-navy-900 text-white shadow-sm"
                : "border border-line bg-surface text-muted hover:bg-canvas-soft"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card flush>
          {loading ? <p className="p-5 text-sm text-muted">Loading…</p> : null}
          {!loading && messages.length === 0 ? (
            <EmptyState title="No messages" />
          ) : !loading ? (
            <>
              <ul className="divide-y divide-line">
                {paged.items.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={async () => {
                        setSelected(m);
                        if (!m.is_read) {
                          const updated = await markMessageRead(m.id);
                          setMessages((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
                          setSelected(updated);
                        }
                      }}
                      className={cn(
                        "w-full cursor-pointer px-5 py-3.5 text-left transition hover:bg-canvas-soft",
                        !m.is_read && "bg-brass-500/5",
                        selected?.id === m.id && "bg-canvas-soft"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-ink">{m.subject}</p>
                        {!m.is_read ? (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-brass-500" />
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted">
                        {m.name} · {m.email}
                      </p>
                      <p className="mt-1 text-xs text-muted">{formatDate(m.created_at)}</p>
                    </button>
                  </li>
                ))}
              </ul>
              <Pagination
                page={paged.page}
                totalPages={paged.totalPages}
                total={paged.total}
                from={paged.from}
                to={paged.to}
                onChange={setPage}
              />
            </>
          ) : null}
        </Card>

        <Card className="p-5">
          {!selected ? (
            <EmptyState title="Select a message" description="Pick a conversation from the list." />
          ) : (
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-ink">{selected.subject}</h2>
              <p className="mt-1 text-sm text-muted">
                {selected.name} &lt;{selected.email}&gt; · {formatDate(selected.created_at)}
              </p>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-ink">{selected.message}</p>
              <div className="mt-6">
                <ConfirmButton
                  iconOnly
                  label="Delete message"
                  title="Delete this message?"
                  description="Remove this contact submission permanently."
                  confirmLabel="Delete"
                  onConfirm={async () => {
                    await deleteMessage(selected.id);
                    toast.success("Deleted");
                    setSelected(null);
                    await reload();
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
