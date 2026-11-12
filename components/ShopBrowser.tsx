"use client";

import { useEffect, useRef, useState } from "react";
import type { CategoryView, ProductView } from "@/lib/types";
import { ProductGrid, SkeletonGrid } from "./ProductGrid";

type Filters = {
  categories: string[];
  query: string;
  min: string;
  max: string;
  ageFrom: string;
  ageTo: string;
  sort: string;
};

const sorts = [
  ["popular", "Popular"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["name", "Name"],
];

export function ShopBrowser({
  initialProducts,
  categories,
  initial,
  titleAs = "h2",
}: {
  initialProducts: ProductView[];
  categories: CategoryView[];
  initial: Filters;
  titleAs?: "h1" | "h2";
}) {
  const [products, setProducts] = useState(initialProducts);
  const [filters, setFilters] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  const Title = titleAs;

  async function load(next: Filters) {
    const id = ++request.current;
    setFilters(next);
    setLoading(true);
    const params = new URLSearchParams();
    if (next.categories.length) params.set("category", next.categories.join(","));
    if (next.query.trim()) params.set("q", next.query.trim());
    if (next.min) params.set("min", next.min);
    if (next.max) params.set("max", next.max);
    if (next.ageFrom.trim()) params.set("ageFrom", next.ageFrom.trim());
    if (next.ageTo.trim()) params.set("ageTo", next.ageTo.trim());
    if (next.sort) params.set("sort", next.sort);
    try {
      const res = await fetch(`/api/catalog?${params}`, { cache: "no-store" });
      const data = (await res.json()) as { products?: ProductView[] };
      if (id !== request.current) return;
      if (res.ok && Array.isArray(data.products)) setProducts(data.products);
    } catch {
      if (id !== request.current) return;
    }
    setLoading(false);
  }

  function closeFilters() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtering = filters.categories.length > 0 || Boolean(filters.min || filters.max || filters.ageFrom || filters.ageTo) || filters.sort !== "popular";
  const countLabel = `${products.length} product${products.length === 1 ? "" : "s"}`;

  return (
    <div>
      <div className="catalog-head">
        <div>
          <Title>All toys</Title>
          <p className="muted">{loading ? "Updating…" : countLabel}</p>
        </div>
        <button
          className={`filter-open ${filtering ? "on" : ""}`}
          type="button"
          aria-expanded={open}
          onClick={() => {
            setDraft(filters);
            setOpen(true);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Filters
          <span aria-hidden="true">▾</span>
        </button>
      </div>
      {loading ? <SkeletonGrid /> : <ProductGrid products={products} />}
      {open ? (
        <div className="filter-sheet" onClick={closeFilters}>
          <form
            className="filter-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="toy-filters-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
              load(draft);
            }}
          >
            <div className="filter-card-head">
              <h2 id="toy-filters-title">Filters</h2>
              <button
                className="filter-clear"
                type="button"
                onClick={() => setDraft({ ...draft, categories: [], min: "", max: "", ageFrom: "", ageTo: "", sort: "popular" })}
              >
                Clear
              </button>
              <button className="filter-x" type="button" aria-label="Close" onClick={closeFilters}>×</button>
            </div>
            <p className="filter-note">Pick categories, then tap Apply. Closing without Apply keeps the current filter.</p>
            <label className="field">
              <span>Sort</span>
              <select value={draft.sort} onChange={(event) => setDraft({ ...draft, sort: event.target.value })}>
                {sorts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <div className="filter-block">
              <span>Category</span>
              <div className="filter-chips">
                <button className={`filter-chip ${draft.categories.length === 0 ? "on" : ""}`} type="button" onClick={() => setDraft({ ...draft, categories: [] })}>
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`filter-chip ${draft.categories.includes(category.slug) ? "on" : ""}`}
                    type="button"
                    onClick={() => setDraft({
                      ...draft,
                      categories: draft.categories.includes(category.slug)
                        ? draft.categories.filter((slug) => slug !== category.slug)
                        : [...draft.categories, category.slug],
                    })}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-block">
              <span>Price (₹)</span>
              <div className="filter-pair">
                <input inputMode="numeric" placeholder="Min" aria-label="Minimum price" value={draft.min} onChange={(event) => setDraft({ ...draft, min: event.target.value })} />
                <input inputMode="numeric" placeholder="Max" aria-label="Maximum price" value={draft.max} onChange={(event) => setDraft({ ...draft, max: event.target.value })} />
              </div>
            </div>
            <div className="filter-block">
              <span>Age range</span>
              <div className="filter-pair">
                <input inputMode="numeric" placeholder="From" aria-label="Age from" value={draft.ageFrom} onChange={(event) => setDraft({ ...draft, ageFrom: event.target.value })} />
                <input inputMode="numeric" placeholder="To" aria-label="Age to" value={draft.ageTo} onChange={(event) => setDraft({ ...draft, ageTo: event.target.value })} />
              </div>
            </div>
            <button className="primary filter-apply" type="submit">Apply filters</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
