export function isAdmin(req: Request) {
  const key = req.headers.get("x-admin-key") || "";
  const expected = process.env.ADMIN_KEY || "lms-admin";
  return key.length > 0 && key === expected;
}
