"use client";

import { Pencil } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_SIZE, Pagination, paginate } from "@/components/ui/Pagination";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "@/lib/api/admin";
import type { AdminCategory } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      setCategories(await fetchCategories());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const paged = useMemo(() => paginate(categories, page, PAGE_SIZE), [categories, page]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateCategory(editing.slug, { name, description });
        toast.success("Category updated");
      } else {
        await createCategory({ name, description });
        toast.success("Category created");
      }
      setName("");
      setDescription("");
      setEditing(null);
      setPage(1);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Organize the storefront category tree."
      />

      <Card className="mb-4 p-4">
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3">
          <input
            required
            placeholder="Category name (e.g. Bags)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ui-input"
          />
          <input
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="ui-input"
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              {editing ? "Update" : "Add category"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setDescription("");
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card flush>
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading…</p>
        ) : categories.length === 0 ? (
          <EmptyState title="No categories" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Order</th>
                    <th className="w-[1%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((c) => (
                    <tr key={c.id}>
                      <td className="font-bold">{c.name}</td>
                      <td className="text-muted">{c.slug}</td>
                      <td className="font-semibold">{c.order}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <IconButton
                            label="Edit category"
                            tone="primary"
                            onClick={() => {
                              setEditing(c);
                              setName(c.name);
                              setDescription(c.description);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </IconButton>
                          <ConfirmButton
                            iconOnly
                            label="Delete category"
                            title="Delete category?"
                            description={`Remove “${c.name}” permanently.`}
                            confirmLabel="Delete"
                            onConfirm={async () => {
                              await deleteCategory(c.slug);
                              toast.success("Deleted");
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
    </div>
  );
}
