import { NextResponse } from "next/server";
import { fetchTikTokEmbedMedia } from "@/lib/tiktok-media";
import { proxyRemoteVideo } from "@/lib/stream-proxy";
import { getTikTokVideoId } from "@/lib/video";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const videoId = new URL(request.url).searchParams.get("videoId")?.trim();

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 });
  }

  const media = await fetchTikTokEmbedMedia(`https://www.tiktok.com/video/${videoId}`);

  if (!media?.videoUrl) {
    return NextResponse.json({ error: "TikTok video unavailable" }, { status: 404 });
  }

  try {
    const proxied = await proxyRemoteVideo(media.videoUrl, request, {
      referer: media.pageUrl,
      cookie: media.cookieHeader,
    });

    if (!proxied.ok && proxied.status !== 206) {
      return NextResponse.json({ error: "TikTok video unavailable" }, { status: proxied.status });
    }

    return proxied;
  } catch {
    return NextResponse.json({ error: "Failed to fetch TikTok video" }, { status: 502 });
  }
}
