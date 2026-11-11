import { ServiceError } from "./errors";
import { imageContentType, MAX_IMAGE_BYTES } from "./images";
import { MediaModel } from "./models";
import { connectDb } from "./mongodb";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function asBuffer(value: unknown): Buffer | null {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === "object") {
    const binary = value as { value?: (raw?: boolean) => Uint8Array | string };
    if (typeof binary.value === "function") {
      const raw = binary.value(true);
      if (typeof raw !== "string" && raw instanceof Uint8Array) return Buffer.from(raw);
    }
  }
  return null;
}

export async function saveImage(bytes: Buffer) {
  if (bytes.length > MAX_IMAGE_BYTES) throw new ServiceError("Image must be under 4MB");
  const contentType = imageContentType(bytes);
  if (!contentType) throw new ServiceError("Choose a JPEG, PNG, WebP, or GIF image");
  await connectDb();
  const doc = await MediaModel.create({ data: bytes, contentType, size: bytes.length });
  return { url: `/api/media/${doc._id}` };
}

export async function readImage(id: string) {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  await connectDb();
  const doc = await MediaModel.findById(id).select("data contentType");
  if (!doc || !ALLOWED.has(String(doc.contentType))) return null;
  const data = asBuffer(doc.data);
  if (!data || data.length === 0) return null;
  return { data, contentType: String(doc.contentType) };
}
