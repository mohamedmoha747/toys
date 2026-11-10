import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const { products } = listProducts(query ? { q: query } : {});
  const shown = query ? products : products.filter((product) => product.featured);

  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="crumbs">
          <Link href="/">Home</Link> / Search
        </p>
        <h1>{query ? `Results for “${query}”` : "Search products"}</h1>
        <p className="muted">
          {query
            ? `${shown.length} match${shown.length === 1 ? "" : "es"}.`
            : "Use the search bar for a name, a category, or a kit type."}
        </p>
      </div>
      <ProductGrid products={shown} />
    </div>
  );
}
