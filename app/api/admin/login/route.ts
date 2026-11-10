export async function POST() {
  return Response.json({ error: "Use /api/auth/login" }, { status: 410 });
}
