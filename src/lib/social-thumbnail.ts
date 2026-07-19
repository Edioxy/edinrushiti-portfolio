import type { PortfolioContentFile } from "@/lib/content-types";
import {
  getTikTokVideoId,
  normalizeTikTokUrl,
  parseVideoInput,
  type VideoSource,
} from "@/lib/video";

export function getVideoPreviewSrc(
  thumbnail: string | undefined,
  video?: VideoSource,
  rawVideoUrl?: string,
) {
  const manual = thumbnail?.trim();
  if (manual) return manual;

  const videoUrl = rawVideoUrl?.trim() || video?.href;
  if (video?.type === "tiktok" && videoUrl) {
    return `/api/thumbnail?url=${encodeURIComponent(videoUrl)}`;
  }

  return undefined;
}

type TikTokOEmbed = {
  thumbnail_url?: string;
};

type FetchTikTokThumbnailOptions = {
  revalidate?: number | false;
};

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const TIKTOK_FETCH_HEADERS = {
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent": BROWSER_USER_AGENT,
};

const TIKTOK_PAGE_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent": BROWSER_USER_AGENT,
};

function decodeEscapedUrl(value: string) {
  return value
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&");
}

function extractTikTokCoverFromHtml(html: string) {
  const patterns = [
    /"originCover":"(https:\\u002F\\u002F[^"]+)"/,
    /"cover":"(https:\\u002F\\u002F[^"]+)"/,
    /"dynamicCover":"(https:\\u002F\\u002F[^"]+)"/,
    /"thumbnail_url":"(https:\\u002F\\u002F[^"]+)"/,
    /property="og:image"\s+content="([^"]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const decoded = decodeEscapedUrl(match[1]).trim();
      if (decoded.startsWith("http")) {
        return decoded;
      }
    }
  }

  return undefined;
}

async function fetchTikTokThumbnailFromPage(videoUrl: string) {
  try {
    const normalizedUrl = normalizeTikTokUrl(videoUrl);
    const response = await fetch(normalizedUrl, {
      cache: "no-store",
      headers: TIKTOK_PAGE_HEADERS,
    });

    if (!response.ok) return undefined;

    const html = await response.text();
    return extractTikTokCoverFromHtml(html);
  } catch {
    return undefined;
  }
}

async function fetchTikTokThumbnailFromOEmbed(
  videoUrl: string,
  options: FetchTikTokThumbnailOptions,
) {
  try {
    const normalizedUrl = normalizeTikTokUrl(videoUrl);
    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
      headers: TIKTOK_FETCH_HEADERS,
    };

    if (options.revalidate === false) {
      fetchOptions.cache = "no-store";
    } else {
      fetchOptions.next = { revalidate: options.revalidate ?? 300 };
    }

    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(normalizedUrl)}`,
      fetchOptions,
    );

    if (!response.ok) return undefined;

    const data = (await response.json()) as TikTokOEmbed;
    return data.thumbnail_url?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export async function fetchTikTokThumbnail(
  videoUrl: string,
  options: FetchTikTokThumbnailOptions = {},
) {
  const normalizedUrl = normalizeTikTokUrl(videoUrl);
  if (!getTikTokVideoId(normalizedUrl)) {
    return undefined;
  }

  const oEmbedThumbnail = await fetchTikTokThumbnailFromOEmbed(normalizedUrl, options);
  if (oEmbedThumbnail) {
    return oEmbedThumbnail;
  }

  return fetchTikTokThumbnailFromPage(normalizedUrl);
}

export async function resolveSocialThumbnail(
  manualThumbnail: string | undefined,
  video?: VideoSource,
) {
  const manual = manualThumbnail?.trim();
  if (manual) return manual;
  if (video?.thumbnail) return video.thumbnail;

  if (video?.type === "tiktok") {
    return fetchTikTokThumbnail(video.href, { revalidate: 300 });
  }

  return undefined;
}

type ThumbnailableItem = {
  video?: string;
  thumbnail?: string;
};

async function enrichItemThumbnail<T extends ThumbnailableItem>(item: T): Promise<T> {
  if (item.thumbnail?.trim() || !item.video?.trim()) {
    return item;
  }

  const parsed = parseVideoInput(item.video);
  if (parsed?.type !== "tiktok") {
    return item;
  }

  const thumbnail = await fetchTikTokThumbnail(parsed.href, { revalidate: false });
  if (!thumbnail) {
    return item;
  }

  return { ...item, thumbnail };
}

export async function enrichContentThumbnails(content: PortfolioContentFile) {
  const [portfolio, ugc] = await Promise.all([
    Promise.all(content.portfolio.map(enrichItemThumbnail)),
    Promise.all(content.ugc.map(enrichItemThumbnail)),
  ]);

  return {
    ...content,
    portfolio,
    ugc,
  };
}
