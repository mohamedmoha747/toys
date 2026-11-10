import Link from "next/link";
import type { Category } from "@/lib/types";
import { KindIcon } from "./ProductVisual";

export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <section className="rail-wrap" aria-label="Shop by category">
      <div className="wrap rail">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} className="rail-item">
            <span className="rail-bubble">
              <KindIcon kind={category.kind} />
            </span>
            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
