"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy route — product create now opens as a modal on /products. */
export default function NewProductRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/products?new=1");
  }, [router]);
  return <p className="text-sm text-muted">Opening product form…</p>;
}
