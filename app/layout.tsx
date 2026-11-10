import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StoreProvider } from "@/components/StoreProvider";
import { getSettings, listCategories } from "@/lib/shop";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Limee Toys", template: "%s · Limee Toys" },
  description: "Shop baby toys, educational toys, remote-control cars, soft toys, blocks, games and outdoor toys at Limee Toys.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([listCategories(), getSettings()]);
  return (
    <html lang="en">
      <body className={outfit.className}>
        <StoreProvider>
          <Header categories={categories} settings={settings} />
          <main id="content">{children}</main>
          <Footer categories={categories} settings={settings} />
        </StoreProvider>
      </body>
    </html>
  );
}
