import Link from "next/link";
import { Banner } from "@/components/Banner";
import { CategoryRail } from "@/components/CategoryRail";
import { ProductGrid } from "@/components/ProductGrid";
import { Reviews } from "@/components/Reviews";
import { homeData } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await homeData();
  const sections = [
    ["Featured", data.featured],
    ["New arrivals", data.newest],
    ["Best sellers", data.best],
    ["Discounts", data.deals],
  ] as const;

  return (
    <>
      <CategoryRail categories={data.categories} />
      <Banner slides={data.banners} />
      <section className="wrap trust">
        <article>
          <strong>Shop by age</strong>
          <span>{data.ages.map((age) => age).join(" · ")}</span>
        </article>
        <article>
          <strong>Free delivery</strong>
          <span>On orders over ₹{data.settings.freeDeliveryOver.toLocaleString("en-IN")} in {data.settings.serviceAreas}.</span>
        </article>
        <article>
          <strong>WhatsApp orders</strong>
          <span>Review the cart, then send the full order on WhatsApp.</span>
        </article>
        <article>
          <strong>Brands</strong>
          <span>{data.brands.join(", ")}</span>
        </article>
      </section>
      <section className="wrap" style={{ display: "flex", gap: 8, overflow: "auto", paddingBottom: 8 }}>
        {data.ages.map((age) => (
          <Link key={age} className="pill" href={`/shop?age=${age}`}>
            Ages {age}
          </Link>
        ))}
        {data.brands.map((brand) => (
          <Link key={brand} className="pill" href={`/shop?brand=${encodeURIComponent(brand)}`}>
            {brand}
          </Link>
        ))}
        <Link className="pill" href="/shop?max=499">Under ₹499</Link>
        <Link className="pill" href="/shop?min=500&max=1499">₹500–₹1,499</Link>
        <Link className="pill" href="/shop?min=1500">₹1,500+</Link>
      </section>
      {sections.map(([title, products]) =>
        products.length ? (
          <section className="section wrap" key={title}>
            <div className="section-head">
              <h2 className="section-title">{title}</h2>
              <Link className="linkish" href={title === "Discounts" ? "/shop?deals=1" : "/shop"}>
                View all
              </Link>
            </div>
            <ProductGrid products={[...products]} />
          </section>
        ) : null,
      )}
      <Reviews reviews={data.reviews} />
    </>
  );
}
