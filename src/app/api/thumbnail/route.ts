import { NextResponse } from "next/server";
import { fetchTikTokThumbnail } from "@/lib/social-thumbnail";
import { normalizeTikTokUrl, parseVideoInput } from "@/lib/video";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const video = parseVideoInput(url);

  if (video?.type !== "tiktok") {
    return new NextResponse(null, { status: 404 });
  }

  const thumbnail = await fetchTikTokThumbnail(normalizeTikTokUrl(video.href), {
    revalidate: false,
  });

  if (!thumbnail) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.redirect(thumbnail, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
    },
  });
}
