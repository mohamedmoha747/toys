import type { Metadata } from "next";
import { ShopBrowser } from "@/components/ShopBrowser";
import { filterMeta, listProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; brand?: string; age?: string; min?: string; max?: string; sort?: string; deals?: string }>;
}) {
  const params = await searchParams;
  const initial = {
    category: params.category || "all",
    query: params.q || "",
    brand: params.brand || "",
    age: params.age || "",
    min: params.min || "",
    max: params.max || "",
    stock: "",
    sort: params.sort || "featured",
    deals: params.deals === "1",
  };
  const [products, meta] = await Promise.all([
    listProducts({
      category: initial.category,
      q: initial.query,
      brand: initial.brand,
      age: initial.age,
      min: Number(initial.min) || undefined,
      max: Number(initial.max) || undefined,
      sort: initial.sort,
      deals: initial.deals,
    }),
    filterMeta(),
  ]);

  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="crumbs">Home / Shop</p>
        <h1>{initial.category === "all" ? "All products" : "Shop"}</h1>
        <p className="muted">All products are listed here. Choose a category when you want a smaller set.</p>
      </div>
      <ShopBrowser initialProducts={products} categories={meta.categories} brands={meta.brands} ages={meta.ages} initial={initial} />
    </div>
  );
}
