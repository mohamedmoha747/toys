import { Banner } from "@/components/Banner";
import { CategoryRail } from "@/components/CategoryRail";
import { ProductGrid } from "@/components/ProductGrid";
import { Reviews } from "@/components/Reviews";
import { homeData, listProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [data, products] = await Promise.all([homeData(), listProducts({})]);

  return (
    <>
      <CategoryRail categories={data.categories} />
      <Banner slides={data.banners} />
      <section className="section wrap">
        <div className="section-head">
          <h2 className="section-title">All products</h2>
        </div>
        <ProductGrid products={products} />
      </section>
      <Reviews reviews={data.reviews} />
    </>
  );
}
