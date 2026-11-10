import { listCategories } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ categories: await listCategories() });
}
