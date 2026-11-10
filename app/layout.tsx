import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StoreProvider } from "@/components/StoreProvider";
import { readDb } from "@/lib/db";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "LMS RC Toys",
    template: "%s · LMS RC Toys",
  },
  description: "Shop remote control cars, drones, boats, planes, helicopters and spare parts at LMS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { categories } = readDb();

  return (
    <html lang="en">
      <body className={outfit.className}>
        <StoreProvider>
          <Header categories={categories} />
          <main id="content">{children}</main>
          <Footer categories={categories} />
        </StoreProvider>
      </body>
    </html>
  );
}
