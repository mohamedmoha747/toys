import type { Metadata } from "next";
import { ShopBrowser } from "@/components/ShopBrowser";
import { filterMeta, listProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

function optionalNumber(value?: string) {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; min?: string; max?: string; ageFrom?: string; ageTo?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const categories = params.category && params.category !== "all" ? params.category.split(",").map((item) => item.trim()).filter(Boolean) : [];
  const initial = {
    categories,
    query: params.q || "",
    min: params.min || "",
    max: params.max || "",
    ageFrom: params.ageFrom || "",
    ageTo: params.ageTo || "",
    sort: params.sort || "popular",
  };
  const [products, meta] = await Promise.all([
    listProducts({
      category: categories.join(",") || "all",
      q: initial.query,
      min: optionalNumber(initial.min),
      max: optionalNumber(initial.max),
      ageFrom: optionalNumber(initial.ageFrom),
      ageTo: optionalNumber(initial.ageTo),
      sort: initial.sort,
    }),
    filterMeta(),
  ]);

  return (
    <div className="wrap page">
      <p className="crumbs"><a href="/">Home</a> / Shop</p>
      <ShopBrowser initialProducts={products} categories={meta.categories} initial={initial} titleAs="h1" />
    </div>
  );
}
