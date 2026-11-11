import { Banner } from "@/components/Banner";
import { CategoryRail } from "@/components/CategoryRail";
import { ProductGrid } from "@/components/ProductGrid";
import { Reviews } from "@/components/Reviews";
import { homeData } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await homeData();

  return (
    <>
      <CategoryRail categories={data.categories} />
      <Banner slides={data.banners} />
      <section className="section wrap">
        <div className="section-head">
          <h2 className="section-title">All products</h2>
        </div>
        <ProductGrid products={data.products} />
      </section>
      <Reviews reviews={data.reviews} />
    </>
  );
}
