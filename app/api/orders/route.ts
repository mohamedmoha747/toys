import { jsonError } from "@/lib/errors";
import { sessionFromRequest } from "@/lib/auth";
import { createOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await sessionFromRequest(req);
    const body = (await req.json()) as {
      name?: string;
      mobile?: string;
      address?: string;
      items?: { productId: string; qty: number }[];
      couponCode?: string;
      paymentPreference?: "cod" | "upi";
    };
    const result = await createOrder({
      name: String(body.name || ""),
      mobile: String(body.mobile || ""),
      address: String(body.address || ""),
      items: body.items || [],
      couponCode: body.couponCode,
      paymentPreference: body.paymentPreference,
      userId: session?.id,
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
