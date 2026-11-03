"use client";

import { Pencil } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import { CategoryModal } from "@/components/categories/CategoryModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_SIZE, Pagination, paginate } from "@/components/ui/Pagination";
import { deleteCategory, fetchCategories } from "@/lib/api/admin";
import type { AdminCategory } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);

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

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(category: AdminCategory) {
    setEditing(category);
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Organize the storefront category tree."
        actions={
          <Button variant="accent" onClick={openCreate}>
            New category
          </Button>
        }
      />

      <Card flush>
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading…</p>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories"
            description="Create your first category."
            action={
              <Button variant="primary" onClick={openCreate}>
                New category
              </Button>
            }
          />
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
                      <td>
                        <div className="flex items-center gap-3">
                          {c.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.image}
                              alt=""
                              className="h-9 w-9 rounded-lg object-cover ring-1 ring-line"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-400">
                              {c.name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <span className="font-bold">{c.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{c.slug}</td>
                      <td className="font-semibold">{c.order}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <IconButton
                            label="Edit category"
                            tone="primary"
                            onClick={() => openEdit(c)}
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

      <CategoryModal
        open={modalOpen}
        category={editing}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          setPage(1);
          await reload();
        }}
      />
    </div>
  );
}
