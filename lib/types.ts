export const categoryKinds = ["car", "drone", "boat", "plane", "heli", "parts"] as const;

export type CategoryKind = (typeof categoryKinds)[number];

export const kindLabel: Record<CategoryKind, string> = {
  car: "RC car",
  drone: "Drone",
  boat: "Boat",
  plane: "Plane",
  heli: "Helicopter",
  parts: "Parts",
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  kind: CategoryKind;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  description: string;
  tone: string;
  featured: boolean;
  badge: string | null;
};

export type ProductView = Product & {
  categoryName: string;
  categorySlug: string;
  kind: CategoryKind;
};

export type CategoryView = Category & {
  productCount: number;
};

export type DB = {
  categories: Category[];
  products: Product[];
};
