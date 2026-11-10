import mongoose, { Schema, models, model } from "mongoose";

const SettingsSchema = new Schema(
  {
    storeName: { type: String, default: "Limee Toys" },
    phone: { type: String, default: "+91 98765 43210" },
    email: { type: String, default: "info@limeetoys.com" },
    address: { type: String, default: "Chennai, Tamil Nadu, India" },
    whatsapp: { type: String, default: "+91 98765 43210" },
    deliveryCharge: { type: Number, default: 99 },
    freeDeliveryOver: { type: Number, default: 2999 },
    serviceAreas: { type: String, default: "Chennai, Tamil Nadu" },
    hours: { type: String, default: "24/7 Available" },
    nextOrderNumber: { type: Number, default: 1008 },
    policies: {
      shipping: { type: String, default: "" },
      returns: { type: String, default: "" },
      privacy: { type: String, default: "" },
      terms: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "staff", "superadmin"], default: "customer" },
    photo: { type: String, default: "" },
    organization: { type: String, default: "Limee Toys" },
    active: { type: Boolean, default: true },
    notifyOrders: { type: Boolean, default: true },
    notifyStock: { type: Boolean, default: true },
    addresses: [{ label: String, line: String }],
  },
  { timestamps: true },
);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["car", "drone", "boat", "plane", "heli", "parts"], default: "parts" },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    brand: { type: String, default: "Limee Toys" },
    ageGroup: { type: String, default: "3-5" },
    sku: { type: String, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: { type: [String], default: [] },
    tone: { type: String, default: "#f5a524" },
    kind: { type: String, enum: ["car", "drone", "boat", "plane", "heli", "parts"], default: "parts" },
    cost: { type: Number, default: 0 },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    tax: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 5 },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    arrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: String,
    qty: Number,
    unitPrice: Number,
    cost: Number,
    subtotal: Number,
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    items: { type: [OrderItemSchema], default: [] },
    itemCount: { type: Number, default: 0 },
    productTotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    paymentPreference: { type: String, enum: ["cod", "upi"], default: "cod" },
    collectionStatus: { type: String, enum: ["pending", "collected", "refunded"], default: "pending" },
    amountCollected: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Returned"],
      default: "Pending",
    },
    stockDeducted: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    cancelReason: { type: String, default: "" },
    whatsappText: { type: String, default: "" },
  },
  { timestamps: true },
);

const StockMovementSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, default: "" },
    qty: { type: Number, required: true },
    reason: { type: String, enum: ["purchase", "sale", "damage", "return", "adjustment"], required: true },
    note: { type: String, default: "" },
    userName: { type: String, default: "" },
  },
  { timestamps: true },
);

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

const PurchaseSchema = new Schema(
  {
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    supplierName: { type: String, default: "" },
    items: {
      type: [
        new Schema(
          {
            product: { type: Schema.Types.ObjectId, ref: "Product" },
            name: String,
            qty: Number,
            cost: Number,
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "approved"], default: "draft" },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

const ExpenseSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["packaging", "delivery", "transport", "marketing", "staff", "rent", "other"],
      required: true,
    },
    amount: { type: Number, required: true },
    note: { type: String, default: "" },
    spentOn: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    minOrder: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    authorName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, default: "" },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const BannerSchema = new Schema(
  {
    eyebrow: String,
    title: String,
    text: String,
    href: String,
    cta: String,
    tone: String,
    kind: { type: String, enum: ["car", "drone", "boat", "plane", "heli", "parts"], default: "parts" },
    active: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ActivitySchema = new Schema(
  {
    action: { type: String, required: true },
    detail: { type: String, default: "" },
    userName: { type: String, default: "" },
    role: { type: String, default: "" },
  },
  { timestamps: true },
);

function register<T>(name: string, schema: Schema<T>) {
  return models[name] || model<T>(name, schema);
}

export const SettingsModel = register("Settings", SettingsSchema);
export const UserModel = register("User", UserSchema);
export const CategoryModel = register("Category", CategorySchema);
export const ProductModel = register("Product", ProductSchema);
export const OrderModel = register("Order", OrderSchema);
export const StockMovementModel = register("StockMovement", StockMovementSchema);
export const SupplierModel = register("Supplier", SupplierSchema);
export const PurchaseModel = register("Purchase", PurchaseSchema);
export const ExpenseModel = register("Expense", ExpenseSchema);
export const CouponModel = register("Coupon", CouponSchema);
export const ReviewModel = register("Review", ReviewSchema);
export const BannerModel = register("Banner", BannerSchema);
export const ActivityModel = register("Activity", ActivitySchema);
