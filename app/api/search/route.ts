import { listProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || "";
  const products = await listProducts({ q });
  return Response.json({ products });
}
