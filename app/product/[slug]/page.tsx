import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductVisual } from "@/components/ProductVisual";
import { getProduct, relatedProducts } from "@/lib/catalog";
import { inr, stockLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = relatedProducts(product);
  const saving = product.comparePrice && product.comparePrice > product.price ? product.comparePrice - product.price : 0;

  return (
    <div className="wrap page">
      <p className="crumbs">
        <Link href="/">Home</Link> / <Link href={`/category/${product.categorySlug}`}>{product.categoryName}</Link> / {product.name}
      </p>
      <div className="detail-grid detail" style={{ marginTop: 16 }}>
        <ProductVisual kind={product.kind} tone={product.tone} />
        <div className="detail-copy">
          <p className="eyebrow">{product.categoryName}</p>
          <h1>{product.name}</h1>
          <p className="price">
            <strong style={{ fontSize: 28 }}>{inr(product.price)}</strong>
            {saving > 0 ? <s>{inr(product.comparePrice ?? 0)}</s> : null}
            {saving > 0 ? <span className="save">Save {inr(saving)}</span> : null}
          </p>
          <p className={product.stock > 0 ? "muted" : "form-error"}>{stockLabel(product.stock)}</p>
          <p>{product.description}</p>
          <ProductActions product={product} />
        </div>
      </div>
      {related.length ? (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">More in {product.categoryName}</h2>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
