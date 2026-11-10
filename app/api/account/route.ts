import { jsonError } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { updateAccount } from "@/lib/shop";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const user = await requireUser(req);
    const body = (await req.json()) as { name?: string; mobile?: string; address?: string };
    return Response.json({ account: await updateAccount(user.id, body) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const orders = await listOrders({ userId: user.id });
    return Response.json({ orders });
  } catch (error) {
    return jsonError(error);
  }
}
