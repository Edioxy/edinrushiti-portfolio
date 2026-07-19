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
    return NextResponse.json({ thumbnail: null });
  }

  const thumbnail = await fetchTikTokThumbnail(normalizeTikTokUrl(video.href), {
    revalidate: false,
  });

  return NextResponse.json(
    { thumbnail: thumbnail ?? null },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
