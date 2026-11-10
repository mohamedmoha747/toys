import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role, SessionUser } from "./types";
import { ServiceError } from "./errors";

export const SESSION_COOKIE = "limee_session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "limee-dev-secret-change-me-32bytes");
}

export async function signSession(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = String(payload.role || "") as Role;
    if (!payload.sub || (role !== "customer" && role !== "staff" && role !== "superadmin")) return null;
    return {
      id: String(payload.sub),
      name: String(payload.name || ""),
      email: String(payload.email || ""),
      role,
    };
  } catch {
    return null;
  }
}

export function tokenFromRequest(req: Request) {
  const raw = req.headers.get("cookie") || "";
  const part = raw.split(/; */).find((item) => item.startsWith(`${SESSION_COOKIE}=`));
  return part ? decodeURIComponent(part.slice(SESSION_COOKIE.length + 1)) : "";
}

export function sessionCookie(token: string, maxAge = 60 * 60 * 24 * 7) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value || "";
  if (!token) return null;
  return verifySession(token);
}

export async function sessionFromRequest(req: Request) {
  const token = tokenFromRequest(req);
  if (!token) return null;
  return verifySession(token);
}

export async function requireUser(req: Request, roles?: Role[]) {
  const user = await sessionFromRequest(req);
  if (!user) throw new ServiceError("Please log in", 401);
  if (roles && !roles.includes(user.role)) throw new ServiceError("You cannot do that", 403);
  return user;
}

export function assertSuper(user: SessionUser) {
  if (user.role !== "superadmin") throw new ServiceError("Only a super admin can do that", 403);
}
