import { NextResponse } from "next/server";
import { proxyRemoteVideo } from "@/lib/stream-proxy";
import { fetchYouTubeEmbedMedia } from "@/lib/youtube-media";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const videoId = new URL(request.url).searchParams.get("videoId")?.trim();

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 });
  }

  const media = await fetchYouTubeEmbedMedia(videoId);

  if (!media?.videoUrl) {
    return NextResponse.json({ error: "YouTube video unavailable" }, { status: 404 });
  }

  try {
    const proxied = await proxyRemoteVideo(media.videoUrl, request, {
      referer: "https://www.youtube.com/",
      userAgent: "com.google.android.youtube/20.10.38",
    });

    if (!proxied.ok && proxied.status !== 206) {
      return NextResponse.json({ error: "YouTube video unavailable" }, { status: proxied.status });
    }

    return proxied;
  } catch {
    return NextResponse.json({ error: "Failed to fetch YouTube video" }, { status: 502 });
  }
}
