import { NextResponse } from "next/server";
import { buildTikTokStreamUrl, fetchTikTokEmbedMedia } from "@/lib/tiktok-media";
import { getTikTokVideoId, normalizeTikTokUrl } from "@/lib/video";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawUrl = url.searchParams.get("url")?.trim();
  const videoId =
    url.searchParams.get("videoId")?.trim() ||
    (rawUrl ? getTikTokVideoId(normalizeTikTokUrl(rawUrl)) : null);

  if (!videoId || !rawUrl) {
    return NextResponse.json({ error: "Missing TikTok URL" }, { status: 400 });
  }

  const media = await fetchTikTokEmbedMedia(rawUrl);

  if (!media) {
    return NextResponse.json({ error: "TikTok media unavailable" }, { status: 404 });
  }

  return NextResponse.json(
    {
      videoId: media.videoId,
      videoUrl: buildTikTokStreamUrl(media.videoId),
      thumbnailUrl: media.thumbnailUrl ?? null,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}
