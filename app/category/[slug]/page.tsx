"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ProductGrid, SkeletonGrid } from "@/components/ProductGrid";
import type { Category, ProductView } from "@/lib/types";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    fetch(`/api/categories/${slug}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Category not found");
        return data as { category: Category; products: ProductView[] };
      })
      .then((data) => {
        if (!live) return;
        setCategory(data.category);
        setProducts(data.products);
      })
      .catch((err: Error) => {
        if (!live) return;
        setCategory(null);
        setProducts([]);
        setError(err.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [slug]);

  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
          {category ? ` / ${category.name}` : ""}
        </p>
        {loading ? <div className="skeleton title-skel" /> : <h1>{category?.name ?? "Category"}</h1>}
        {category ? <p className="muted">{category.description}</p> : null}
      </div>
      {loading ? (
        <>
          <p className="loading-note" role="status">
            Loading category…
          </p>
          <SkeletonGrid />
        </>
      ) : null}
      {!loading && error ? (
        <div className="empty">
          <p>{error}</p>
          <p>
            <Link className="linkish" href="/shop">
              Back to the shop
            </Link>
          </p>
        </div>
      ) : null}
      {!loading && !error ? <ProductGrid products={products} /> : null}
    </div>
  );
}
