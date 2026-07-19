import { getYouTubeIdFromSource, type VideoSource } from "@/lib/video";

const INNERTUBE_KEY = "AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w";
const INNERTUBE_UA = "com.google.android.youtube/20.10.38";
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

type InnertubeFormat = {
  url?: string;
  mimeType?: string;
  height?: number;
  qualityLabel?: string;
};

type InnertubePlayerResponse = {
  playabilityStatus?: { status?: string };
  streamingData?: {
    formats?: InnertubeFormat[];
  };
  videoDetails?: {
    thumbnail?: {
      thumbnails?: Array<{ url?: string }>;
    };
  };
};

export type YouTubeEmbedMedia = {
  videoId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  qualityLabel?: string;
};

function pickProgressiveFormat(formats: InnertubeFormat[]) {
  const progressive = formats.filter(
    (format) =>
      format.url &&
      format.mimeType?.includes("mp4") &&
      format.mimeType.includes("mp4a"),
  );

  progressive.sort((left, right) => (right.height ?? 0) - (left.height ?? 0));
  return progressive[0];
}

function buildMediaFromPlayerResponse(videoId: string, data: InnertubePlayerResponse) {
  if (data.playabilityStatus?.status !== "OK") {
    return undefined;
  }

  const bestFormat = pickProgressiveFormat(data.streamingData?.formats ?? []);
  if (!bestFormat?.url) {
    return undefined;
  }

  const thumbnailUrl =
    data.videoDetails?.thumbnail?.thumbnails?.at(-1)?.url ??
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return {
    videoId,
    videoUrl: bestFormat.url,
    thumbnailUrl,
    qualityLabel: bestFormat.qualityLabel,
  } satisfies YouTubeEmbedMedia;
}

async function fetchYouTubePlayerResponseFromInnertube(videoId: string) {
  try {
    const response = await fetch(
      `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": INNERTUBE_UA,
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "20.10.38",
            },
          },
          videoId,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) return undefined;

    return (await response.json()) as InnertubePlayerResponse;
  } catch {
    return undefined;
  }
}

function parsePlayerResponseFromHtml(html: string) {
  const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\})\s*;/);
  if (!match?.[1]) return undefined;

  try {
    return JSON.parse(match[1]) as InnertubePlayerResponse;
  } catch {
    return undefined;
  }
}

async function fetchYouTubePlayerResponseFromPage(videoId: string) {
  const urls = [
    `https://www.youtube.com/shorts/${videoId}`,
    `https://www.youtube.com/watch?v=${videoId}&bpctr=9999999999&has_verified=1`,
    `https://www.youtube.com/watch?v=${videoId}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent": BROWSER_UA,
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const playerResponse = parsePlayerResponseFromHtml(html);
      if (playerResponse?.playabilityStatus?.status === "OK") {
        return playerResponse;
      }
    } catch {
      continue;
    }
  }

  return undefined;
}

export async function fetchYouTubeEmbedMedia(videoId: string) {
  const normalizedVideoId = videoId.trim();
  if (!normalizedVideoId) return undefined;

  const innertubeResponse = await fetchYouTubePlayerResponseFromInnertube(normalizedVideoId);
  const fromInnertube = innertubeResponse
    ? buildMediaFromPlayerResponse(normalizedVideoId, innertubeResponse)
    : undefined;

  if (fromInnertube) {
    return fromInnertube;
  }

  const pageResponse = await fetchYouTubePlayerResponseFromPage(normalizedVideoId);
  if (!pageResponse) {
    return undefined;
  }

  return buildMediaFromPlayerResponse(normalizedVideoId, pageResponse);
}

export async function fetchYouTubeEmbedMediaFromSource(video: VideoSource) {
  const videoId = getYouTubeIdFromSource(video);
  if (!videoId) return undefined;

  return fetchYouTubeEmbedMedia(videoId);
}

export function buildYouTubeStreamUrl(videoId: string) {
  return `/api/youtube/stream?videoId=${encodeURIComponent(videoId)}`;
}
