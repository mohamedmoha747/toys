"use client";

import Link from "next/link";
import { useState } from "react";
import { inr } from "@/lib/format";
import { waLink } from "@/lib/site";
import type { ProductView } from "@/lib/types";
import { IconHeart } from "./Icons";
import { ProductVisual } from "./ProductVisual";
import { useStore } from "./StoreProvider";

export function ProductCard({ product }: { product: ProductView }) {
  const { toggleWish, wished, addQty } = useStore();
  const saved = wished(product.id);
  const [added, setAdded] = useState(false);

  function add() {
    if (product.stock <= 0) return;
    addQty(product.id, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  }

  return (
    <article className="product-card">
      <div className="visual-wrap">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          {product.images[0] ? <img className="visual" src={product.images[0]} alt="" /> : <ProductVisual kind={product.kind} tone={product.tone} />}
        </Link>
        {product.badge ? <span className="badge">{product.badge}</span> : null}
        {product.stock <= 0 ? <span className="pill-stock">Sold out</span> : null}
        <button
          className={`wish ${saved ? "on" : ""}`}
          type="button"
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          onClick={() => toggleWish(product.id)}
        >
          <IconHeart filled={saved} />
        </button>
      </div>
      <div className="card-body">
        <p>
          <Link className="cat-link" href={`/category/${product.categorySlug}`}>
            {product.categoryName}
          </Link>
        </p>
        <h3>
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="price">
          <strong>{inr(product.price)}</strong>
          {product.comparePrice && product.comparePrice > product.price ? <s>{inr(product.comparePrice)}</s> : null}
        </p>
        <div className="card-actions">
          <a
            className="wa-btn"
            href={waLink(`Hi Limee Toys, I want to know about ${product.name}.`)}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <button className="add-btn" type="button" onClick={add} disabled={product.stock <= 0}>
            {added ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
