import type { Metadata } from "next";
import { ShopBrowser } from "@/components/ShopBrowser";
import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  const { products, categories } = listProducts();
  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="crumbs">Home / Shop</p>
        <h1>Shop</h1>
        <p className="muted">Search the catalog or load a category. Prices are in rupees.</p>
      </div>
      <ShopBrowser initialProducts={products} categories={categories} />
    </div>
  );
}
