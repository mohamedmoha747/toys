import { requireUser, sessionCookie, signSession } from "@/lib/auth";
import { jsonError } from "@/lib/errors";
import { getStaffProfile, updateStaffProfile } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req, ["staff", "superadmin"]);
    return Response.json({ profile: await getStaffProfile(user.id) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser(req, ["staff", "superadmin"]);
    const body = (await req.json()) as Record<string, unknown>;
    const profile = await updateStaffProfile(user.id, body);
    const token = await signSession({ id: profile.id, name: profile.name, email: profile.email, role: profile.role });
    const response = Response.json({ profile });
    response.headers.set("Set-Cookie", sessionCookie(token));
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
