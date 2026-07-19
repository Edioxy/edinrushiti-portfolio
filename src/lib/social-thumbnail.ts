import type { VideoSource } from "@/lib/video";

type TikTokOEmbed = {
  thumbnail_url?: string;
};

export async function fetchTikTokThumbnail(videoUrl: string) {
  try {
    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`,
      {
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) return undefined;

    const data = (await response.json()) as TikTokOEmbed;
    return data.thumbnail_url;
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
    return fetchTikTokThumbnail(video.href);
  }

  return undefined;
}
