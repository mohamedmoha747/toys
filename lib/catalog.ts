import { slugify } from "./format";
import { readDb, writeDb } from "./db";
import {
  categoryKinds,
  type Category,
  type CategoryKind,
  type CategoryView,
  type DB,
  type Product,
  type ProductView,
} from "./types";

export class CatalogError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function uniqueSlug(name: string, taken: string[]) {
  const base = slugify(name) || "item";
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function enrich(db: DB, product: Product): ProductView {
  const category = db.categories.find((item) => item.id === product.categoryId);
  return {
    ...product,
    categoryName: category?.name ?? "Shop",
    categorySlug: category?.slug ?? "shop",
    kind: category?.kind ?? "parts",
  };
}

function withCounts(db: DB): CategoryView[] {
  return db.categories.map((category) => ({
    ...category,
    productCount: db.products.filter((product) => product.categoryId === category.id).length,
  }));
}

export function listProducts(opts: { category?: string; q?: string; sort?: string } = {}) {
  const db = readDb();
  let products = db.products.map((product) => enrich(db, product));

  if (opts.category && opts.category !== "all") {
    const key = opts.category.toLowerCase();
    products = products.filter(
      (product) => product.categorySlug === key || product.categoryId === opts.category,
    );
  }

  if (opts.q?.trim()) {
    const query = opts.q.trim().toLowerCase();
    products = products.filter((product) =>
      [product.name, product.description, product.categoryName, product.badge ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  if (opts.sort === "price-asc") products.sort((a, b) => a.price - b.price);
  else if (opts.sort === "price-desc") products.sort((a, b) => b.price - a.price);
  else if (opts.sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));
  else products.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));

  return { products, categories: withCounts(db) };
}

export function getProduct(key: string) {
  const db = readDb();
  const product = db.products.find((item) => item.id === key || item.slug === key);
  return product ? enrich(db, product) : null;
}

export function relatedProducts(product: ProductView, limit = 4) {
  const db = readDb();
  return db.products
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, limit)
    .map((item) => enrich(db, item));
}

export function getCategoryBundle(key: string) {
  const db = readDb();
  const category = db.categories.find((item) => item.id === key || item.slug === key);
  if (!category) return null;
  return {
    category,
    products: db.products
      .filter((product) => product.categoryId === category.id)
      .map((product) => enrich(db, product)),
  };
}

export function homeData() {
  const db = readDb();
  return {
    categories: db.categories,
    sections: db.categories
      .map((category) => ({
        category,
        products: db.products
          .filter((product) => product.categoryId === category.id)
          .slice()
          .sort((a, b) => Number(b.featured) - Number(a.featured))
          .slice(0, 4)
          .map((product) => enrich(db, product)),
      }))
      .filter((section) => section.products.length > 0),
  };
}

function cleanProduct(body: Record<string, unknown>, db: DB, id?: string): Product {
  const name = String(body.name ?? "").trim().slice(0, 80);
  if (name.length < 2) throw new CatalogError("Product name is required");

  const categoryId = String(body.categoryId ?? "");
  if (!db.categories.some((category) => category.id === categoryId)) {
    throw new CatalogError("Choose a category");
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) throw new CatalogError("Enter a valid price");

  const compareRaw = body.comparePrice;
  let comparePrice: number | null = null;
  if (compareRaw !== "" && compareRaw != null) {
    comparePrice = Number(compareRaw);
    if (!Number.isFinite(comparePrice) || comparePrice < 0) {
      throw new CatalogError("Enter a valid compare price");
    }
    comparePrice = Math.round(comparePrice);
  }

  const stock = Number(body.stock);
  if (!Number.isInteger(stock) || stock < 0) throw new CatalogError("Stock must be a whole number");

  const description = String(body.description ?? "").trim().slice(0, 600);
  if (description.length < 10) throw new CatalogError("Add a short description");

  const tone = /^#[0-9a-fA-F]{6}$/.test(String(body.tone || "")) ? String(body.tone) : "#f5a524";
  const badge = String(body.badge ?? "").trim().slice(0, 16) || null;
  const taken = db.products.filter((product) => product.id !== id).map((product) => product.slug);

  return {
    id: id ?? `p-${crypto.randomUUID().slice(0, 8)}`,
    name,
    slug: uniqueSlug(name, taken),
    categoryId,
    price: Math.round(price),
    comparePrice,
    stock,
    description,
    tone,
    featured: Boolean(body.featured),
    badge,
  };
}

function cleanCategory(body: Record<string, unknown>, db: DB, id?: string): Category {
  const name = String(body.name ?? "").trim().slice(0, 40);
  if (name.length < 2) throw new CatalogError("Category name is required");

  const kind = String(body.kind ?? "") as CategoryKind;
  if (!categoryKinds.includes(kind)) throw new CatalogError("Choose a category type");

  const description = String(body.description ?? "").trim().slice(0, 240);
  if (description.length < 8) throw new CatalogError("Add a short description");

  const taken = db.categories.filter((category) => category.id !== id).map((category) => category.slug);
  return {
    id: id ?? `cat-${crypto.randomUUID().slice(0, 8)}`,
    name,
    slug: uniqueSlug(name, taken),
    kind,
    description,
  };
}

export function createProduct(body: Record<string, unknown>) {
  const db = readDb();
  const product = cleanProduct(body, db);
  db.products.unshift(product);
  writeDb(db);
  return enrich(db, product);
}

export function updateProduct(id: string, body: Record<string, unknown>) {
  const db = readDb();
  const index = db.products.findIndex((product) => product.id === id);
  if (index < 0) throw new CatalogError("Product not found", 404);
  const product = cleanProduct(body, db, id);
  db.products[index] = product;
  writeDb(db);
  return enrich(db, product);
}

export function deleteProduct(id: string) {
  const db = readDb();
  const next = db.products.filter((product) => product.id !== id);
  if (next.length === db.products.length) throw new CatalogError("Product not found", 404);
  db.products = next;
  writeDb(db);
}

export function createCategory(body: Record<string, unknown>) {
  const db = readDb();
  const category = cleanCategory(body, db);
  db.categories.push(category);
  writeDb(db);
  return { ...category, productCount: 0 };
}

export function updateCategory(id: string, body: Record<string, unknown>) {
  const db = readDb();
  const index = db.categories.findIndex((category) => category.id === id);
  if (index < 0) throw new CatalogError("Category not found", 404);
  const category = cleanCategory(body, db, id);
  db.categories[index] = category;
  writeDb(db);
  return {
    ...category,
    productCount: db.products.filter((product) => product.categoryId === id).length,
  };
}

export function deleteCategory(id: string) {
  const db = readDb();
  if (!db.categories.some((category) => category.id === id)) {
    throw new CatalogError("Category not found", 404);
  }
  if (db.products.some((product) => product.categoryId === id)) {
    throw new CatalogError("Delete or move this category's products first");
  }
  db.categories = db.categories.filter((category) => category.id !== id);
  writeDb(db);
}
