"use client";

import { Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmModal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export function ConfirmButton({
  label,
  confirmLabel = "Confirm",
  title,
  description,
  onConfirm,
  className,
  variant = "danger",
  iconOnly,
  icon,
}: {
  label: string;
  confirmLabel?: string;
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  className?: string;
  variant?: "danger" | "neutral";
  iconOnly?: boolean;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      {iconOnly ? (
        <IconButton
          label={label}
          tone={variant === "danger" ? "danger" : "default"}
          className={cn(className)}
          onClick={() => setOpen(true)}
        >
          {icon ?? <Trash2 className="h-4 w-4" />}
        </IconButton>
      ) : (
        <Button
          type="button"
          size="sm"
          variant={variant === "danger" ? "dangerOutline" : "secondary"}
          className={cn(className)}
          onClick={() => setOpen(true)}
        >
          {label}
        </Button>
      )}
      <ConfirmModal
        open={open}
        onClose={() => !busy && setOpen(false)}
        title={title ?? label}
        description={description ?? "This action cannot be undone."}
        confirmLabel={confirmLabel}
        danger={variant === "danger"}
        busy={busy}
        onConfirm={async () => {
          setBusy(true);
          try {
            await onConfirm();
            setOpen(false);
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}
