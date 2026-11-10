import { filterMeta, listProducts } from "@/lib/shop";
import { jsonError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ids = url.searchParams.get("ids");
    const [products, meta] = await Promise.all([
      listProducts({
        category: url.searchParams.get("category") || undefined,
        q: url.searchParams.get("q") || undefined,
        brand: url.searchParams.get("brand") || undefined,
        age: url.searchParams.get("age") || undefined,
        min: Number(url.searchParams.get("min") || 0) || undefined,
        max: Number(url.searchParams.get("max") || 0) || undefined,
        stock: url.searchParams.get("stock") || undefined,
        sort: url.searchParams.get("sort") || undefined,
        deals: url.searchParams.get("deals") === "1",
        ids: ids ? ids.split(",") : undefined,
      }),
      filterMeta(),
    ]);
    return Response.json({ products, ...meta });
  } catch (error) {
    return jsonError(error);
  }
}
