"use client";

import { useState } from "react";
import { waLink } from "@/lib/site";
import type { ProductView } from "@/lib/types";
import { useStore } from "./StoreProvider";

export function ProductActions({ product }: { product: ProductView }) {
  const { addQty } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const max = Math.max(product.stock, 0);

  return (
    <div className="buy-row">
      <div className="qty">
        <button type="button" aria-label="Decrease quantity" onClick={() => setQty((value) => Math.max(1, value - 1))} disabled={max === 0}>
          −
        </button>
        <strong>{qty}</strong>
        <button type="button" aria-label="Increase quantity" onClick={() => setQty((value) => Math.min(max || 1, value + 1))} disabled={max === 0}>
          +
        </button>
      </div>
      <button
        className="primary"
        type="button"
        disabled={max === 0}
        onClick={() => {
          addQty(product.id, qty);
          setAdded(true);
        }}
      >
        {max === 0 ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
      </button>
      <a className="wa-btn" href={waLink(`Hi Limee Toys, I want to order ${qty} x ${product.name}.`)} target="_blank" rel="noreferrer">
        WhatsApp enquiry
      </a>
    </div>
  );
}
