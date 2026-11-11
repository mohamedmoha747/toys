import { requireUser } from "@/lib/auth";
import { jsonError, ServiceError } from "@/lib/errors";
import { MAX_IMAGE_BYTES } from "@/lib/images";
import { saveImage } from "@/lib/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireUser(req, ["staff", "superadmin"]);
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") throw new ServiceError("Choose an image");
    if (file.size === 0) throw new ServiceError("Choose an image");
    if (file.size > MAX_IMAGE_BYTES) throw new ServiceError("Image must be under 4MB");
    const bytes = Buffer.from(await file.arrayBuffer());
    const saved = await saveImage(bytes);
    return Response.json({ url: saved.url });
  } catch (error) {
    return jsonError(error);
  }
}
