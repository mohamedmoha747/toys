import { isAdmin } from "@/lib/auth";
import { CatalogError, deleteCategory, getCategoryBundle, updateCategory } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  if (error instanceof CatalogError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bundle = getCategoryBundle(id);
  if (!bundle) return Response.json({ error: "Category not found" }, { status: 404 });
  return Response.json(bundle);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return Response.json({ error: "Wrong password" }, { status: 401 });
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    return Response.json({ category: updateCategory(id, body) });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return Response.json({ error: "Wrong password" }, { status: 401 });
  try {
    const { id } = await ctx.params;
    deleteCategory(id);
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
