import { requireUser } from "@/lib/auth";
import { approvePurchase, moderateReview, removeBanner, removeCategory, removeProduct, saveBanner, saveCategory, saveCoupon, saveProduct, saveSupplier } from "@/lib/admin";
import { jsonError, ServiceError } from "@/lib/errors";
import { getOrder, updateOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ resource: string; id: string }> }) {
  try {
    await requireUser(req, ["staff", "superadmin"]);
    const { resource, id } = await ctx.params;
    if (resource === "orders") {
      const order = await getOrder(id);
      if (!order) throw new ServiceError("Order not found", 404);
      return Response.json({ order });
    }
    throw new ServiceError("Not found", 404);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const user = await requireUser(req, ["staff", "superadmin"]);
    const { resource, id } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    if (resource === "products") return Response.json({ product: await saveProduct(body, user, id) });
    if (resource === "categories") return Response.json({ category: await saveCategory(body, user, id) });
    if (resource === "orders") return Response.json({ order: await updateOrder(id, body, user) });
    if (resource === "suppliers") return Response.json({ supplier: await saveSupplier(body, user, id) });
    if (resource === "purchases") return Response.json({ purchase: await approvePurchase(id, user) });
    if (resource === "coupons") return Response.json({ coupon: await saveCoupon(body, user, id) });
    if (resource === "reviews") return Response.json({ review: await moderateReview(id, Boolean(body.approved), user) });
    if (resource === "banners") return Response.json({ banner: await saveBanner(body, user, id) });
    throw new ServiceError("Not found", 404);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const user = await requireUser(req, ["staff", "superadmin"]);
    const { resource, id } = await ctx.params;
    if (resource === "products") return Response.json(await removeProduct(id, user));
    if (resource === "categories") return Response.json(await removeCategory(id, user).then(() => ({ ok: true })));
    if (resource === "banners") return Response.json(await removeBanner(id, user).then(() => ({ ok: true })));
    throw new ServiceError("Not found", 404);
  } catch (error) {
    return jsonError(error);
  }
}
