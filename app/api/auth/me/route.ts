import { sessionFromRequest } from "@/lib/auth";
import { getAccount } from "@/lib/shop";
import { jsonError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await sessionFromRequest(req);
    if (!session) return Response.json({ user: null });
    const account = await getAccount(session.id);
    return Response.json({ user: account });
  } catch (error) {
    return jsonError(error);
  }
}
