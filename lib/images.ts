export const MAX_IMAGE_BYTES = 4_000_000;

const MEDIA_PATH = /^\/api\/media\/[a-f0-9]{24}$/i;

export function isAllowedProfilePhoto(photo: string) {
  return photo.startsWith("/uploads/") || MEDIA_PATH.test(photo);
}

export function imageContentType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | "image/gif" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export async function postAdminImage(file: File): Promise<string> {
  if (file.size <= 0) throw new Error("Choose an image");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be under 4MB");
  const body = new FormData();
  body.set("file", file);
  const res = await fetch("/api/admin/uploads", { method: "POST", body });
  let data: { error?: string; url?: string } = {};
  try {
    data = await res.json();
  } catch {
    if (res.status === 413) throw new Error("Image must be under 4MB");
    throw new Error("Upload failed");
  }
  if (!res.ok || !data.url) throw new Error(data.error || (res.status === 413 ? "Image must be under 4MB" : "Upload failed"));
  return data.url;
}
