import type { ProductView } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: ProductView[] }) {
  if (!products.length) {
    return <p className="empty">No products match this view yet. Try another category or search.</p>;
  }
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton card-skel" key={index} />
      ))}
    </div>
  );
}
