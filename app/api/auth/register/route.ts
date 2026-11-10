import { jsonError } from "@/lib/errors";
import { registerCustomer } from "@/lib/shop";
import { sessionCookie, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; mobile?: string; password?: string };
    const user = await registerCustomer({
      name: String(body.name || ""),
      email: String(body.email || ""),
      mobile: String(body.mobile || ""),
      password: String(body.password || ""),
    });
    const token = await signSession(user);
    const response = Response.json({ user });
    response.headers.set("Set-Cookie", sessionCookie(token));
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
