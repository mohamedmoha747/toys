import { isAdmin } from "@/lib/auth";
import { CatalogError, deleteProduct, getProduct, updateProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  if (error instanceof CatalogError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const product = getProduct(id);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
  return Response.json({ product });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return Response.json({ error: "Wrong password" }, { status: 401 });
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    return Response.json({ product: updateProduct(id, body) });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return Response.json({ error: "Wrong password" }, { status: 401 });
  try {
    const { id } = await ctx.params;
    deleteProduct(id);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
