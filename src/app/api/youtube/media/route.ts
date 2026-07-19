import { NextResponse } from "next/server";
import { buildYouTubeStreamUrl, fetchYouTubeEmbedMedia } from "@/lib/youtube-media";
import { getYouTubeIdFromSource, parseVideoInput } from "@/lib/video";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawUrl = url.searchParams.get("url")?.trim();
  const parsed = rawUrl ? parseVideoInput(rawUrl) : null;
  const videoId =
    url.searchParams.get("videoId")?.trim() ||
    (parsed ? getYouTubeIdFromSource(parsed) : null);

  if (!videoId) {
    return NextResponse.json({ error: "Missing YouTube video ID" }, { status: 400 });
  }

  const media = await fetchYouTubeEmbedMedia(videoId);

  if (!media) {
    return NextResponse.json({ error: "YouTube media unavailable" }, { status: 404 });
  }

  return NextResponse.json(
    {
      videoId: media.videoId,
      videoUrl: buildYouTubeStreamUrl(media.videoId),
      thumbnailUrl: media.thumbnailUrl ?? null,
      qualityLabel: media.qualityLabel ?? null,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}
