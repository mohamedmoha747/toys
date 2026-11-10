import { jsonError } from "@/lib/errors";
import { quoteOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      mobile?: string;
      address?: string;
      items?: { productId: string; qty: number }[];
      couponCode?: string;
      paymentPreference?: "cod" | "upi";
    };
    const quote = await quoteOrder({
      name: String(body.name || "Quote Customer"),
      mobile: String(body.mobile || "0000000000"),
      address: String(body.address || "Chennai"),
      items: body.items || [],
      couponCode: body.couponCode,
      paymentPreference: body.paymentPreference,
    });
    return Response.json({
      productTotal: quote.productTotal,
      deliveryCharge: quote.deliveryCharge,
      discount: quote.discount,
      grandTotal: quote.grandTotal,
      itemCount: quote.itemCount,
      couponCode: quote.couponCode,
    });
  } catch (error) {
    return jsonError(error);
  }
}
