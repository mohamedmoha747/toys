import { assertSuper } from "./auth";
import { ServiceError } from "./errors";
import { connectDb } from "./mongodb";
import {
  ActivityModel,
  BannerModel,
  CategoryModel,
  CouponModel,
  ExpenseModel,
  OrderModel,
  ProductModel,
  PurchaseModel,
  ReviewModel,
  SettingsModel,
  StockMovementModel,
  SupplierModel,
  UserModel,
} from "./models";
import { getProduct, getSettings, listCategories, listProducts, logActivity, uniqueCategorySlug, uniqueSlug } from "./shop";
import type { CategoryKind, SessionUser } from "./types";
import { categoryKinds } from "./types";

const priceFields = ["price", "discountPrice", "cost", "tax", "stock", "minStock"];

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function saveProduct(body: Record<string, unknown>, user: SessionUser, id?: string) {
  await connectDb();
  const existing = id ? await ProductModel.findById(id) : null;
  if (id && !existing) throw new ServiceError("Product not found", 404);
  if (user.role !== "superadmin") {
    if (!existing) throw new ServiceError("Only a super admin can add a product", 403);
    for (const field of priceFields) {
      if (body[field] != null && String(body[field]) !== String(existing.get(field) ?? "")) {
        assertSuper(user);
      }
    }
  }
  const name = String(body.name || existing?.name || "").trim().slice(0, 80);
  if (name.length < 2) throw new ServiceError("Product name is required");
  const category = await CategoryModel.findById(String(body.categoryId || existing?.category || ""));
  if (!category) throw new ServiceError("Choose a category");
  const price = num(body.price ?? existing?.price, -1);
  if (price < 0) throw new ServiceError("Enter a valid price");
  const discountRaw = body.discountPrice ?? existing?.discountPrice;
  const discountPrice = discountRaw === "" || discountRaw == null ? null : num(discountRaw, -1);
  if (discountPrice != null && discountPrice < 0) throw new ServiceError("Enter a valid discount price");
  const stock = Math.round(num(body.stock ?? existing?.stock, 0));
  if (stock < 0) throw new ServiceError("Stock cannot be negative");
  const sku = String(body.sku || existing?.sku || `LT-${Date.now().toString().slice(-6)}`).trim();
  const slug = await uniqueSlug(name, id);
  const payload = {
    name,
    slug,
    description: String(body.description ?? existing?.description ?? "").trim().slice(0, 800),
    brand: String(body.brand || existing?.brand || "Limee Toys").trim().slice(0, 40),
    ageGroup: String(body.ageGroup || existing?.ageGroup || "3-5"),
    sku,
    category: category._id,
    images: Array.isArray(body.images) ? body.images.map(String).slice(0, 6) : existing?.images || [],
    tone: /^#[0-9a-fA-F]{6}$/.test(String(body.tone || "")) ? String(body.tone) : existing?.tone || "#f5a524",
    kind: category.kind,
    cost: Math.max(0, num(body.cost ?? existing?.cost, 0)),
    price,
    discountPrice,
    tax: Math.max(0, num(body.tax ?? existing?.tax, 0)),
    stock,
    minStock: Math.max(0, Math.round(num(body.minStock ?? existing?.minStock, 5))),
    active: body.active == null ? existing?.active !== false : Boolean(body.active),
    featured: Boolean(body.featured ?? existing?.featured),
    arrival: Boolean(body.isNew ?? existing?.get("arrival")),
    bestSeller: Boolean(body.bestSeller ?? existing?.bestSeller),
  };
  const doc = existing ? Object.assign(existing, payload) : new ProductModel(payload);
  await doc.save();
  await logActivity(id ? "product.updated" : "product.created", name, user);
  return getProduct(String(doc._id), true);
}

export async function removeProduct(id: string, user: SessionUser) {
  await connectDb();
  assertSuper(user);
  const product = await ProductModel.findById(id);
  if (!product) throw new ServiceError("Product not found", 404);
  const used = await OrderModel.exists({ "items.product": product._id });
  if (used) {
    product.active = false;
    await product.save();
    await logActivity("product.hidden", product.name, user);
    return { hidden: true };
  }
  await product.deleteOne();
  await logActivity("product.deleted", product.name, user);
  return { deleted: true };
}

export async function saveCategory(body: Record<string, unknown>, user: SessionUser, id?: string) {
  await connectDb();
  const existing = id ? await CategoryModel.findById(id) : null;
  if (id && !existing) throw new ServiceError("Category not found", 404);
  const name = String(body.name || "").trim().slice(0, 40);
  if (name.length < 2) throw new ServiceError("Category name is required");
  const kind = String(body.kind || existing?.kind || "parts") as CategoryKind;
  if (!categoryKinds.includes(kind)) throw new ServiceError("Choose a category type");
  const slug = await uniqueCategorySlug(name, id);
  const payload = { name, slug, kind, description: String(body.description || "").trim().slice(0, 240) };
  const doc = existing ? Object.assign(existing, payload) : await CategoryModel.create(payload);
  if (existing) await doc.save();
  await logActivity(id ? "category.updated" : "category.created", name, user);
  return { id: String(doc._id), ...payload };
}

export async function removeCategory(id: string, user: SessionUser) {
  await connectDb();
  assertSuper(user);
  if (await ProductModel.exists({ category: id })) throw new ServiceError("Move or delete this category's products first");
  const category = await CategoryModel.findByIdAndDelete(id);
  if (!category) throw new ServiceError("Category not found", 404);
  await logActivity("category.deleted", category.name, user);
}

export async function adjustStock(body: Record<string, unknown>, user: SessionUser) {
  await connectDb();
  assertSuper(user);
  const qty = Math.round(num(body.qty, 0));
  if (qty < 1) throw new ServiceError("Enter a quantity");
  const direction = body.direction === "out" ? -1 : 1;
  const reason = String(body.reason || "adjustment");
  if (!["purchase", "damage", "return", "adjustment"].includes(reason)) throw new ServiceError("Choose a reason");
  const product = await ProductModel.findById(String(body.productId || ""));
  if (!product) throw new ServiceError("Product not found", 404);
  if (direction < 0) {
    const updated = await ProductModel.findOneAndUpdate({ _id: product._id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
    if (!updated) throw new ServiceError("Not enough stock for that adjustment");
  } else {
    await ProductModel.updateOne({ _id: product._id }, { $inc: { stock: qty } });
  }
  await StockMovementModel.create({
    product: product._id,
    productName: product.name,
    qty: direction * qty,
    reason: reason === "damage" ? "damage" : reason,
    note: String(body.note || "").slice(0, 200),
    userName: user.name,
  });
  await logActivity("stock.adjusted", `${product.name} ${direction < 0 ? "-" : "+"}${qty}`, user);
  return getProduct(String(product._id), true);
}

export async function listMovements() {
  await connectDb();
  const docs = await StockMovementModel.find().sort({ createdAt: -1 }).limit(80).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    productName: String(doc.productName || ""),
    qty: Number(doc.qty || 0),
    reason: String(doc.reason || ""),
    note: String(doc.note || ""),
    userName: String(doc.userName || ""),
    createdAt: new Date(doc.createdAt || Date.now()).toISOString(),
  }));
}

export async function inventorySummary() {
  const products = await listProducts({ includeInactive: true });
  const stockValue = products.reduce((sum, item) => sum + item.cost * item.stock, 0);
  return {
    products,
    movements: await listMovements(),
    stockValue,
    low: products.filter((item) => item.stock > 0 && item.stock <= item.minStock),
    out: products.filter((item) => item.stock <= 0),
  };
}

function range(from?: string, to?: string) {
  const query: { $gte?: Date; $lte?: Date } = {};
  if (from) query.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    query.$lte = end;
  }
  return query.$gte || query.$lte ? query : null;
}

export async function dashboard(user: SessionUser, from?: string, to?: string) {
  await connectDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const created = range(from, to) || { $gte: today };
  const orders = await OrderModel.find({ createdAt: created }).lean();
  const active = orders.filter((order) => order.status !== "Cancelled");
  const sales = active.reduce((sum, order) => sum + (order.grandTotal || 0) - (order.refundAmount || 0), 0);
  const collected = active.reduce((sum, order) => sum + (order.amountCollected || 0), 0);
  const deliveryIncome = active.reduce((sum, order) => sum + (order.deliveryCharge || 0), 0);
  const cogs = active.reduce(
    (sum, order) => sum + (order.items || []).reduce((inner: number, item: { cost?: number; qty?: number }) => inner + (item.cost || 0) * (item.qty || 0), 0),
    0,
  );
  const expenseQuery = range(from, to);
  const expenses = await ExpenseModel.find(expenseQuery ? { spentOn: expenseQuery } : { spentOn: { $gte: today } }).lean();
  const expenseTotal = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const products = await ProductModel.find().lean();
  const customers = await UserModel.countDocuments({ role: "customer" });
  const activity = await ActivityModel.find().sort({ createdAt: -1 }).limit(8).lean();
  const byDay = new Map<string, number>();
  for (const order of active) {
    const key = new Date(order.createdAt || Date.now()).toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + (order.grandTotal || 0));
  }
  const base = {
    orders: orders.length,
    pending: orders.filter((order) => order.status === "Pending").length,
    delivered: orders.filter((order) => order.status === "Delivered").length,
    sales,
    collected,
    deliveryIncome,
    pendingCollection: Math.max(0, sales - collected),
    products: products.length,
    customers,
    stockValue: products.reduce((sum, item) => sum + (item.cost || 0) * (item.stock || 0), 0),
    lowStock: products.filter((item) => (item.stock || 0) > 0 && (item.stock || 0) <= (item.minStock || 0)).length,
    outOfStock: products.filter((item) => (item.stock || 0) <= 0).length,
    series: [...byDay.entries()].map(([day, amount]) => ({ day, amount })),
    activity: activity.map((item) => ({
      id: String(item._id),
      action: item.action,
      detail: item.detail,
      userName: item.userName,
      createdAt: new Date(item.createdAt || Date.now()).toISOString(),
    })),
  };
  if (user.role !== "superadmin") return base;
  return { ...base, cogs, expenses: expenseTotal, grossProfit: sales - cogs, netProfit: sales - cogs - expenseTotal };
}

export async function listCustomers() {
  await connectDb();
  const users = await UserModel.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
  const orders = await OrderModel.find().lean();
  return users.map((user) => {
    const mine = orders.filter((order) => String(order.user || "") === String(user._id) || order.mobile === user.mobile);
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      addresses: user.addresses || [],
      orders: mine.length,
      total: mine.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + (order.grandTotal || 0), 0),
    };
  });
}

export async function saveSupplier(body: Record<string, unknown>, user: SessionUser, id?: string) {
  await connectDb();
  const name = String(body.name || "").trim();
  if (name.length < 2) throw new ServiceError("Supplier name is required");
  const payload = {
    name,
    company: String(body.company || "").trim(),
    phone: String(body.phone || "").trim(),
    address: String(body.address || "").trim(),
    notes: String(body.notes || "").trim(),
  };
  const doc = id ? await SupplierModel.findById(id) : new SupplierModel(payload);
  if (id && !doc) throw new ServiceError("Supplier not found", 404);
  Object.assign(doc!, payload);
  await doc!.save();
  await logActivity(id ? "supplier.updated" : "supplier.created", name, user);
  return doc;
}

export async function listSuppliers() {
  await connectDb();
  const docs = await SupplierModel.find().sort({ name: 1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    company: doc.company,
    phone: doc.phone,
    address: doc.address,
    notes: doc.notes,
  }));
}

export async function savePurchase(body: Record<string, unknown>, user: SessionUser) {
  await connectDb();
  const supplier = await SupplierModel.findById(String(body.supplierId || ""));
  if (!supplier) throw new ServiceError("Choose a supplier");
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) throw new ServiceError("Add at least one line");
  const lines = [];
  for (const item of items as { productId?: string; qty?: number; cost?: number }[]) {
    const product = await ProductModel.findById(String(item.productId || ""));
    if (!product) throw new ServiceError("A purchase line has no product");
    const qty = Math.round(num(item.qty, 0));
    const cost = num(item.cost, 0);
    if (qty < 1 || cost < 0) throw new ServiceError("Check purchase quantities and cost");
    lines.push({ product: product._id, name: product.name, qty, cost });
  }
  const total = lines.reduce((sum, line) => sum + line.qty * line.cost, 0);
  const doc = await PurchaseModel.create({
    supplier: supplier._id,
    supplierName: supplier.name,
    items: lines,
    total,
    amountPaid: Math.max(0, num(body.amountPaid, 0)),
    status: "draft",
    note: String(body.note || "").slice(0, 240),
  });
  await logActivity("purchase.created", `${supplier.name} ₹${total}`, user);
  return doc;
}

export async function approvePurchase(id: string, user: SessionUser) {
  await connectDb();
  assertSuper(user);
  const purchase = await PurchaseModel.findById(id);
  if (!purchase) throw new ServiceError("Purchase not found", 404);
  if (purchase.status === "approved") throw new ServiceError("This purchase is already approved");
  for (const item of purchase.items) {
    await ProductModel.updateOne({ _id: item.product }, { $inc: { stock: item.qty || 0 }, $set: { cost: item.cost || 0 } });
    await StockMovementModel.create({
      product: item.product,
      productName: item.name,
      qty: item.qty,
      reason: "purchase",
      note: `Purchase ${purchase._id}`,
      userName: user.name,
    });
  }
  purchase.status = "approved";
  await purchase.save();
  await logActivity("purchase.approved", purchase.supplierName, user);
  return purchase;
}

export async function listPurchases() {
  await connectDb();
  const docs = await PurchaseModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    supplierName: doc.supplierName,
    items: doc.items,
    total: doc.total,
    amountPaid: doc.amountPaid,
    balance: (doc.total || 0) - (doc.amountPaid || 0),
    status: doc.status,
    note: doc.note,
    createdAt: new Date(doc.createdAt || Date.now()).toISOString(),
  }));
}

export async function saveExpense(body: Record<string, unknown>, user: SessionUser) {
  await connectDb();
  assertSuper(user);
  const amount = num(body.amount, -1);
  if (amount <= 0) throw new ServiceError("Enter an expense amount");
  const category = String(body.category || "other");
  const doc = await ExpenseModel.create({
    category,
    amount,
    note: String(body.note || "").slice(0, 200),
    spentOn: body.spentOn ? new Date(String(body.spentOn)) : new Date(),
  });
  await logActivity("expense.created", `${category} ₹${amount}`, user);
  return doc;
}

export async function listExpenses() {
  await connectDb();
  const docs = await ExpenseModel.find().sort({ spentOn: -1 }).limit(100).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    category: doc.category,
    amount: doc.amount,
    note: doc.note,
    spentOn: new Date(doc.spentOn || doc.createdAt || Date.now()).toISOString(),
  }));
}

export async function saveCoupon(body: Record<string, unknown>, user: SessionUser, id?: string) {
  await connectDb();
  assertSuper(user);
  const code = String(body.code || "").trim().toUpperCase();
  if (code.length < 3) throw new ServiceError("Coupon code is required");
  const type = body.type === "fixed" ? "fixed" : "percent";
  const value = num(body.value, 0);
  if (value <= 0) throw new ServiceError("Enter a coupon value");
  const payload = {
    code,
    type,
    value,
    startsAt: body.startsAt ? new Date(String(body.startsAt)) : null,
    endsAt: body.endsAt ? new Date(String(body.endsAt)) : null,
    minOrder: Math.max(0, num(body.minOrder, 0)),
    usageLimit: Math.max(0, Math.round(num(body.usageLimit, 0))),
    category: body.categoryId || null,
    product: body.productId || null,
    active: body.active == null ? true : Boolean(body.active),
  };
  const doc = id ? await CouponModel.findById(id) : new CouponModel(payload);
  if (id && !doc) throw new ServiceError("Coupon not found", 404);
  Object.assign(doc!, payload);
  await doc!.save();
  await logActivity(id ? "coupon.updated" : "coupon.created", code, user);
  return doc;
}

export async function listCoupons() {
  await connectDb();
  const docs = await CouponModel.find().sort({ code: 1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    code: doc.code,
    type: doc.type,
    value: doc.value,
    minOrder: doc.minOrder,
    usageLimit: doc.usageLimit,
    usedCount: doc.usedCount,
    active: doc.active,
    startsAt: doc.startsAt,
    endsAt: doc.endsAt,
  }));
}

export async function moderateReview(id: string, approved: boolean, user: SessionUser) {
  await connectDb();
  const review = await ReviewModel.findById(id);
  if (!review) throw new ServiceError("Review not found", 404);
  review.approved = approved;
  await review.save();
  await logActivity("review.moderated", `${approved ? "Approved" : "Hidden"} review`, user);
  return review;
}

export async function listAllReviews() {
  await connectDb();
  const docs = await ReviewModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    productId: String(doc.product),
    authorName: doc.authorName,
    rating: doc.rating,
    text: doc.text,
    approved: doc.approved,
    createdAt: new Date(doc.createdAt || Date.now()).toISOString(),
  }));
}

export async function updateSettings(body: Record<string, unknown>, user: SessionUser) {
  await connectDb();
  assertSuper(user);
  const settings = (await SettingsModel.findOne()) || new SettingsModel();
  const fields = ["storeName", "phone", "email", "address", "whatsapp", "serviceAreas", "hours"] as const;
  for (const field of fields) if (body[field] != null) settings.set(field, String(body[field]).trim());
  if (body.deliveryCharge != null) settings.deliveryCharge = Math.max(0, num(body.deliveryCharge));
  if (body.freeDeliveryOver != null) settings.freeDeliveryOver = Math.max(0, num(body.freeDeliveryOver));
  if (body.policies && typeof body.policies === "object") {
    const policies = body.policies as Record<string, unknown>;
    settings.policies = {
      shipping: String(policies.shipping || settings.policies?.shipping || ""),
      returns: String(policies.returns || settings.policies?.returns || ""),
      privacy: String(policies.privacy || settings.policies?.privacy || ""),
      terms: String(policies.terms || settings.policies?.terms || ""),
    };
  }
  await settings.save();
  await logActivity("settings.updated", settings.storeName, user);
  return getSettings();
}

export async function saveBanner(body: Record<string, unknown>, user: SessionUser, id?: string) {
  await connectDb();
  const payload = {
    eyebrow: String(body.eyebrow || "").slice(0, 40),
    title: String(body.title || "").slice(0, 80),
    text: String(body.text || "").slice(0, 180),
    href: String(body.href || "/shop"),
    cta: String(body.cta || "Shop"),
    tone: String(body.tone || "#f5a524"),
    kind: categoryKinds.includes(body.kind as CategoryKind) ? body.kind : "parts",
    active: body.active == null ? true : Boolean(body.active),
    sort: Math.round(num(body.sort, 0)),
  };
  if (!payload.title) throw new ServiceError("Banner title is required");
  const doc = id ? await BannerModel.findById(id) : new BannerModel(payload);
  if (id && !doc) throw new ServiceError("Banner not found", 404);
  Object.assign(doc!, payload);
  await doc!.save();
  await logActivity(id ? "banner.updated" : "banner.created", payload.title, user);
  return doc;
}

export async function listBannersAdmin() {
  await connectDb();
  const docs = await BannerModel.find().sort({ sort: 1 }).lean();
  return docs.map((doc) => ({ ...doc, id: String(doc._id) }));
}

export async function removeBanner(id: string, user: SessionUser) {
  await connectDb();
  await BannerModel.findByIdAndDelete(id);
  await logActivity("banner.deleted", id, user);
}

export async function financeSummary(from?: string, to?: string) {
  const created = range(from, to);
  const orders = await OrderModel.find(created ? { createdAt: created } : {}).lean();
  const active = orders.filter((order) => order.status !== "Cancelled");
  const sales = active.reduce((sum, order) => sum + (order.grandTotal || 0) - (order.refundAmount || 0), 0);
  const collected = active.reduce((sum, order) => sum + (order.amountCollected || 0), 0);
  const refunds = orders.reduce((sum, order) => sum + (order.refundAmount || 0), 0);
  const deliveryIncome = active.reduce((sum, order) => sum + (order.deliveryCharge || 0), 0);
  const cogs = active.reduce(
    (sum, order) => sum + (order.items || []).reduce((inner: number, item: { cost?: number; qty?: number }) => inner + (item.cost || 0) * (item.qty || 0), 0),
    0,
  );
  const expenses = await listExpenses();
  const expenseTotal = expenses
    .filter((item) => {
      if (!created) return true;
      const time = new Date(item.spentOn).getTime();
      if (created.$gte && time < created.$gte.getTime()) return false;
      if (created.$lte && time > created.$lte.getTime()) return false;
      return true;
    })
    .reduce((sum, item) => sum + item.amount, 0);
  return {
    sales,
    collected,
    pendingCollection: Math.max(0, sales - collected),
    refunds,
    deliveryIncome,
    cogs,
    expenses: expenseTotal,
    grossProfit: sales - cogs,
    netProfit: sales - cogs - expenseTotal,
    expenseRows: expenses,
  };
}

export async function buildReport(type: string, from?: string, to?: string) {
  await connectDb();
  const orders = await (await import("./orders")).listOrders({ from, to });
  const products = await listProducts({ includeInactive: true });
  const categories = await listCategories();
  if (type === "orders" || type === "sales") {
    return {
      columns: ["code", "date", "customer", "status", "payment", "total", "collected"],
      rows: orders.map((order) => ({
        code: order.code,
        date: order.createdAt.slice(0, 10),
        customer: order.customerName,
        status: order.status,
        payment: order.paymentPreference,
        total: order.grandTotal,
        collected: order.amountCollected,
      })),
    };
  }
  if (type === "products" || type === "stock") {
    return {
      columns: ["sku", "name", "category", "stock", "min", "cost", "price"],
      rows: products.map((item) => ({
        sku: item.sku,
        name: item.name,
        category: item.categoryName,
        stock: item.stock,
        min: item.minStock,
        cost: item.cost,
        price: item.price,
      })),
    };
  }
  if (type === "categories") {
    return {
      columns: ["name", "products"],
      rows: categories.map((item) => ({ name: item.name, products: item.productCount })),
    };
  }
  if (type === "customers") {
    const customers = await listCustomers();
    return {
      columns: ["name", "mobile", "email", "orders", "total"],
      rows: customers.map((item) => ({ name: item.name, mobile: item.mobile, email: item.email, orders: item.orders, total: item.total })),
    };
  }
  if (type === "purchases") {
    const purchases = await listPurchases();
    return {
      columns: ["supplier", "status", "total", "paid", "balance"],
      rows: purchases.map((item) => ({ supplier: item.supplierName, status: item.status, total: item.total, paid: item.amountPaid, balance: item.balance })),
    };
  }
  if (type === "expenses") {
    const rows = await listExpenses();
    return { columns: ["date", "category", "amount", "note"], rows: rows.map((item) => ({ date: item.spentOn.slice(0, 10), category: item.category, amount: item.amount, note: item.note })) };
  }
  if (type === "collections" || type === "profit") {
    const money = await financeSummary(from, to);
    return {
      columns: ["metric", "amount"],
      rows: Object.entries(money)
        .filter((entry) => typeof entry[1] === "number")
        .map(([metric, amount]) => ({ metric, amount: amount as number })),
    };
  }
  throw new ServiceError("Unknown report");
}

export function toCsv(columns: string[], rows: Record<string, string | number>[]) {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column] ?? "")).join(","))].join("\n");
}
