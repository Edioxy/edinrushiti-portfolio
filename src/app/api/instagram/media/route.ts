import { NextResponse } from "next/server";
import {
  buildInstagramStreamUrl,
  fetchInstagramEmbedMedia,
} from "@/lib/instagram-media";
import { getInstagramShortcode } from "@/lib/video";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawUrl = url.searchParams.get("url")?.trim();
  const shortcode =
    url.searchParams.get("shortcode")?.trim() ||
    (rawUrl ? getInstagramShortcode(rawUrl) : null);

  if (!shortcode) {
    return NextResponse.json({ error: "Missing Instagram shortcode" }, { status: 400 });
  }

  const media = await fetchInstagramEmbedMedia(shortcode);

  if (!media) {
    return NextResponse.json({ error: "Instagram media unavailable" }, { status: 404 });
  }

  return NextResponse.json(
    {
      shortcode: media.shortcode,
      videoUrl: buildInstagramStreamUrl(media.shortcode),
      thumbnailUrl: media.thumbnailUrl ?? null,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}
