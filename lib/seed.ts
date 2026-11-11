import bcrypt from "bcryptjs";
import {
  BannerModel,
  CategoryModel,
  CouponModel,
  ProductModel,
  ReviewModel,
  SettingsModel,
  UserModel,
} from "./models";

const categories = [
  { name: "Baby Toys", slug: "baby-toys", kind: "parts", description: "Soft first toys for babies and toddlers." },
  { name: "Educational Toys", slug: "educational-toys", kind: "plane", description: "Letters, shapes and numbers for early learning." },
  { name: "Remote Control Cars", slug: "remote-control-cars", kind: "car", description: "Ready-to-run cars for home and the park." },
  { name: "Soft Toys", slug: "soft-toys", kind: "heli", description: "Cuddly friends for bedtime and play." },
  { name: "Building Blocks", slug: "building-blocks", kind: "parts", description: "Blocks and bricks for building a little taller." },
  { name: "Board Games", slug: "board-games", kind: "boat", description: "Table games for families and friends." },
  { name: "Outdoor Toys", slug: "outdoor-toys", kind: "boat", description: "Garden, beach and park toys." },
  { name: "Electronic Toys", slug: "electronic-toys", kind: "drone", description: "Lights, sounds and first gadgets." },
] as const;

const products = [
  ["Limee Stack Cups", "baby-toys", "Limee Toys", "0-2", 299, 399, 120, 20, 5, true, true, false, "#f59e0b", "New"],
  ["Nestling Musical Bunny", "baby-toys", "Nestling", "0-2", 799, null, 340, 12, 4, false, false, true, "#fb7185", null],
  ["Limee Alphabet Board", "educational-toys", "Limee Toys", "3-5", 649, 799, 250, 16, 5, true, true, false, "#a78bfa", "Sale"],
  ["Orbit Shape Sorter", "educational-toys", "Orbit Play", "3-5", 899, null, 380, 10, 4, false, false, true, "#38bdf8", null],
  ["Limee Thunder Buggy", "remote-control-cars", "Limee Toys", "6-8", 2499, 2999, 1400, 8, 3, true, true, true, "#ff7a18", "Hot"],
  ["Limee Drift Mini", "remote-control-cars", "Limee Toys", "6-8", 1899, null, 980, 2, 5, false, false, true, "#ff4d6d", null],
  ["Limee Cloud Bear", "soft-toys", "Limee Toys", "0-2", 549, null, 180, 18, 5, true, false, true, "#f43f5e", null],
  ["Nestling Nap Puppy", "soft-toys", "Nestling", "0-2", 699, 899, 240, 9, 4, false, true, false, "#22d3ee", "New"],
  ["Limee Brick Bucket", "building-blocks", "Limee Toys", "3-5", 999, null, 420, 14, 5, true, false, false, "#34d399", null],
  ["Orbit Tower Set", "building-blocks", "Orbit Play", "3-5", 1299, 1499, 600, 7, 4, false, false, true, "#60a5fa", null],
  ["Limee Garden Race", "board-games", "Limee Toys", "6-8", 799, null, 280, 11, 4, false, true, false, "#14b8a6", "New"],
  ["Nestling Memory Match", "board-games", "Nestling", "3-5", 399, null, 120, 0, 5, false, false, false, "#f5c518", null],
  ["Limee Garden Slide Ball", "outdoor-toys", "Limee Toys", "6-8", 1599, 1899, 750, 6, 3, true, false, true, "#1d9bf0", "Sale"],
  ["Orbit Sand Kit", "outdoor-toys", "Orbit Play", "3-5", 499, null, 160, 15, 5, false, false, false, "#4cc9f0", null],
  ["Limee Piano Pad", "electronic-toys", "Limee Toys", "3-5", 1199, null, 520, 9, 4, true, true, false, "#7c5cff", "New"],
  ["Limee Light Drum", "electronic-toys", "Limee Toys", "6-8", 1499, 1799, 700, 4, 3, false, false, true, "#8dffb0", null],
] as const;

let seeding: Promise<void> | null = null;

export function ensureSeed() {
  if (!seeding) seeding = runSeed().catch((error) => {
    seeding = null;
    throw error;
  });
  return seeding;
}

async function runSeed() {
  if ((await SettingsModel.countDocuments()) === 0) {
    await SettingsModel.create({
      storeName: "Limee Toys",
      phone: "+91 98765 43210",
      email: "info@limeetoys.com",
      address: "Chennai, Tamil Nadu, India",
      whatsapp: "+91 98765 43210",
      deliveryCharge: 99,
      freeDeliveryOver: 2999,
      serviceAreas: "Chennai, Tamil Nadu",
      hours: "24/7 Available",
      nextOrderNumber: 1008,
      policies: {
        shipping: "Orders placed before 2 PM on a working day leave the Chennai counter the same evening when the toy is in stock. Delivery inside Tamil Nadu is free above ₹2,999. Below that, a flat ₹99 covers the courier.",
        returns: "Unused toys in the original box can come back within 7 days. Message us the order ID before you send anything back. Opened electronic toys and crash-damaged cars are not returnable.",
        privacy: "Limee Toys keeps the name, phone and address you send for an order. We use them to pack, ship and reply. We do not sell that list.",
        terms: "Prices are in Indian rupees. The price confirmed at checkout is the price you pay. Stock can change before an order is confirmed. Playing with these toys is the buyer's responsibility.",
      },
    });
  }

  const password = await bcrypt.hash("limee-admin", 10);
  if ((await UserModel.countDocuments({ email: "admin@limeetoys.com" })) === 0) {
    await UserModel.create({
      name: "Limee Admin",
      email: "admin@limeetoys.com",
      mobile: "9876543210",
      passwordHash: password,
      role: "superadmin",
    });
  }
  if ((await UserModel.countDocuments({ email: "staff@limeetoys.com" })) === 0) {
    await UserModel.create({
      name: "Shop Staff",
      email: "staff@limeetoys.com",
      mobile: "9876543211",
      passwordHash: await bcrypt.hash("staff-demo", 10),
      role: "staff",
    });
  }

  if ((await CategoryModel.countDocuments()) === 0) {
    await CategoryModel.insertMany(categories.map((category) => ({ ...category })));
  }

  if ((await ProductModel.countDocuments()) === 0) {
    const saved = await CategoryModel.find().lean();
    const bySlug = new Map(saved.map((category) => [category.slug, category]));
    await ProductModel.insertMany(
      products.map((item, index) => {
        const category = bySlug.get(item[1]);
        const discount = item[5];
        return {
          name: item[0],
          slug: item[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          description: `${item[0]} from ${item[2]}. Ready for play, with spare parts available from the Limee Toys counter.`,
          brand: item[2],
          ageGroup: item[3],
          sku: `LT-${String(index + 1).padStart(4, "0")}`,
          category: category?._id,
          images: [],
          tone: item[12],
          kind: category?.kind || "parts",
          price: discount && discount > item[4] ? discount : item[4],
          discountPrice: discount && discount > item[4] ? item[4] : null,
          cost: item[6],
          tax: 0,
          stock: item[7],
          minStock: item[8],
          featured: item[9],
          arrival: item[10],
          bestSeller: item[11],
          active: true,
        };
      }),
    );
    const first = await ProductModel.findOne().sort({ createdAt: 1 });
    if (first) {
      await ReviewModel.create({
        product: first._id,
        authorName: "Ayesha",
        rating: 5,
        text: "The colours are bright and the toy matches the photo. Packed well.",
        approved: true,
      });
    }
  }

  const legacyNew = await ProductModel.collection.countDocuments({ isNew: { $exists: true } });
  if (legacyNew) {
    const legacy = await ProductModel.collection.find({ isNew: { $exists: true } }).toArray();
    for (const doc of legacy) {
      await ProductModel.collection.updateOne(
        { _id: doc._id },
        { $set: { arrival: doc.arrival ?? Boolean(doc.isNew) }, $unset: { isNew: "" } },
      );
    }
  }

  if ((await BannerModel.countDocuments()) === 0) {
    await BannerModel.insertMany([
      {
        eyebrow: "Remote control",
        title: "Weekend race kits are in.",
        text: "Ready-to-run buggies for the hall and the park.",
        href: "/category/remote-control-cars",
        cta: "Shop cars",
        tone: "#ff7a18",
        kind: "car",
        sort: 1,
        active: true,
      },
      {
        eyebrow: "New arrivals",
        title: "Toys for every age.",
        text: "Baby toys, blocks, games and first gadgets in one shop.",
        href: "/shop",
        cta: "Shop all",
        tone: "#7c5cff",
        kind: "parts",
        sort: 2,
        active: true,
      },
      {
        eyebrow: "This week",
        title: "Marked-down play sets.",
        text: "Discount prices on selected Limee Toys kits.",
        href: "/shop?deals=1",
        cta: "See offers",
        tone: "#1d9bf0",
        kind: "boat",
        sort: 3,
        active: true,
      },
    ]);
  }

  if ((await CouponModel.countDocuments({ code: "WELCOME10" })) === 0) {
    await CouponModel.create({
      code: "WELCOME10",
      type: "percent",
      value: 10,
      minOrder: 999,
      usageLimit: 100,
      active: true,
    });
  }
}
