import { listCategories, listProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const categories = await listCategories();
  const category = categories.find((item) => item.slug === id || item.id === id);
  if (!category) return Response.json({ error: "Category not found" }, { status: 404 });
  const products = await listProducts({ category: category.slug });
  return Response.json({ category, products });
}
