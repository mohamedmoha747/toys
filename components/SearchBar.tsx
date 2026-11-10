"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ProductView } from "@/lib/types";
import { inr } from "@/lib/format";
import { IconSearch } from "./Icons";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ProductView[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      setBusy(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      setBusy(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { cache: "no-store" });
        const data = (await res.json()) as { products: ProductView[] };
        setHits(data.products.slice(0, 6));
        setOpen(true);
      } finally {
        setBusy(false);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    function close() {
      setOpen(false);
    }
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="search" onClick={(event) => event.stopPropagation()}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setOpen(false);
          router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <input
          name="q"
          value={q}
          placeholder="Search for products"
          aria-label="Search for products"
          onChange={(event) => setQ(event.target.value)}
          onFocus={() => hits.length && setOpen(true)}
        />
        <button type="submit" aria-label="Search">
          <IconSearch />
        </button>
      </form>
      {open && q.trim().length >= 2 ? (
        <div className="suggest">
          {busy ? <p className="muted">Searching…</p> : null}
          {!busy && hits.length === 0 ? <p className="muted">No matches for “{q.trim()}”.</p> : null}
          {hits.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={() => setOpen(false)}
            >
              <span>{product.name}</span>
              <small>
                {product.categoryName} · {inr(product.price)}
              </small>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
