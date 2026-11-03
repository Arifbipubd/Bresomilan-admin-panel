"use client";

import { Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProductModal } from "@/components/products/ProductModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAGE_SIZE, Pagination, paginate } from "@/components/ui/Pagination";
import { deleteProduct, fetchProducts } from "@/lib/api/admin";
import type { AdminProductListItem } from "@/lib/types";
import { formatBdt } from "@/lib/utils";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; slug?: string } | null>(null);

  async function reload(q = search) {
    setLoading(true);
    try {
      setProducts(await fetchProducts({ search: q || undefined }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const create = searchParams.get("new");
    const edit = searchParams.get("edit");
    if (create === "1") setModal({ mode: "create" });
    else if (edit) setModal({ mode: "edit", slug: edit });
  }, [searchParams]);

  const paged = useMemo(() => paginate(products, page, PAGE_SIZE), [products, page]);

  function closeModal() {
    setModal(null);
    if (searchParams.has("new") || searchParams.has("edit")) {
      router.replace("/products");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Inventory, pricing, and merchandising flags."
        actions={
          <Button variant="accent" onClick={() => setModal({ mode: "create" })}>
            New product
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <input
          type="search"
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ui-input max-w-sm"
        />
      </Card>

      <Card flush>
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading…</p>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products"
            description="Create your first catalogue item."
            action={
              <Button variant="primary" onClick={() => setModal({ mode: "create" })}>
                New product
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Flags</th>
                    <th className="w-[1%] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", slug: p.slug })}
                          className="flex cursor-pointer items-center gap-3 text-left hover:opacity-90"
                        >
                          {p.primary_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.primary_image}
                              alt=""
                              className="h-11 w-11 rounded-xl object-cover ring-1 ring-line"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-xl bg-canvas" />
                          )}
                          <span className="font-bold text-ink">{p.name}</span>
                        </button>
                      </td>
                      <td className="text-muted">{p.category_name}</td>
                      <td className="font-semibold">{formatBdt(p.price)}</td>
                      <td className={`font-bold ${p.stock <= 5 ? "text-danger" : ""}`}>{p.stock}</td>
                      <td className="text-xs font-semibold text-muted">
                        {[p.featured && "Featured", p.bestseller && "Bestseller", p.new_arrival && "New"]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <IconButton
                            label="Edit product"
                            tone="primary"
                            onClick={() => setModal({ mode: "edit", slug: p.slug })}
                          >
                            <Pencil className="h-4 w-4" />
                          </IconButton>
                          <ConfirmButton
                            iconOnly
                            label="Delete product"
                            title="Delete product?"
                            description={`Remove “${p.name}” permanently.`}
                            confirmLabel="Delete"
                            onConfirm={async () => {
                              await deleteProduct(p.slug);
                              toast.success("Product deleted");
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

      <ProductModal
        open={!!modal}
        mode={modal?.mode ?? "create"}
        slug={modal?.slug}
        onClose={closeModal}
        onSaved={() => reload()}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <ProductsContent />
    </Suspense>
  );
}
