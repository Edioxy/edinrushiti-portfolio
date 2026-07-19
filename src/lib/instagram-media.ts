const INSTAGRAM_EMBED_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

export type InstagramEmbedMedia = {
  shortcode: string;
  videoUrl: string;
  thumbnailUrl?: string;
};

function decodeEscapedUrl(value: string) {
  return value
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/\\\\\//g, "/")
    .replace(/&amp;/g, "&");
}

function buildCookieHeader(setCookieHeaders: string[]) {
  return setCookieHeaders
    .map((entry) => entry.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

function extractEmbedField(html: string, field: string) {
  const patterns = [
    new RegExp(`${field}\\\\":\\\\"(.*?)\\\\"`),
    new RegExp(`"${field}":"(https:[^"]+)"`),
    new RegExp(`${field}":"(https:[^"]+)"`),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;

    const decoded = decodeEscapedUrl(match[1]).trim();
    if (decoded.startsWith("http")) {
      return decoded;
    }
  }

  return undefined;
}

async function createInstagramSession() {
  try {
    const response = await fetch("https://www.instagram.com/", {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": INSTAGRAM_EMBED_UA,
      },
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      return undefined;
    }

    return buildCookieHeader(response.headers.getSetCookie?.() ?? []);
  } catch {
    return undefined;
  }
}

async function fetchEmbedHtml(shortcode: string, cookieHeader?: string) {
  const embedPaths = [`reel/${shortcode}`, `p/${shortcode}`];
  const headers: HeadersInit = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": INSTAGRAM_EMBED_UA,
    Referer: "https://www.instagram.com/",
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  for (const path of embedPaths) {
    try {
      const response = await fetch(`https://www.instagram.com/${path}/embed/`, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) continue;

      const html = await response.text();
      if (html.includes("video_url")) {
        return html;
      }
    } catch {
      continue;
    }
  }

  return undefined;
}

export async function fetchInstagramEmbedMedia(shortcode: string) {
  const normalizedShortcode = shortcode.trim();
  if (!normalizedShortcode) return undefined;

  const cookieHeader = await createInstagramSession();
  let html = await fetchEmbedHtml(normalizedShortcode, cookieHeader);

  if (!html) {
    html = await fetchEmbedHtml(normalizedShortcode);
  }

  if (!html) return undefined;

  const videoUrl = extractEmbedField(html, "video_url");
  if (!videoUrl) return undefined;

  const thumbnailUrl =
    extractEmbedField(html, "display_url") ??
    extractEmbedField(html, "thumbnail_src");

  return {
    shortcode: normalizedShortcode,
    videoUrl,
    thumbnailUrl,
  } satisfies InstagramEmbedMedia;
}

export function buildInstagramStreamUrl(shortcode: string) {
  return `/api/instagram/stream?shortcode=${encodeURIComponent(shortcode)}`;
}

export function buildInstagramLocalFallbackUrl(shortcode: string) {
  return `/videos/instagram-${shortcode}.mp4`;
}
