import { jsonError } from "@/lib/errors";
import { loginUser } from "@/lib/shop";
import { sessionCookie, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const user = await loginUser(String(body.email || ""), String(body.password || ""));
    const token = await signSession(user);
    const response = Response.json({ user });
    response.headers.set("Set-Cookie", sessionCookie(token));
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
