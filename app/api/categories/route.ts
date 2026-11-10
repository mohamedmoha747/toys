import { isAdmin } from "@/lib/auth";
import { CatalogError, createCategory, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  if (error instanceof CatalogError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}

export async function GET() {
  const { categories } = listProducts();
  return Response.json({ categories });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return Response.json({ error: "Wrong password" }, { status: 401 });
  try {
    const body = (await req.json()) as Record<string, unknown>;
    return Response.json({ category: createCategory(body) }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
