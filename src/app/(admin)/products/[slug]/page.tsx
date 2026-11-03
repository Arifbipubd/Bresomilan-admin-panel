"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy route — product edit now opens as a modal on /products. */
export default function EditProductRedirectPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/products?edit=${encodeURIComponent(params.slug)}`);
  }, [params.slug, router]);
  return <p className="text-sm text-muted">Opening product editor…</p>;
}
