"use client";

import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { InstagramReelPreview } from "@/components/InstagramReelPlayer";
import { TikTokNativePreview } from "@/components/TikTokNativePlayer";
import { type VideoSource } from "@/lib/video";

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
  const sourceUrl = rawVideoUrl?.trim() || video?.href;
  const resolvedThumbnail = previewSrc || fetchedThumbnail;
  const isTikTok = video?.type === "tiktok" || /tiktok\.com/.test(sourceUrl ?? "");
  const isInstagram = video?.type === "instagram" || /instagram\.com/.test(sourceUrl ?? "");

  useEffect(() => {
    setImageFailed(false);
    setFetchedThumbnail(undefined);
  }, [previewSrc, sourceUrl, video?.type]);

  useEffect(() => {
    if (previewSrc || !sourceUrl) {
      return;
    }

    const mediaEndpoint = isTikTok
      ? `/api/tiktok/media?url=${encodeURIComponent(sourceUrl)}`
      : isInstagram
        ? `/api/instagram/media?url=${encodeURIComponent(sourceUrl)}`
        : null;

    if (!mediaEndpoint) {
      return;
    }

    let cancelled = false;

    void fetch(mediaEndpoint)
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { thumbnail?: string | null; thumbnailUrl?: string | null }) => {
        const nextThumbnail = data.thumbnailUrl ?? data.thumbnail;
        if (!cancelled && nextThumbnail) {
          setFetchedThumbnail(nextThumbnail);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [previewSrc, sourceUrl, isInstagram, isTikTok]);

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

  if (video?.type === "file" || (rawVideoUrl?.trim().startsWith("/") && /\.(mp4|webm)$/i.test(rawVideoUrl))) {
    const src = video?.embedUrl ?? video?.href ?? rawVideoUrl?.trim();
    if (!src) {
      return null;
    }

    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={src}
          title={title}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (isTikTok) {
    return <TikTokNativePreview video={video} title={title} rawVideoUrl={rawVideoUrl} />;
  }

  if (isInstagram) {
    return <InstagramReelPreview video={video} title={title} rawVideoUrl={rawVideoUrl} />;
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
