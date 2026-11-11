import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductGrid } from "@/components/ProductGrid";
import { ReviewBox } from "@/components/ReviewBox";
import { getProduct, listReviews, relatedProducts } from "@/lib/shop";
import { inr, stockLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name || "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.active) notFound();
  const [related, reviews] = await Promise.all([relatedProducts(product), listReviews(product.id, true)]);

  return (
    <div className="wrap page">
      <p className="crumbs">
        <Link href="/">Home</Link> / <Link href={`/category/${product.categorySlug}`}>{product.categoryName}</Link> / {product.name}
      </p>
      <div className="detail-grid detail" style={{ marginTop: 16 }}>
        <ProductGallery product={product} />
        <div className="detail-copy">
          <p className="eyebrow">{product.brand} · Ages {product.ageGroup}</p>
          {product.title ? <p className="muted">{product.title}</p> : null}
          <h1>{product.name}</h1>
          <p className="price">
            <strong style={{ fontSize: 28 }}>{inr(product.price)}</strong>
            {product.comparePrice ? <span className="muted">Our price</span> : null}
            {product.comparePrice ? <s>MRP {inr(product.comparePrice)}</s> : null}
          </p>
          <p className={product.stock > 0 ? "muted" : "form-error"}>{stockLabel(product.stock)} · SKU {product.sku}</p>
          <p>{product.description}</p>
          <ProductActions product={product} />
        </div>
      </div>
      <ReviewBox productId={product.id} reviews={reviews} />
      {related.length ? (
        <section className="section">
          <div className="section-head"><h2 className="section-title">Related toys</h2></div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
