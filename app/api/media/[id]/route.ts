import { readImage } from "@/lib/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const image = await readImage(id);
    if (!image) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 });
  }
}
