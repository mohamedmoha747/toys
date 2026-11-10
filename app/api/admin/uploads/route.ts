import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireUser(req, ["staff", "superadmin"]);
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose an image" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > 4_000_000) return Response.json({ error: "Image must be under 4MB" }, { status: 400 });
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-40);
    const name = `${Date.now()}-${safe || "photo.jpg"}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), bytes);
    return Response.json({ url: `/uploads/${name}` });
  } catch (error) {
    return jsonError(error);
  }
}
