"use client";

import { Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { MessageDetailModal } from "@/components/messages/MessageDetailModal";
import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_SIZE, Pagination, paginate } from "@/components/ui/Pagination";
import { deleteMessage, fetchMessages, markMessageRead } from "@/lib/api/admin";
import type { ContactMessage } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      const params =
        filter === "all" ? undefined : { is_read: filter === "read" ? "true" : "false" };
      const data = await fetchMessages(params);
      setMessages(data);
      if (viewing) {
        setViewing(data.find((m) => m.id === viewing.id) ?? null);
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

  async function openMessage(message: ContactMessage) {
    setViewing(message);
    if (!message.is_read) {
      // Optimistic UI so the table updates even before the API returns.
      const optimistic = { ...message, is_read: true };
      setMessages((prev) => prev.map((x) => (x.id === message.id ? optimistic : x)));
      setViewing(optimistic);
      try {
        const updated = await markMessageRead(message.id);
        setMessages((prev) => prev.map((x) => (x.id === message.id ? updated : x)));
        setViewing(updated);
      } catch (err) {
        setMessages((prev) => prev.map((x) => (x.id === message.id ? message : x)));
        setViewing(message);
        toast.error(err instanceof Error ? err.message : "Could not mark as read");
      }
    }
  }

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

      <Card flush>
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading…</p>
        ) : messages.length === 0 ? (
          <EmptyState title="No messages" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>From</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th className="w-[1%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((m) => (
                    <tr key={m.id} className={cn(!m.is_read && "bg-brass-500/5")}>
                      <td>
                        <div className="flex items-center gap-2">
                          {!m.is_read ? (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-brass-500" />
                          ) : null}
                          <span className={cn("font-bold", !m.is_read && "text-ink")}>
                            {m.subject}
                          </span>
                        </div>
                      </td>
                      <td className="font-semibold text-ink">{m.name}</td>
                      <td className="text-muted">{m.email}</td>
                      <td>
                        <span
                          className={cn(
                            "inline-flex rounded-lg px-2 py-0.5 text-xs font-bold",
                            m.is_read
                              ? "bg-slate-100 text-slate-500"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {m.is_read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="text-muted">{formatDate(m.created_at)}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <IconButton
                            label="View message"
                            tone="primary"
                            onClick={() => openMessage(m)}
                          >
                            <Eye className="h-4 w-4" />
                          </IconButton>
                          <ConfirmButton
                            iconOnly
                            label="Delete message"
                            title="Delete this message?"
                            description="Remove this contact submission permanently."
                            confirmLabel="Delete"
                            onConfirm={async () => {
                              await deleteMessage(m.id);
                              toast.success("Deleted");
                              if (viewing?.id === m.id) setViewing(null);
                              await reload();
                            }}
                          />
                        </div>
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

      <MessageDetailModal
        open={Boolean(viewing)}
        message={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
