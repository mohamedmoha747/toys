import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { listProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const products = await listProducts(query ? { q: query } : { sort: "featured" });
  const shown = query ? products : products.filter((product) => product.featured);

  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="crumbs"><Link href="/">Home</Link> / Search</p>
        <h1>{query ? `Results for “${query}”` : "Search toys"}</h1>
        <p className="muted">{query ? `${shown.length} match${shown.length === 1 ? "" : "es"}.` : "Search by name, brand, age or category."}</p>
      </div>
      <ProductGrid products={shown} />
    </div>
  );
}
