import { getYouTubeIdFromSource, type VideoSource } from "@/lib/video";

const INNERTUBE_KEY = "AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w";
const INNERTUBE_UA = "com.google.android.youtube/20.10.38";

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

export async function fetchYouTubeEmbedMedia(videoId: string) {
  const normalizedVideoId = videoId.trim();
  if (!normalizedVideoId) return undefined;

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
          videoId: normalizedVideoId,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) return undefined;

    const data = (await response.json()) as InnertubePlayerResponse;
    if (data.playabilityStatus?.status !== "OK") return undefined;

    const bestFormat = pickProgressiveFormat(data.streamingData?.formats ?? []);
    if (!bestFormat?.url) return undefined;

    const thumbnailUrl =
      data.videoDetails?.thumbnail?.thumbnails?.at(-1)?.url ??
      `https://img.youtube.com/vi/${normalizedVideoId}/maxresdefault.jpg`;

    return {
      videoId: normalizedVideoId,
      videoUrl: bestFormat.url,
      thumbnailUrl,
      qualityLabel: bestFormat.qualityLabel,
    } satisfies YouTubeEmbedMedia;
  } catch {
    return undefined;
  }
}

export async function fetchYouTubeEmbedMediaFromSource(video: VideoSource) {
  const videoId = getYouTubeIdFromSource(video);
  if (!videoId) return undefined;

  return fetchYouTubeEmbedMedia(videoId);
}

export function buildYouTubeStreamUrl(videoId: string) {
  return `/api/youtube/stream?videoId=${encodeURIComponent(videoId)}`;
}
