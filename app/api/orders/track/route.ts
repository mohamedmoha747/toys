import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") || "";
  const order = await getOrder(code.trim());
  if (!order) return Response.json({ error: "No order with that ID" }, { status: 404 });
  return Response.json({
    order: { code: order.code, status: order.status, items: order.items.map((item) => item.name), grandTotal: order.grandTotal },
  });
}
