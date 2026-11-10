import Link from "next/link";
import { Banner } from "@/components/Banner";
import { CategoryRail } from "@/components/CategoryRail";
import { ProductGrid } from "@/components/ProductGrid";
import { Reviews } from "@/components/Reviews";
import { homeData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { categories, sections } = homeData();

  return (
    <>
      <CategoryRail categories={categories} />
      <Banner />
      <section className="wrap trust">
        <article>
          <strong>Ready to run</strong>
          <span>Radios, batteries and binders included on RTR kits.</span>
        </article>
        <article>
          <strong>Free delivery</strong>
          <span>On orders over ₹2,999 inside Tamil Nadu.</span>
        </article>
        <article>
          <strong>WhatsApp orders</strong>
          <span>Ask about stock, spares or a bundle before you pay.</span>
        </article>
        <article>
          <strong>Parts in stock</strong>
          <span>Packs, chargers and alloy parts for the LMS chassis.</span>
        </article>
      </section>
      {sections.map((section) => (
        <section className="section wrap" key={section.category.id}>
          <div className="section-head">
            <h2 className="section-title">{section.category.name}</h2>
            <Link className="linkish" href={`/category/${section.category.slug}`}>
              View all
            </Link>
          </div>
          <ProductGrid products={section.products} />
        </section>
      ))}
      <Reviews />
    </>
  );
}
