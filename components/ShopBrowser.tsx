"use client";

import { useRef, useState } from "react";
import type { CategoryView, ProductView } from "@/lib/types";
import { ProductGrid, SkeletonGrid } from "./ProductGrid";

export function ShopBrowser({
  initialProducts,
  categories,
}: {
  initialProducts: ProductView[];
  categories: CategoryView[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(false);
  const request = useRef(0);

  const active = categories.find((item) => item.slug === category);

  async function load(nextCategory: string, nextQuery: string, nextSort: string) {
    const id = ++request.current;
    setCategory(nextCategory);
    setSort(nextSort);
    setLoading(true);
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextSort) params.set("sort", nextSort);
    const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
    const data = (await res.json()) as { products: ProductView[] };
    if (id !== request.current) return;
    setProducts(data.products);
    setLoading(false);
  }

  return (
    <div>
      <div className="filters">
        <div className="pills" role="tablist" aria-label="Categories">
          <button className={`pill ${category === "all" ? "on" : ""}`} type="button" onClick={() => load("all", query, sort)}>
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              className={`pill ${category === item.slug ? "on" : ""}`}
              type="button"
              onClick={() => load(item.slug, query, sort)}
            >
              {item.name} ({item.productCount})
            </button>
          ))}
        </div>
        <form
          className="shop-search"
          onSubmit={(event) => {
            event.preventDefault();
            load(category, query, sort);
          }}
        >
          <input
            value={query}
            placeholder="Search inside the shop"
            aria-label="Search inside the shop"
            onChange={(event) => setQuery(event.target.value)}
          />
          <select aria-label="Sort products" value={sort} onChange={(event) => load(category, query, event.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
          <button className="primary" type="submit">
            Search
          </button>
        </form>
      </div>
      {loading ? (
        <p className="loading-note" role="status">
          Loading {active?.name ?? "products"}…
        </p>
      ) : (
        <p className="muted" style={{ marginBottom: 10 }}>
          {products.length} product{products.length === 1 ? "" : "s"}
          {active ? ` in ${active.name}` : ""}
        </p>
      )}
      {loading ? <SkeletonGrid /> : <ProductGrid products={products} />}
    </div>
  );
}
