import { CouponModel, OrderModel, ProductModel, SettingsModel } from "./models";
import { connectDb } from "./mongodb";
import { ServiceError } from "./errors";
import { digits, getSettings, logActivity, whatsappMessage } from "./shop";
import type { OrderStatus, OrderView, SessionUser } from "./types";

const fulfilling: OrderStatus[] = ["Confirmed", "Processing", "Packed", "Shipped", "Delivered"];
const restoring: OrderStatus[] = ["Cancelled", "Returned"];

type QuoteInput = {
  name: string;
  mobile: string;
  address: string;
  items: { productId: string; qty: number }[];
  couponCode?: string;
  paymentPreference?: "cod" | "upi";
  userId?: string;
};

function toOrder(doc: {
  _id: unknown;
  code: string;
  customerName: string;
  mobile: string;
  address: string;
  items?: { product?: unknown; name?: string; qty?: number; unitPrice?: number; cost?: number; subtotal?: number }[];
  itemCount?: number;
  productTotal?: number;
  deliveryCharge?: number;
  discount?: number;
  grandTotal?: number;
  couponCode?: string;
  paymentPreference?: "cod" | "upi";
  collectionStatus?: "pending" | "collected" | "refunded";
  amountCollected?: number;
  refundAmount?: number;
  status?: OrderStatus;
  stockDeducted?: boolean;
  notes?: string;
  cancelReason?: string;
  whatsappText?: string;
  createdAt?: Date;
}): OrderView {
  return {
    id: String(doc._id),
    code: doc.code,
    customerName: doc.customerName,
    mobile: doc.mobile,
    address: doc.address,
    items: (doc.items || []).map((item) => ({
      productId: String(item.product || ""),
      name: item.name || "",
      qty: item.qty || 0,
      unitPrice: item.unitPrice || 0,
      cost: item.cost || 0,
      subtotal: item.subtotal || 0,
    })),
    itemCount: doc.itemCount || 0,
    productTotal: doc.productTotal || 0,
    deliveryCharge: doc.deliveryCharge || 0,
    discount: doc.discount || 0,
    grandTotal: doc.grandTotal || 0,
    couponCode: doc.couponCode || "",
    paymentPreference: doc.paymentPreference === "upi" ? "upi" : "cod",
    collectionStatus: doc.collectionStatus || "pending",
    amountCollected: doc.amountCollected || 0,
    refundAmount: doc.refundAmount || 0,
    status: doc.status || "Pending",
    stockDeducted: Boolean(doc.stockDeducted),
    notes: doc.notes || "",
    cancelReason: doc.cancelReason || "",
    whatsappText: doc.whatsappText || "",
    createdAt: new Date(doc.createdAt || Date.now()).toISOString(),
  };
}

export async function quoteOrder(input: QuoteInput) {
  await connectDb();
  const settings = await getSettings();
  const name = input.name.trim();
  const mobile = digits(input.mobile);
  const address = input.address.trim();
  if (name.length < 2) throw new ServiceError("Name is required");
  if (mobile.length < 10) throw new ServiceError("Enter a mobile number");
  if (address.length < 8) throw new ServiceError("Enter the full delivery address");
  const areas = settings.serviceAreas.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (areas.length && !areas.some((area) => address.toLowerCase().includes(area))) {
    throw new ServiceError(`We currently deliver in: ${settings.serviceAreas}`);
  }

  const merged = new Map<string, number>();
  for (const item of input.items || []) {
    const qty = Number(item.qty);
    if (!item.productId || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new ServiceError("Check the quantities");
    merged.set(item.productId, (merged.get(item.productId) || 0) + qty);
  }
  if (!merged.size) throw new ServiceError("Your cart is empty");

  const lines = [];
  for (const [productId, qty] of merged) {
    const product = await ProductModel.findById(productId);
    if (!product || !product.active) throw new ServiceError("A product in the cart is no longer available");
    if (product.stock < qty) throw new ServiceError(`${product.name} only has ${product.stock} in stock`);
    const unit = product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price ? product.discountPrice : product.price;
    lines.push({
      product,
      productId,
      name: product.name,
      qty,
      unitPrice: unit,
      cost: product.cost || 0,
      subtotal: unit * qty,
      categoryId: String(product.category),
    });
  }

  const productTotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  let discount = 0;
  let couponCode = "";
  const code = (input.couponCode || "").trim().toUpperCase();
  if (code) {
    const coupon = await CouponModel.findOne({ code, active: true });
    if (!coupon) throw new ServiceError("That coupon is not active");
    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) throw new ServiceError("That coupon has not started");
    if (coupon.endsAt && coupon.endsAt < now) throw new ServiceError("That coupon has expired");
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new ServiceError("That coupon has been used up");
    const eligible = lines
      .filter((line) => {
        if (coupon.product && String(coupon.product) !== line.productId) return false;
        if (coupon.category && String(coupon.category) !== line.categoryId) return false;
        return true;
      })
      .reduce((sum, line) => sum + line.subtotal, 0);
    if (productTotal < (coupon.minOrder || 0)) throw new ServiceError(`This coupon needs an order of at least ₹${coupon.minOrder}`);
    if (eligible <= 0) throw new ServiceError("This coupon does not apply to these toys");
    discount = coupon.type === "percent" ? Math.round((eligible * coupon.value) / 100) : Math.min(coupon.value, eligible);
    couponCode = coupon.code;
  }

  const deliveryCharge = productTotal - discount >= settings.freeDeliveryOver ? 0 : settings.deliveryCharge;
  const grandTotal = Math.max(0, productTotal - discount + deliveryCharge);
  const paymentPreference = input.paymentPreference === "upi" ? "upi" : "cod";
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
  return {
    name,
    mobile,
    address,
    lines,
    itemCount,
    productTotal,
    deliveryCharge,
    discount,
    grandTotal,
    couponCode,
    paymentPreference,
    userId: input.userId,
  };
}

export async function createOrder(input: QuoteInput) {
  const quote = await quoteOrder(input);
  const settings = await SettingsModel.findOneAndUpdate({}, { $inc: { nextOrderNumber: 1 } }, { new: false });
  const code = `LT${settings?.nextOrderNumber || 1008}`;
  const message = whatsappMessage({
    code,
    customerName: quote.name,
    mobile: quote.mobile,
    address: quote.address,
    items: quote.lines,
    itemCount: quote.itemCount,
    productTotal: quote.productTotal,
    deliveryCharge: quote.deliveryCharge,
    discount: quote.discount,
    grandTotal: quote.grandTotal,
    paymentPreference: quote.paymentPreference,
  });
  const order = await OrderModel.create({
    code,
    user: quote.userId || null,
    customerName: quote.name,
    mobile: quote.mobile,
    address: quote.address,
    items: quote.lines.map((line) => ({
      product: line.productId,
      name: line.name,
      qty: line.qty,
      unitPrice: line.unitPrice,
      cost: line.cost,
      subtotal: line.subtotal,
    })),
    itemCount: quote.itemCount,
    productTotal: quote.productTotal,
    deliveryCharge: quote.deliveryCharge,
    discount: quote.discount,
    grandTotal: quote.grandTotal,
    couponCode: quote.couponCode,
    paymentPreference: quote.paymentPreference,
    status: "Pending",
    whatsappText: message,
  });
  if (quote.couponCode) await CouponModel.updateOne({ code: quote.couponCode }, { $inc: { usedCount: 1 } });
  await logActivity("order.created", `${code} for ${quote.name}`, { name: quote.name, role: "customer" });
  const phone = digits((await getSettings()).whatsapp);
  return {
    order: toOrder(order.toObject()),
    whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
  };
}

async function changeStock(order: { code: string; items: { product?: unknown; name?: string; qty?: number }[] }, direction: 1 | -1, user: SessionUser, reason: "sale" | "return") {
  const applied: { id: string; qty: number; name: string }[] = [];
  try {
    for (const item of order.items) {
      const qty = item.qty || 0;
      const id = String(item.product || "");
      if (!id || qty < 1) continue;
      if (direction < 0) {
        const updated = await ProductModel.findOneAndUpdate({ _id: id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
        if (!updated) throw new ServiceError(`${item.name || "A toy"} does not have enough stock`);
      } else {
        await ProductModel.updateOne({ _id: id }, { $inc: { stock: qty } });
      }
      applied.push({ id, qty, name: item.name || "" });
      const { StockMovementModel } = await import("./models");
      await StockMovementModel.create({
        product: id,
        productName: item.name || "",
        qty: direction < 0 ? -qty : qty,
        reason,
        note: order.code,
        userName: user.name,
      });
    }
  } catch (error) {
    for (const item of applied) {
      await ProductModel.updateOne({ _id: item.id }, { $inc: { stock: direction < 0 ? item.qty : -item.qty } });
    }
    throw error;
  }
}

export async function updateOrder(id: string, input: Record<string, unknown>, user: SessionUser) {
  await connectDb();
  const order = await OrderModel.findById(id);
  if (!order) throw new ServiceError("Order not found", 404);
  const nextStatus = (input.status ? String(input.status) : order.status) as OrderStatus;
  if (input.refundAmount != null || input.collectionStatus === "refunded") {
    const { assertSuper } = await import("./auth");
    assertSuper(user);
  }

  if (!order.stockDeducted && fulfilling.includes(nextStatus)) {
    await changeStock(order, -1, user, "sale");
    order.stockDeducted = true;
  }
  if (order.stockDeducted && restoring.includes(nextStatus) && !restoring.includes(order.status)) {
    await changeStock(order, 1, user, "return");
    order.stockDeducted = false;
  }

  if (input.status) order.status = nextStatus;
  if (typeof input.notes === "string") order.notes = input.notes.slice(0, 500);
  if (typeof input.cancelReason === "string") order.cancelReason = input.cancelReason.slice(0, 300);
  if (input.amountCollected != null) order.amountCollected = Math.max(0, Number(input.amountCollected) || 0);
  if (input.refundAmount != null) order.refundAmount = Math.max(0, Number(input.refundAmount) || 0);
  if (input.collectionStatus === "pending" || input.collectionStatus === "collected" || input.collectionStatus === "refunded") {
    order.collectionStatus = input.collectionStatus;
  }
  if (order.amountCollected > 0 && order.collectionStatus === "pending") order.collectionStatus = "collected";
  await order.save();
  await logActivity("order.updated", `${order.code} → ${order.status}`, user);
  return toOrder(order.toObject());
}

export async function listOrders(filter: { status?: string; q?: string; payment?: string; from?: string; to?: string; userId?: string; mobile?: string } = {}) {
  await connectDb();
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;
  if (filter.payment) query.paymentPreference = filter.payment;
  if (filter.userId) query.user = filter.userId;
  if (filter.mobile) query.mobile = filter.mobile;
  if (filter.from || filter.to) {
    query.createdAt = {};
    if (filter.from) (query.createdAt as { $gte?: Date }).$gte = new Date(filter.from);
    if (filter.to) {
      const end = new Date(filter.to);
      end.setHours(23, 59, 59, 999);
      (query.createdAt as { $lte?: Date }).$lte = end;
    }
  }
  const docs = await OrderModel.find(query).sort({ createdAt: -1 }).limit(300).lean();
  let orders = docs.map((doc) => toOrder(doc as never));
  if (filter.q?.trim()) {
    const q = filter.q.trim().toLowerCase();
    orders = orders.filter((order) =>
      [order.code, order.customerName, order.mobile, order.address].join(" ").toLowerCase().includes(q),
    );
  }
  return orders;
}

export async function getOrder(key: string) {
  await connectDb();
  const or: Record<string, unknown>[] = [{ code: key }];
  if (/^[a-f0-9]{24}$/i.test(key)) or.push({ _id: key });
  const doc = await OrderModel.findOne({ $or: or }).lean();
  if (!doc) return null;
  return toOrder(doc as never);
}
