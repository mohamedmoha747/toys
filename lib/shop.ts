import bcrypt from "bcryptjs";
import { slugify } from "./format";
import { connectDb } from "./mongodb";
import { ServiceError } from "./errors";
import {
  ActivityModel,
  BannerModel,
  CategoryModel,
  ProductModel,
  ReviewModel,
  SettingsModel,
  UserModel,
} from "./models";
import type { BannerSlide, Category, CategoryKind, CategoryView, ProductView, PublicSettings, ReviewView, SessionUser } from "./types";
import { inr } from "./format";

type LeanCategory = { _id: unknown; name: string; slug: string; kind: CategoryKind; description?: string };
type LeanProduct = {
  _id: unknown;
  name: string;
  title?: string;
  slug: string;
  description?: string;
  brand?: string;
  ageGroup?: string;
  sku?: string;
  category?: LeanCategory | null;
  images?: string[];
  tone?: string;
  kind?: CategoryKind;
  cost?: number;
  price: number;
  discountPrice?: number | null;
  tax?: number;
  stock?: number;
  minStock?: number;
  active?: boolean;
  featured?: boolean;
  arrival?: boolean;
  bestSeller?: boolean;
  createdAt?: Date;
};

function payable(price: number, discountPrice?: number | null) {
  if (discountPrice && discountPrice > 0 && discountPrice < price) return discountPrice;
  return price;
}

export function toProduct(doc: LeanProduct, revealCost = false): ProductView {
  const price = payable(doc.price, doc.discountPrice);
  const category = doc.category;
  let badge: string | null = null;
  if ((doc.stock || 0) > 0 && (doc.stock || 0) <= (doc.minStock || 0)) badge = "Low stock";
  if (doc.arrival) badge = "New";
  if (doc.bestSeller) badge = badge || "Popular";
  if (price < doc.price) badge = "Sale";
  return {
    id: String(doc._id),
    name: doc.name,
    title: doc.title || "",
    slug: doc.slug,
    description: doc.description || "",
    brand: doc.brand || "Limee Toys",
    ageGroup: doc.ageGroup || "",
    sku: doc.sku || "",
    categoryId: category ? String(category._id) : "",
    categoryName: category?.name || "Shop",
    categorySlug: category?.slug || "shop",
    kind: doc.kind || category?.kind || "parts",
    price,
    comparePrice: price < doc.price ? doc.price : null,
    cost: revealCost ? doc.cost || 0 : 0,
    tax: doc.tax || 0,
    stock: doc.stock || 0,
    minStock: doc.minStock || 0,
    images: doc.images || [],
    tone: doc.tone || "#f5a524",
    featured: Boolean(doc.featured),
    isNew: Boolean(doc.arrival),
    bestSeller: Boolean(doc.bestSeller),
    active: doc.active !== false,
    badge,
  };
}

function toCategory(doc: LeanCategory): Category {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    kind: doc.kind,
    description: doc.description || "",
  };
}

export function digits(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function getSettings(): Promise<PublicSettings> {
  await connectDb();
  const doc = await SettingsModel.findOne().lean();
  const settings = (doc || {}) as {
    storeName?: string;
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
    deliveryCharge?: number;
    freeDeliveryOver?: number;
    serviceAreas?: string;
    hours?: string;
    policies?: PublicSettings["policies"];
  };
  const phone = settings.phone || "+91 98765 43210";
  return {
    storeName: settings.storeName || "Limee Toys",
    phone,
    phoneTel: digits(settings.whatsapp || phone),
    email: settings.email || "info@limeetoys.com",
    address: settings.address || "Chennai, Tamil Nadu, India",
    whatsapp: settings.whatsapp || phone,
    deliveryCharge: settings.deliveryCharge ?? 99,
    freeDeliveryOver: settings.freeDeliveryOver ?? 2999,
    serviceAreas: settings.serviceAreas || "Chennai, Tamil Nadu",
    hours: settings.hours || "24/7 Available",
    policies: {
      shipping: settings.policies?.shipping || "",
      returns: settings.policies?.returns || "",
      privacy: settings.policies?.privacy || "",
      terms: settings.policies?.terms || "",
    },
  };
}

export async function listCategories(): Promise<CategoryView[]> {
  await connectDb();
  const categories = (await CategoryModel.find().sort({ name: 1 }).lean()) as unknown as LeanCategory[];
  const counts = await ProductModel.aggregate<{ _id: unknown; count: number }>([
    { $match: { active: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((row) => [String(row._id), row.count]));
  return categories.map((category) => ({ ...toCategory(category), productCount: byId.get(String(category._id)) || 0 }));
}

export type CatalogQuery = {
  category?: string;
  q?: string;
  brand?: string;
  age?: string;
  min?: number;
  max?: number;
  stock?: string;
  sort?: string;
  deals?: boolean;
  ids?: string[];
  includeInactive?: boolean;
};

export async function listProducts(query: CatalogQuery = {}) {
  await connectDb();
  const filter: Record<string, unknown> = {};
  if (!query.includeInactive) filter.active = true;
  if (query.ids?.length) filter._id = { $in: query.ids.filter((id) => /^[a-f0-9]{24}$/i.test(id)) };
  const docs = (await ProductModel.find(filter).populate("category").sort({ createdAt: -1 }).lean()) as unknown as LeanProduct[];
  let items = docs.map((doc) => ({ view: toProduct(doc, query.includeInactive), createdAt: new Date(doc.createdAt || 0).getTime() }));

  if (query.category && query.category !== "all") {
    const key = query.category.toLowerCase();
    items = items.filter((item) => item.view.categorySlug === key || item.view.categoryId === query.category);
  }
  if (query.brand) items = items.filter((item) => item.view.brand.toLowerCase() === query.brand!.toLowerCase());
  if (query.age) items = items.filter((item) => item.view.ageGroup === query.age);
  if (query.deals) items = items.filter((item) => item.view.comparePrice);
  if (query.stock === "in") items = items.filter((item) => item.view.stock > 0);
  if (query.stock === "out") items = items.filter((item) => item.view.stock <= 0);
  if (query.min) items = items.filter((item) => item.view.price >= query.min!);
  if (query.max) items = items.filter((item) => item.view.price <= query.max!);
  if (query.q?.trim()) {
    const q = query.q.trim().toLowerCase();
    items = items.filter((item) =>
      [item.view.name, item.view.description, item.view.brand, item.view.categoryName, item.view.sku, item.view.ageGroup]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  if (query.sort === "price-asc") items.sort((a, b) => a.view.price - b.view.price);
  else if (query.sort === "price-desc") items.sort((a, b) => b.view.price - a.view.price);
  else if (query.sort === "name") items.sort((a, b) => a.view.name.localeCompare(b.view.name));
  else if (query.sort === "newest") items.sort((a, b) => b.createdAt - a.createdAt);
  else items.sort((a, b) => Number(b.view.featured) - Number(a.view.featured) || a.view.name.localeCompare(b.view.name));

  return items.map((item) => item.view);
}

export async function getProduct(key: string, revealCost = false) {
  await connectDb();
  const doc = (await ProductModel.findOne({ $or: [{ slug: key }, { sku: key }] })
    .populate("category")
    .lean()) as LeanProduct | null;
  let found = doc;
  if (!found && /^[a-f0-9]{24}$/i.test(key)) {
    found = (await ProductModel.findById(key).populate("category").lean()) as LeanProduct | null;
  }
  if (!found) return null;
  return toProduct(found, revealCost);
}

export async function relatedProducts(product: ProductView) {
  const items = await listProducts({ category: product.categorySlug });
  return items.filter((item) => item.id !== product.id).slice(0, 4);
}

export async function listBanners(): Promise<BannerSlide[]> {
  await connectDb();
  const docs = await BannerModel.find({ active: true }).sort({ sort: 1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    eyebrow: String(doc.eyebrow || ""),
    title: String(doc.title || ""),
    text: String(doc.text || ""),
    href: String(doc.href || "/shop"),
    cta: String(doc.cta || "Shop"),
    tone: String(doc.tone || "#f5a524"),
    kind: (doc.kind || "parts") as CategoryKind,
  }));
}

export async function homeData() {
  await connectDb();
  const [products, categories, banners, settings, reviewDocs] = await Promise.all([
    listProducts({}),
    listCategories(),
    listBanners(),
    getSettings(),
    ReviewModel.find({ approved: true }).sort({ createdAt: -1 }).limit(8).lean(),
  ]);
  return {
    settings,
    categories,
    banners,
    reviews: reviewDocs.map((doc) => ({
      name: String(doc.authorName || "Customer"),
      text: String(doc.text || ""),
      rating: Number(doc.rating || 5),
    })),
    featured: products.filter((item) => item.featured).slice(0, 4),
    newest: products.filter((item) => item.isNew).slice(0, 4),
    best: products.filter((item) => item.bestSeller).slice(0, 4),
    deals: products.filter((item) => item.comparePrice).slice(0, 4),
    brands: [...new Set(products.map((item) => item.brand))].sort(),
    ages: [...new Set(products.map((item) => item.ageGroup))],
  };
}

export async function filterMeta() {
  const products = await listProducts({});
  const categories = await listCategories();
  return {
    categories,
    brands: [...new Set(products.map((item) => item.brand))].sort(),
    ages: [...new Set(products.map((item) => item.ageGroup))],
  };
}

export async function listReviews(productId: string, approvedOnly = false): Promise<ReviewView[]> {
  await connectDb();
  const filter: Record<string, unknown> = { product: productId };
  if (approvedOnly) filter.approved = true;
  const docs = await ReviewModel.find(filter).sort({ createdAt: -1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    productId: String(doc.product),
    authorName: String(doc.authorName || "Customer"),
    rating: Number(doc.rating || 0),
    text: String(doc.text || ""),
    approved: Boolean(doc.approved),
    createdAt: new Date(doc.createdAt || Date.now()).toISOString(),
  }));
}

export async function addReview(input: { productId: string; authorName: string; rating: number; text: string; userId?: string }) {
  await connectDb();
  const product = await ProductModel.findById(input.productId);
  if (!product) throw new ServiceError("Product not found", 404);
  if (!input.authorName.trim()) throw new ServiceError("Name is required");
  if (input.rating < 1 || input.rating > 5) throw new ServiceError("Rating must be from 1 to 5");
  const doc = await ReviewModel.create({
    product: product._id,
    user: input.userId || null,
    authorName: input.authorName.trim().slice(0, 60),
    rating: input.rating,
    text: input.text.trim().slice(0, 600),
    approved: false,
  });
  return listReviews(String(product._id)).then((items) => items.find((item) => item.id === String(doc._id)));
}

export async function registerCustomer(input: { name: string; email: string; mobile: string; password: string }) {
  await connectDb();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const mobile = digits(input.mobile);
  if (name.length < 2) throw new ServiceError("Name is required");
  if (!email.includes("@")) throw new ServiceError("Enter a valid email");
  if (mobile.length < 10) throw new ServiceError("Enter a mobile number");
  if (input.password.length < 6) throw new ServiceError("Password must be at least 6 characters");
  const existing = await UserModel.findOne({ email });
  if (existing) throw new ServiceError("That email is already registered");
  const user = await UserModel.create({
    name,
    email,
    mobile,
    passwordHash: await bcrypt.hash(input.password, 10),
    role: "customer",
  });
  return { id: String(user._id), name: user.name, email: user.email, role: "customer" as const };
}

export async function loginUser(email: string, password: string): Promise<SessionUser> {
  await connectDb();
  const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ServiceError("Email or password is wrong", 401);
  }
  if (user.active === false) throw new ServiceError("This account is inactive", 403);
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

export async function getAccount(userId: string) {
  await connectDb();
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new ServiceError("Account not found", 404);
  return {
    id: String(user._id),
    name: user.name as string,
    email: user.email as string,
    mobile: String(user.mobile || ""),
    role: user.role as SessionUser["role"],
    addresses: ((user.addresses || []) as { label?: string; line?: string }[]).map((item) => ({
      label: item.label || "Home",
      line: item.line || "",
    })),
  };
}

export type StaffProfile = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  organization: string;
  photo: string;
  role: SessionUser["role"];
  active: boolean;
  createdAt: string;
  notifyOrders: boolean;
  notifyStock: boolean;
};

function toStaffProfile(user: {
  _id: unknown;
  name: string;
  email: string;
  mobile?: string;
  organization?: string;
  photo?: string;
  role: SessionUser["role"];
  active?: boolean;
  createdAt?: Date;
  notifyOrders?: boolean;
  notifyStock?: boolean;
}): StaffProfile {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    mobile: String(user.mobile || ""),
    organization: user.organization || "Limee Toys",
    photo: user.photo || "",
    role: user.role,
    active: user.active !== false,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : "",
    notifyOrders: user.notifyOrders !== false,
    notifyStock: user.notifyStock !== false,
  };
}

export async function getStaffProfile(userId: string) {
  await connectDb();
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new ServiceError("Account not found", 404);
  return toStaffProfile(user as Parameters<typeof toStaffProfile>[0]);
}

export async function updateStaffProfile(userId: string, body: Record<string, unknown>) {
  await connectDb();
  const user = await UserModel.findById(userId);
  if (!user) throw new ServiceError("Account not found", 404);
  const name = String(body.name ?? user.name).trim().slice(0, 80);
  if (name.length < 2) throw new ServiceError("Full name is required");
  const email = String(body.email ?? user.email).trim().toLowerCase();
  if (!email.includes("@")) throw new ServiceError("Enter a valid email");
  const taken = await UserModel.exists({ email, _id: { $ne: user._id } });
  if (taken) throw new ServiceError("That email is already used");
  const photo = String(body.photo ?? user.photo ?? "").trim().slice(0, 240);
  if (photo && !photo.startsWith("/uploads/")) throw new ServiceError("Upload a photo from this page");
  user.name = name;
  user.email = email;
  user.mobile = String(body.mobile ?? user.mobile ?? "").trim().slice(0, 20);
  user.organization = String(body.organization ?? user.organization ?? "Limee Toys").trim().slice(0, 80) || "Limee Toys";
  user.photo = photo;
  if (body.notifyOrders != null) user.notifyOrders = Boolean(body.notifyOrders);
  if (body.notifyStock != null) user.notifyStock = Boolean(body.notifyStock);
  const nextPassword = String(body.newPassword || "");
  if (nextPassword) {
    if (!(await bcrypt.compare(String(body.currentPassword || ""), user.passwordHash))) {
      throw new ServiceError("Current password is wrong", 401);
    }
    if (nextPassword.length < 6) throw new ServiceError("New password must be at least 6 characters");
    if (nextPassword !== String(body.confirmPassword || "")) throw new ServiceError("New passwords do not match");
    user.passwordHash = await bcrypt.hash(nextPassword, 10);
  }
  await user.save();
  await logActivity("profile.updated", user.email, { name: user.name, role: user.role });
  return toStaffProfile(user.toObject() as Parameters<typeof toStaffProfile>[0]);
}

export async function updateAccount(userId: string, input: { name?: string; mobile?: string; address?: string }) {
  await connectDb();
  const user = await UserModel.findById(userId);
  if (!user) throw new ServiceError("Account not found", 404);
  if (input.name?.trim()) user.name = input.name.trim().slice(0, 80);
  if (input.mobile != null) user.mobile = digits(input.mobile);
  if (input.address?.trim()) {
    user.addresses = [{ label: "Home", line: input.address.trim().slice(0, 240) }];
  }
  await user.save();
  return getAccount(userId);
}

export async function logActivity(action: string, detail: string, user?: { name: string; role: string }) {
  await connectDb();
  await ActivityModel.create({
    action,
    detail: detail.slice(0, 400),
    userName: user?.name || "system",
    role: user?.role || "system",
  });
}

export function whatsappMessage(input: {
  code: string;
  customerName: string;
  mobile: string;
  address: string;
  items: { name: string; qty: number; unitPrice: number; subtotal: number }[];
  itemCount: number;
  productTotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  paymentPreference: string;
}) {
  const lines = input.items.map(
    (item, index) => `${index + 1}. ${item.name} — qty ${item.qty} × ${inr(item.unitPrice)} = ${inr(item.subtotal)}`,
  );
  const payment = input.paymentPreference === "upi" ? "UPI" : "Cash on delivery";
  return [
    `Limee Toys order ${input.code}`,
    `Name: ${input.customerName}`,
    `Phone: ${input.mobile}`,
    `Address: ${input.address}`,
    `Payment: ${payment}`,
    "",
    ...lines,
    "",
    `Items: ${input.itemCount}`,
    `Product total: ${inr(input.productTotal)}`,
    `Delivery: ${inr(input.deliveryCharge)}`,
    `Discount: ${inr(input.discount)}`,
    `Grand total: ${inr(input.grandTotal)}`,
  ].join("\n");
}

export async function uniqueSlug(name: string, currentId?: string) {
  const base = slugify(name) || "item";
  let slug = base;
  let n = 2;
  while (await ProductModel.exists({ slug, _id: { $ne: currentId || null } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function uniqueCategorySlug(name: string, currentId?: string) {
  const base = slugify(name) || "category";
  let slug = base;
  let n = 2;
  while (await CategoryModel.exists({ slug, _id: { $ne: currentId || null } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
