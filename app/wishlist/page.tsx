"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { useStore } from "@/components/StoreProvider";
import type { ProductView } from "@/lib/types";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { products: ProductView[] }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  const saved = products.filter((product) => wishlist.includes(product.id));

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Wishlist</h1>
        <p className="muted">Kits you marked with the heart.</p>
      </div>
      {loading ? <p className="loading-note">Loading wishlist…</p> : null}
      {!loading && saved.length === 0 ? (
        <div className="empty">
          <p>Nothing saved yet.</p>
          <p>
            <Link className="linkish" href="/shop">
              Find a kit
            </Link>
          </p>
        </div>
      ) : null}
      {!loading && saved.length > 0 ? <ProductGrid products={saved} /> : null}
    </div>
  );
}
