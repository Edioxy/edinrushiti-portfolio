import { NextResponse } from "next/server";
import { fetchInstagramThumbnail, fetchTikTokThumbnail } from "@/lib/social-thumbnail";
import { normalizeTikTokUrl, parseVideoInput } from "@/lib/video";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const video = parseVideoInput(url);
  let thumbnail: string | undefined;

  if (video?.type === "tiktok") {
    thumbnail = await fetchTikTokThumbnail(normalizeTikTokUrl(video.href), {
      revalidate: false,
    });
  } else if (video?.type === "instagram") {
    thumbnail = await fetchInstagramThumbnail(video.href);
  }

  return NextResponse.json(
    { thumbnail: thumbnail ?? null },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
