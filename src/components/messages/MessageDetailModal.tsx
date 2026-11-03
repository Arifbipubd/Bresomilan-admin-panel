"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ContactMessage } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function MessageDetailModal({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: ContactMessage | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={message?.subject || "Message"}
      description={
        message
          ? `${message.name} · ${message.email} · ${formatDate(message.created_at)}`
          : undefined
      }
      size="lg"
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {message ? (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-line sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">From</p>
              <p className="mt-0.5 font-semibold text-ink">{message.name}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Email</p>
              <a
                href={`mailto:${message.email}`}
                className="mt-0.5 block font-semibold text-primary-700 hover:underline"
              >
                {message.email}
              </a>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Status</p>
              <p className="mt-0.5 font-semibold text-ink">
                {message.is_read ? "Read" : "Unread"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Received</p>
              <p className="mt-0.5 font-semibold text-ink">{formatDate(message.created_at)}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Message
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{message.message}</p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
