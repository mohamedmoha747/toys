import { listProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ids = url.searchParams.get("ids");
  const products = await listProducts({
    category: url.searchParams.get("category") || undefined,
    q: url.searchParams.get("q") || undefined,
    sort: url.searchParams.get("sort") || undefined,
    ids: ids ? ids.split(",") : undefined,
  });
  const { listCategories } = await import("@/lib/shop");
  return Response.json({ products, categories: await listCategories() });
}
