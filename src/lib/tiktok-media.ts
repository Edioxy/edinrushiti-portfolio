import { getTikTokVideoId, normalizeTikTokUrl } from "@/lib/video";

const TIKTOK_PAGE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

export type TikTokEmbedMedia = {
  videoId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  pageUrl: string;
  cookieHeader?: string;
};

function decodeEscapedUrl(value: string) {
  return value
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&");
}

function extractJsonStringField(html: string, field: string) {
  const match = html.match(new RegExp(`"${field}":"(https:[^"]+)"`));
  if (!match?.[1]) return undefined;

  const decoded = decodeEscapedUrl(match[1]).trim();
  return decoded.startsWith("http") ? decoded : undefined;
}

function buildCookieHeader(setCookieHeaders: string[]) {
  return setCookieHeaders
    .map((entry) => entry.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function resolveTikTokPageUrl(videoUrl: string) {
  const normalizedUrl = normalizeTikTokUrl(videoUrl);
  if (normalizedUrl.includes("/@")) {
    return normalizedUrl;
  }

  const videoId = getTikTokVideoId(normalizedUrl);
  if (!videoId) {
    return normalizedUrl;
  }

  try {
    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(normalizedUrl)}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json,text/plain,*/*",
          "User-Agent": TIKTOK_PAGE_UA,
        },
      },
    );

    if (!response.ok) {
      return normalizedUrl;
    }

    const data = (await response.json()) as { author_url?: string };
    if (data.author_url) {
      return `${data.author_url.replace(/\/$/, "")}/video/${videoId}`;
    }
  } catch {
    return normalizedUrl;
  }

  return normalizedUrl;
}

export async function fetchTikTokEmbedMedia(videoUrl: string) {
  const normalizedUrl = normalizeTikTokUrl(videoUrl);
  const videoId = getTikTokVideoId(normalizedUrl);
  if (!videoId) return undefined;

  const pageUrl = await resolveTikTokPageUrl(normalizedUrl);

  try {
    const response = await fetch(pageUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": TIKTOK_PAGE_UA,
      },
    });

    if (!response.ok) return undefined;

    const html = await response.text();
    const directVideoUrl =
      extractJsonStringField(html, "playAddr") ??
      extractJsonStringField(html, "downloadAddr");

    if (!directVideoUrl) return undefined;

    const thumbnailUrl =
      extractJsonStringField(html, "originCover") ??
      extractJsonStringField(html, "dynamicCover") ??
      extractJsonStringField(html, "cover");

    const cookieHeader = buildCookieHeader(response.headers.getSetCookie?.() ?? []);

    return {
      videoId,
      videoUrl: directVideoUrl,
      thumbnailUrl,
      pageUrl,
      cookieHeader: cookieHeader || undefined,
    } satisfies TikTokEmbedMedia;
  } catch {
    return undefined;
  }
}

export function buildTikTokStreamUrl(videoId: string) {
  return `/api/tiktok/stream?videoId=${encodeURIComponent(videoId)}`;
}
