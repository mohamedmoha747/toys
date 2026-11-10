import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const { products } = listProducts({ q });
  return Response.json({ products });
}
