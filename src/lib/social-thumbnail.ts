import type { PortfolioContentFile } from "@/lib/content-types";
import { normalizeTikTokUrl, parseVideoInput, type VideoSource } from "@/lib/video";

type TikTokOEmbed = {
  thumbnail_url?: string;
};

type FetchTikTokThumbnailOptions = {
  revalidate?: number | false;
};

const TIKTOK_FETCH_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (compatible; EdinRushitiPortfolio/1.0; +https://edinrushiti.com)",
};

export async function fetchTikTokThumbnail(
  videoUrl: string,
  options: FetchTikTokThumbnailOptions = {},
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
