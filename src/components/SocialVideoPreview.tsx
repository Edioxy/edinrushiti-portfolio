"use client";

import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { InstagramReelPreview } from "@/components/InstagramReelPlayer";
import { buildTikTokEmbedUrl, getTikTokVideoId, type VideoSource } from "@/lib/video";

type SocialVideoPreviewProps = {
  title: string;
  thumbnail?: string;
  video?: VideoSource;
  rawVideoUrl?: string;
  large?: boolean;
  vertical?: boolean;
};

export function SocialVideoPreview({
  title,
  thumbnail,
  video,
  rawVideoUrl,
  large = false,
  vertical = false,
}: SocialVideoPreviewProps) {
  const previewSrc = thumbnail?.trim();
  const [imageFailed, setImageFailed] = useState(false);
  const [fetchedThumbnail, setFetchedThumbnail] = useState<string>();
  const tiktokId =
    video?.type === "tiktok"
      ? getTikTokVideoId(video.href) ?? getTikTokVideoId(rawVideoUrl ?? "")
      : null;
  const sourceUrl = rawVideoUrl?.trim() || video?.href;
  const resolvedThumbnail = previewSrc || fetchedThumbnail;

  useEffect(() => {
    setImageFailed(false);
    setFetchedThumbnail(undefined);
  }, [previewSrc, sourceUrl, video?.type]);

  useEffect(() => {
    if (previewSrc || !sourceUrl) {
      return;
    }

    if (video?.type !== "instagram" && !/instagram\.com/.test(sourceUrl)) {
      return;
    }

    let cancelled = false;

    void fetch(`/api/instagram/media?url=${encodeURIComponent(sourceUrl)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { thumbnail?: string | null; thumbnailUrl?: string | null }) => {
        const thumbnail = data.thumbnailUrl ?? data.thumbnail;
        if (!cancelled && thumbnail) {
          setFetchedThumbnail(thumbnail);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [previewSrc, sourceUrl, video?.type]);

  if (resolvedThumbnail && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedThumbnail}
        alt={title}
        loading="lazy"
        onError={() => setImageFailed(true)}
        className="h-full w-full object-cover"
      />
    );
  }

  if (tiktokId) {
    return (
      <iframe
        src={buildTikTokEmbedUrl(tiktokId, false)}
        title={title}
        loading="lazy"
        allow="encrypted-media; picture-in-picture"
        className="pointer-events-none h-full w-full border-0 bg-black"
      />
    );
  }

  if (video?.type === "instagram" || /instagram\.com/.test(rawVideoUrl ?? "")) {
    return (
      <InstagramReelPreview video={video} title={title} rawVideoUrl={rawVideoUrl} />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-b from-[#161616] via-[#0a0a0a] to-black ${
        vertical ? "" : "bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-black"
      }`}
    >
      <div
        className={`relative flex items-center justify-center rounded-full border border-white/10 bg-white/5 ${
          large ? "h-16 w-16" : vertical ? "h-14 w-14" : "h-16 w-16"
        }`}
      >
        <Play className={`ml-0.5 fill-white text-white ${large ? "h-6 w-6" : "h-5 w-5"}`} />
      </div>
    </div>
  );
}
