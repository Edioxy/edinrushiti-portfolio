import { NextResponse } from "next/server";
import { fetchInstagramEmbedMedia } from "@/lib/instagram-media";

export const dynamic = "force-dynamic";

const INSTAGRAM_REFERER = "https://www.instagram.com/";
const INSTAGRAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

export async function GET(request: Request) {
  const shortcode = new URL(request.url).searchParams.get("shortcode")?.trim();

  if (!shortcode) {
    return NextResponse.json({ error: "Missing shortcode parameter" }, { status: 400 });
  }

  const media = await fetchInstagramEmbedMedia(shortcode);

  if (!media?.videoUrl) {
    return NextResponse.json({ error: "Instagram video unavailable" }, { status: 404 });
  }

  const range = request.headers.get("range");
  const upstreamHeaders: HeadersInit = {
    Referer: INSTAGRAM_REFERER,
    "User-Agent": INSTAGRAM_UA,
  };

  if (range) {
    upstreamHeaders.Range = range;
  }

  let upstream: Response;

  try {
    upstream = await fetch(media.videoUrl, {
      headers: upstreamHeaders,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch Instagram video" }, { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: "Instagram video unavailable" }, { status: upstream.status });
  }

  const responseHeaders = new Headers();
  const passthroughHeaders = [
    "Content-Type",
    "Content-Length",
    "Content-Range",
    "Accept-Ranges",
  ] as const;

  for (const header of passthroughHeaders) {
    const value = upstream.headers.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  }

  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", "video/mp4");
  }

  if (!responseHeaders.has("Accept-Ranges")) {
    responseHeaders.set("Accept-Ranges", "bytes");
  }

  responseHeaders.set("Cache-Control", "private, max-age=3600");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
