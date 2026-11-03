"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImage,
} from "@/lib/api/admin";
import type { AdminCategory, AdminProductDetail } from "@/lib/types";

type FormState = {
  name: string;
  slug: string;
  category: string;
  price: string;
  compare_at_price: string;
  stock: string;
  short_description: string;
  description: string;
  materials: string;
  dimensions: string;
  care_instructions: string;
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
};

function toForm(product?: AdminProductDetail | null, defaultCategory = ""): FormState {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category: product?.category ?? defaultCategory,
    price: product?.price ?? "",
    compare_at_price: product?.compare_at_price ?? "",
    stock: product ? String(product.stock) : "0",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    materials: product?.materials ?? "",
    dimensions: product?.dimensions ?? "",
    care_instructions: product?.care_instructions ?? "",
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    new_arrival: product?.new_arrival ?? false,
  };
}

export function ProductForm({
  product,
  categories,
  onSuccess,
  onCancel,
  formId = "product-form",
  hideActions,
}: {
  product?: AdminProductDetail | null;
  categories: AdminCategory[];
  onSuccess?: (product: AdminProductDetail) => void;
  onCancel?: () => void;
  formId?: string;
  hideActions?: boolean;
}) {
  const [form, setForm] = useState<FormState>(() => toForm(product, categories[0]?.slug ?? ""));
  const [images, setImages] = useState(product?.images ?? []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(toForm(product, categories[0]?.slug ?? ""));
    setImages(product?.images ?? []);
  }, [product, categories]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      category: form.category,
      price: form.price,
      compare_at_price: form.compare_at_price || null,
      stock: Number(form.stock) || 0,
      short_description: form.short_description,
      description: form.description,
      materials: form.materials,
      dimensions: form.dimensions,
      care_instructions: form.care_instructions,
      featured: form.featured,
      bestseller: form.bestseller,
      new_arrival: form.new_arrival,
    };
    try {
      if (product) {
        const updated = await updateProduct(product.slug, payload);
        setImages(updated.images);
        toast.success("Product saved");
        onSuccess?.(updated);
      } else {
        const created = await createProduct(payload);
        toast.success("Product created");
        onSuccess?.(created);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="ui-label">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Classic leather tote"
            className="ui-input"
          />
        </label>
        <label className="block">
          <span className="ui-label">Slug</span>
          <input
            value={form.slug}
            onChange={(e) => setField("slug", e.target.value)}
            placeholder="auto-from-name-if-empty"
            className="ui-input"
          />
        </label>
        <label className="block">
          <span className="ui-label">Category</span>
          <select
            required
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            className="ui-select"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="ui-label">Stock</span>
          <input
            type="number"
            min={0}
            required
            value={form.stock}
            onChange={(e) => setField("stock", e.target.value)}
            placeholder="0"
            className="ui-input"
          />
        </label>
        <label className="block">
          <span className="ui-label">Price (BDT)</span>
          <input
            required
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            placeholder="e.g. 4500"
            className="ui-input"
          />
        </label>
        <label className="block">
          <span className="ui-label">Compare-at price</span>
          <input
            value={form.compare_at_price}
            onChange={(e) => setField("compare_at_price", e.target.value)}
            placeholder="Optional original price"
            className="ui-input"
          />
        </label>
      </div>

      <label className="block">
        <span className="ui-label">Short description</span>
        <input
          value={form.short_description}
          onChange={(e) => setField("short_description", e.target.value)}
          placeholder="One-line summary for cards and listings"
          className="ui-input"
        />
      </label>

      <label className="block">
        <span className="ui-label">Description</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Full product story, materials, and details…"
          className="ui-input"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="ui-label">Materials</span>
          <input
            value={form.materials}
            onChange={(e) => setField("materials", e.target.value)}
            placeholder="e.g. Full-grain leather"
            className="ui-input"
          />
        </label>
        <label className="block">
          <span className="ui-label">Dimensions</span>
          <input
            value={form.dimensions}
            onChange={(e) => setField("dimensions", e.target.value)}
            placeholder="e.g. 32 × 28 × 12 cm"
            className="ui-input"
          />
        </label>
        <label className="block">
          <span className="ui-label">Care</span>
          <input
            value={form.care_instructions}
            onChange={(e) => setField("care_instructions", e.target.value)}
            placeholder="e.g. Wipe with soft cloth"
            className="ui-input"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 text-sm font-medium text-ink">
        {(
          [
            ["featured", "Featured"],
            ["bestseller", "Bestseller"],
            ["new_arrival", "New arrival"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setField(key, e.target.checked)}
              className="h-4 w-4 rounded border-line-strong text-primary-600"
            />
            {label}
          </label>
        ))}
      </div>

      {product ? (
        <section className="rounded-xl border border-line bg-slate-50 p-4">
          <h2 className="text-sm font-bold text-ink">Images</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image}
                  alt={img.alt_text || form.name}
                  className="h-24 w-24 rounded-xl object-cover ring-1 ring-line"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-md bg-rose-600 px-1.5 text-xs font-bold text-white"
                  onClick={async () => {
                    await deleteProductImage(product.slug, img.id);
                    setImages((prev) => prev.filter((i) => i.id !== img.id));
                    toast.success("Image removed");
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            className="mt-3 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-700"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const uploaded = await uploadProductImage(product.slug, file);
                setImages((prev) => [...prev, uploaded as (typeof images)[number]]);
                toast.success("Image uploaded");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Upload failed");
              } finally {
                e.target.value = "";
              }
            }}
          />
        </section>
      ) : (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted ring-1 ring-line">
          Save the product first, then you can upload images from Edit.
        </p>
      )}

      {!hideActions ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : product ? "Save changes" : "Create product"}
          </Button>
          {onCancel ? (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
          ) : null}
          {product ? (
            <ConfirmButton
              label="Delete product"
              title="Delete product?"
              description={`Remove “${product.name}” permanently.`}
              onConfirm={async () => {
                await deleteProduct(product.slug);
                toast.success("Product deleted");
                onSuccess?.(product);
              }}
            />
          ) : null}
        </div>
      ) : null}

      {hideActions ? (
        <button type="submit" className="hidden" disabled={busy} aria-hidden>
          Save
        </button>
      ) : null}
    </form>
  );
}
