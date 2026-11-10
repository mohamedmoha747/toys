import { getProduct, listReviews, relatedProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const product = await getProduct(id);
  if (!product || !product.active) return Response.json({ error: "Product not found" }, { status: 404 });
  return Response.json({ product, related: await relatedProducts(product), reviews: await listReviews(product.id, true) });
}
