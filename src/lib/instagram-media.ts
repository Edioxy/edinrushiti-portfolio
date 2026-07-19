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

function extractEmbedField(html: string, field: string) {
  const pattern = new RegExp(`${field}\\\\":\\\\"(.*?)\\\\"`);
  const match = html.match(pattern);
  if (!match?.[1]) return undefined;

  return decodeEscapedUrl(match[1]).trim() || undefined;
}

async function fetchEmbedHtml(shortcode: string) {
  const embedPaths = [`reel/${shortcode}`, `p/${shortcode}`];

  for (const path of embedPaths) {
    try {
      const response = await fetch(`https://www.instagram.com/${path}/embed/`, {
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent": INSTAGRAM_EMBED_UA,
        },
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

  const html = await fetchEmbedHtml(normalizedShortcode);
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
