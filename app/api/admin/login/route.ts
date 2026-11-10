import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!isAdmin(req)) return Response.json({ error: "Wrong password" }, { status: 401 });
  return Response.json({ ok: true });
}
