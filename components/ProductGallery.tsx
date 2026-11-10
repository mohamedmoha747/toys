"use client";

import { useState } from "react";
import type { ProductView } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";

export function ProductGallery({ product }: { product: ProductView }) {
  const [index, setIndex] = useState(0);
  const image = product.images[index];
  return (
    <div>
      {image ? <img className="visual" src={image} alt={product.name} /> : <ProductVisual kind={product.kind} tone={product.tone} />}
      {product.images.length > 1 ? (
        <div className="pills" style={{ marginTop: 8 }}>
          {product.images.map((src, imageIndex) => (
            <button key={src} className={`pill ${imageIndex === index ? "on" : ""}`} type="button" onClick={() => setIndex(imageIndex)}>
              Photo {imageIndex + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
