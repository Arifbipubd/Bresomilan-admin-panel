"use client";

import { useEffect, useState } from "react";

import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { fetchCategories, fetchProduct } from "@/lib/api/admin";
import type { AdminCategory, AdminProductDetail } from "@/lib/types";

export function ProductModal({
  open,
  mode,
  slug,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  slug?: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setProduct(null);

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cats = await fetchCategories();
        if (cancelled) return;
        setCategories(cats);
        if (mode === "edit" && slug) {
          const p = await fetchProduct(slug);
          if (cancelled) return;
          setProduct(p);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, mode, slug]);

  const formId = mode === "edit" ? "edit-product-form" : "create-product-form";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add product" : "Edit product"}
      description={
        mode === "create"
          ? "Create a catalogue item. Images can be added after saving."
          : product?.name ?? "Update inventory, pricing, and details."
      }
      size="xl"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={loading || !!error || (mode === "edit" && !product)}>
            {mode === "create" ? "Create product" : "Save changes"}
          </Button>
        </>
      }
    >
      {loading ? <p className="py-8 text-center text-sm text-muted">Loading…</p> : null}
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-danger-soft px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {!loading && !error && categories.length > 0 && (mode === "create" || product) ? (
        <ProductForm
          key={mode === "edit" ? product?.slug ?? "edit" : "create"}
          formId={formId}
          hideActions
          product={mode === "edit" ? product : null}
          categories={categories}
          onCancel={onClose}
          onSuccess={() => {
            onSaved();
            onClose();
          }}
        />
      ) : null}
      {!loading && !error && categories.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Create a category first before adding products.
        </p>
      ) : null}
    </Modal>
  );
}
