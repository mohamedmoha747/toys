export const categoryKinds = ["car", "drone", "boat", "plane", "heli", "parts"] as const;
export type CategoryKind = (typeof categoryKinds)[number];

export const kindLabel: Record<CategoryKind, string> = {
  car: "RC car",
  drone: "Electronic",
  boat: "Outdoor",
  plane: "Learning",
  heli: "Soft toy",
  parts: "General",
};

export const orderStatuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export type Role = "customer" | "staff" | "superadmin";

export type Category = {
  id: string;
  name: string;
  slug: string;
  kind: CategoryKind;
  description: string;
};

export type CategoryView = Category & { productCount: number };

export type ProductView = {
  id: string;
  name: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  kind: CategoryKind;
  price: number;
  comparePrice: number | null;
  cost: number;
  tax: number;
  stock: number;
  minStock: number;
  images: string[];
  tone: string;
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  active: boolean;
  badge: string | null;
};

export type PublicSettings = {
  storeName: string;
  phone: string;
  phoneTel: string;
  email: string;
  address: string;
  whatsapp: string;
  deliveryCharge: number;
  freeDeliveryOver: number;
  serviceAreas: string;
  hours: string;
  policies: {
    shipping: string;
    returns: string;
    privacy: string;
    terms: string;
  };
};

export type BannerSlide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  tone: string;
  kind: CategoryKind;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type OrderItemView = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  cost: number;
  subtotal: number;
};

export type OrderView = {
  id: string;
  code: string;
  customerName: string;
  mobile: string;
  address: string;
  items: OrderItemView[];
  itemCount: number;
  productTotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  couponCode: string;
  paymentPreference: "cod" | "upi";
  collectionStatus: "pending" | "collected" | "refunded";
  amountCollected: number;
  refundAmount: number;
  status: OrderStatus;
  stockDeducted: boolean;
  notes: string;
  cancelReason: string;
  whatsappText: string;
  createdAt: string;
};

export type ReviewView = {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
};
