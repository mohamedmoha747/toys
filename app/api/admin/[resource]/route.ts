import { assertSuper, requireUser } from "@/lib/auth";
import {
  buildReport,
  dashboard,
  financeSummary,
  inventorySummary,
  listAllReviews,
  listBannersAdmin,
  listCoupons,
  listCustomers,
  listExpenses,
  listPurchases,
  listSuppliers,
  saveBanner,
  saveCategory,
  saveCoupon,
  saveExpense,
  saveProduct,
  savePurchase,
  saveSupplier,
  toCsv,
  updateSettings,
} from "@/lib/admin";
import { jsonError, ServiceError } from "@/lib/errors";
import { listOrders } from "@/lib/orders";
import { getSettings, listCategories, listProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

async function guard(req: Request) {
  return requireUser(req, ["staff", "superadmin"]);
}

export async function GET(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  try {
    const user = await guard(req);
    const { resource } = await ctx.params;
    const url = new URL(req.url);
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;
    if (resource === "dashboard") return Response.json(await dashboard(user, from, to));
    if (resource === "products") return Response.json({ products: await listProducts({ includeInactive: true }) });
    if (resource === "categories") return Response.json({ categories: await listCategories() });
    if (resource === "inventory") return Response.json(await inventorySummary());
    if (resource === "orders") {
      return Response.json({
        orders: await listOrders({
          status: url.searchParams.get("status") || undefined,
          q: url.searchParams.get("q") || undefined,
          payment: url.searchParams.get("payment") || undefined,
          from,
          to,
        }),
      });
    }
    if (resource === "customers") return Response.json({ customers: await listCustomers() });
    if (resource === "suppliers") return Response.json({ suppliers: await listSuppliers() });
    if (resource === "purchases") return Response.json({ purchases: await listPurchases() });
    if (resource === "expenses") {
      assertSuper(user);
      return Response.json({ expenses: await listExpenses(), finance: await financeSummary(from, to) });
    }
    if (resource === "coupons") return Response.json({ coupons: await listCoupons() });
    if (resource === "reviews") return Response.json({ reviews: await listAllReviews() });
    if (resource === "banners") return Response.json({ banners: await listBannersAdmin() });
    if (resource === "settings") return Response.json({ settings: await getSettings() });
    if (resource === "reports") {
      const type = url.searchParams.get("type") || "orders";
      if (["expenses", "collections", "profit"].includes(type)) assertSuper(user);
      const report = await buildReport(type, from, to);
      if (url.searchParams.get("format") === "csv") {
        return new Response(toCsv(report.columns, report.rows), {
          headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${type}.csv"` },
        });
      }
      return Response.json(report);
    }
    throw new ServiceError("Not found", 404);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  try {
    const user = await guard(req);
    const { resource } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    if (resource === "products") return Response.json({ product: await saveProduct(body, user) }, { status: 201 });
    if (resource === "categories") return Response.json({ category: await saveCategory(body, user) }, { status: 201 });
    if (resource === "inventory") {
      const { adjustStock } = await import("@/lib/admin");
      return Response.json({ product: await adjustStock(body, user) });
    }
    if (resource === "suppliers") return Response.json({ supplier: await saveSupplier(body, user) }, { status: 201 });
    if (resource === "purchases") return Response.json({ purchase: await savePurchase(body, user) }, { status: 201 });
    if (resource === "expenses") return Response.json({ expense: await saveExpense(body, user) }, { status: 201 });
    if (resource === "coupons") return Response.json({ coupon: await saveCoupon(body, user) }, { status: 201 });
    if (resource === "banners") return Response.json({ banner: await saveBanner(body, user) }, { status: 201 });
    throw new ServiceError("Not found", 404);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  try {
    const user = await guard(req);
    const { resource } = await ctx.params;
    if (resource !== "settings") throw new ServiceError("Not found", 404);
    const body = (await req.json()) as Record<string, unknown>;
    return Response.json({ settings: await updateSettings(body, user) });
  } catch (error) {
    return jsonError(error);
  }
}
