import { jsonError } from "@/lib/errors";
import { sessionFromRequest } from "@/lib/auth";
import { addReview, listReviews } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("product") || "";
  return Response.json({ reviews: await listReviews(productId, true) });
}

export async function POST(req: Request) {
  try {
    const session = await sessionFromRequest(req);
    const body = (await req.json()) as { productId?: string; authorName?: string; rating?: number; text?: string };
    const review = await addReview({
      productId: String(body.productId || ""),
      authorName: String(body.authorName || session?.name || ""),
      rating: Number(body.rating || 0),
      text: String(body.text || ""),
      userId: session?.id,
    });
    return Response.json({ review }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
