import { isAdmin } from "@/lib/auth";
import { CatalogError, createProduct, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  if (error instanceof CatalogError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return Response.json(
    listProducts({
      category: url.searchParams.get("category") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      sort: url.searchParams.get("sort") ?? undefined,
    }),
  );
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return Response.json({ error: "Wrong password" }, { status: 401 });
  try {
    const body = (await req.json()) as Record<string, unknown>;
    return Response.json({ product: createProduct(body) }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
