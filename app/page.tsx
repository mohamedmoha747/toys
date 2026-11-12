import { Banner } from "@/components/Banner";
import { CategoryRail } from "@/components/CategoryRail";
import { Reviews } from "@/components/Reviews";
import { ShopBrowser } from "@/components/ShopBrowser";
import { homeData } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await homeData();

  return (
    <>
      <CategoryRail categories={data.categories} />
      <Banner slides={data.banners} />
      <section className="section wrap">
        <ShopBrowser
          initialProducts={data.products}
          categories={data.categories}
          initial={{ categories: [], query: "", min: "", max: "", ageFrom: "", ageTo: "", sort: "popular" }}
        />
      </section>
      <Reviews reviews={data.reviews} />
    </>
  );
}
