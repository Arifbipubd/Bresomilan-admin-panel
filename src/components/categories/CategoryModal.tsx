"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createCategory, updateCategory } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/http";
import type { AdminCategory } from "@/lib/types";

export function CategoryModal({
  open,
  category,
  onClose,
  onSaved,
}: {
  open: boolean;
  category: AdminCategory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setOrder(String(category?.order ?? 0));
    setImageFile(null);
    setHeroFile(null);
  }, [open, category]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("description", description.trim());
      form.append("order", String(Number(order) || 0));
      if (imageFile) form.append("image_file", imageFile);
      if (heroFile) form.append("hero_image_file", heroFile);

      if (isEdit && category) {
        await updateCategory(category.slug, form);
        toast.success("Category updated");
      } else {
        await createCategory(form);
        toast.success("Category created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const formId = "category-form";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit category" : "Add category"}
      description={
        isEdit
          ? `Update “${category?.name}” details and images.`
          : "Create a storefront category for products."
      }
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="ui-label">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bags"
            className="ui-input"
          />
        </label>
        <label className="block">
          <span className="ui-label">Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="ui-input resize-y"
          />
        </label>
        <label className="block">
          <span className="ui-label">Sort order</span>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="0"
            className="ui-input"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="ui-label">Category image</span>
            {category?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.image}
                alt=""
                className="mb-2 h-16 w-16 rounded-lg object-cover ring-1 ring-line"
              />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="ui-input cursor-pointer py-2"
            />
          </label>
          <label className="block">
            <span className="ui-label">Hero image</span>
            {category?.hero_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.hero_image}
                alt=""
                className="mb-2 h-16 w-full max-w-[10rem] rounded-lg object-cover ring-1 ring-line"
              />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
              className="ui-input cursor-pointer py-2"
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}
