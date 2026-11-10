"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductVisual } from "@/components/ProductVisual";
import { useStore } from "@/components/StoreProvider";
import { inr } from "@/lib/format";
import { waLink } from "@/lib/site";
import type { ProductView } from "@/lib/types";

export default function CartPage() {
  const { lines, setQty, remove } = useStore();
  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { products: ProductView[] }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  const rows = lines.map((line) => ({
    line,
    product: products.find((item) => item.id === line.id) ?? null,
  }));
  const total = rows.reduce((sum, row) => sum + (row.product?.price ?? 0) * row.line.qty, 0);
  const summary = rows
    .filter((row) => row.product)
    .map((row) => `${row.line.qty} x ${row.product?.name}`)
    .join(", ");

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Cart</h1>
        <p className="muted">Review the kits, then send the list on WhatsApp to confirm stock.</p>
      </div>
      {loading ? <p className="loading-note">Loading cart…</p> : null}
      {!loading && rows.length === 0 ? (
        <div className="empty">
          <p>Your cart is empty.</p>
          <p>
            <Link className="linkish" href="/shop">
              Browse the shop
            </Link>
          </p>
        </div>
      ) : null}
      {rows.length > 0 ? (
        <div className="cart-layout" style={{ display: "grid", gap: 16 }}>
          <div className="cart-list">
            {rows.map(({ line, product }) => (
              <article className="cart-row" key={line.id}>
                {product ? <ProductVisual kind={product.kind} tone={product.tone} /> : <div className="visual" />}
                <div>
                  {product ? (
                    <h2>
                      <Link href={`/product/${product.slug}`}>{product.name}</Link>
                    </h2>
                  ) : (
                    <h2>This product was removed</h2>
                  )}
                  <p className="price">
                    <strong>{product ? inr(product.price) : "—"}</strong>
                  </p>
                  <div className="qty" style={{ marginTop: 8 }}>
                    <button type="button" aria-label="Decrease" onClick={() => setQty(line.id, line.qty - 1)}>
                      −
                    </button>
                    <strong>{line.qty}</strong>
                    <button type="button" aria-label="Increase" onClick={() => setQty(line.id, line.qty + 1)}>
                      +
                    </button>
                    <button className="text-btn danger" type="button" onClick={() => remove(line.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="summary">
            <p className="total">
              Total <strong>{inr(total)}</strong>
            </p>
            <p className="muted">{total >= 2999 ? "This order qualifies for free Tamil Nadu delivery." : "Add a little more for free delivery over ₹2,999."}</p>
            <a className="wa-btn" href={waLink(`Hi LMS, I want to order: ${summary}. Total ${inr(total)}.`)}>
              Checkout on WhatsApp
            </a>
            <Link className="ghost" href="/shop">
              Continue shopping
            </Link>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
