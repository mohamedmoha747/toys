"use client";

import { useRef, useState } from "react";
import type { CategoryView, ProductView } from "@/lib/types";
import { ProductGrid, SkeletonGrid } from "./ProductGrid";

type Filters = {
  category: string;
  query: string;
  brand: string;
  age: string;
  min: string;
  max: string;
  stock: string;
  sort: string;
  deals: boolean;
};

export function ShopBrowser({
  initialProducts,
  categories,
  brands,
  ages,
  initial,
}: {
  initialProducts: ProductView[];
  categories: CategoryView[];
  brands: string[];
  ages: string[];
  initial: Filters;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [filters, setFilters] = useState(initial);
  const [loading, setLoading] = useState(false);
  const request = useRef(0);

  async function load(next: Filters) {
    const id = ++request.current;
    setFilters(next);
    setLoading(true);
    const params = new URLSearchParams();
    if (next.category !== "all") params.set("category", next.category);
    if (next.query.trim()) params.set("q", next.query.trim());
    if (next.brand) params.set("brand", next.brand);
    if (next.age) params.set("age", next.age);
    if (next.min) params.set("min", next.min);
    if (next.max) params.set("max", next.max);
    if (next.stock) params.set("stock", next.stock);
    if (next.sort) params.set("sort", next.sort);
    if (next.deals) params.set("deals", "1");
    const res = await fetch(`/api/catalog?${params}`, { cache: "no-store" });
    const data = (await res.json()) as { products: ProductView[] };
    if (id !== request.current) return;
    setProducts(data.products);
    setLoading(false);
  }

  const active = categories.find((item) => item.slug === filters.category);

  return (
    <div>
      <div className="filters">
        <div className="pills">
          <button className={`pill ${filters.category === "all" ? "on" : ""}`} type="button" onClick={() => load({ ...filters, category: "all" })}>
            All
          </button>
          {categories.map((item) => (
            <button key={item.id} className={`pill ${filters.category === item.slug ? "on" : ""}`} type="button" onClick={() => load({ ...filters, category: item.slug })}>
              {item.name}
            </button>
          ))}
        </div>
        <form
          className="shop-search"
          onSubmit={(event) => {
            event.preventDefault();
            load(filters);
          }}
        >
          <input value={filters.query} placeholder="Search toys" aria-label="Search toys" onChange={(event) => setFilters({ ...filters, query: event.target.value })} />
          <select aria-label="Brand" value={filters.brand} onChange={(event) => load({ ...filters, brand: event.target.value })}>
            <option value="">All brands</option>
            {brands.map((brand) => <option key={brand}>{brand}</option>)}
          </select>
          <select aria-label="Age group" value={filters.age} onChange={(event) => load({ ...filters, age: event.target.value })}>
            <option value="">All ages</option>
            {ages.map((age) => <option key={age} value={age}>Ages {age}</option>)}
          </select>
          <select aria-label="Availability" value={filters.stock} onChange={(event) => load({ ...filters, stock: event.target.value })}>
            <option value="">Any stock</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>
          <input value={filters.min} inputMode="numeric" placeholder="Min ₹" aria-label="Minimum price" onChange={(event) => setFilters({ ...filters, min: event.target.value })} />
          <input value={filters.max} inputMode="numeric" placeholder="Max ₹" aria-label="Maximum price" onChange={(event) => setFilters({ ...filters, max: event.target.value })} />
          <select aria-label="Sort" value={filters.sort} onChange={(event) => load({ ...filters, sort: event.target.value })}>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
          <button className="primary" type="submit">Apply</button>
        </form>
      </div>
      {loading ? <p className="loading-note" role="status">Loading {active?.name || "toys"}…</p> : <p className="muted" style={{ marginBottom: 10 }}>{products.length} toys</p>}
      {loading ? <SkeletonGrid /> : <ProductGrid products={products} />}
    </div>
  );
}
