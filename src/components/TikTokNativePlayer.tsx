"use client";

import { useEffect, useState } from "react";
import {
  NativeVideoLoading,
  NativeVideoPlayer,
  NativeVideoPreview,
} from "@/components/NativeVideoPlayer";
import { buildTikTokEmbedUrl, getTikTokVideoId, type VideoSource } from "@/lib/video";

type TikTokMediaResponse = {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
};

function useTikTokMedia(sourceUrl: string | undefined, resetKey?: string) {
  const [media, setMedia] = useState<TikTokMediaResponse>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setMedia(undefined);
    setFailed(false);

    if (!sourceUrl) {
      setFailed(true);
      return;
    }

    let cancelled = false;

    void fetch(`/api/tiktok/media?url=${encodeURIComponent(sourceUrl)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: TikTokMediaResponse) => {
        if (!cancelled) {
          if (data.videoUrl) {
            setMedia(data);
          } else {
            setFailed(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sourceUrl, resetKey]);

  return { media, failed, loading: !media && !failed };
}

type TikTokNativePlayerProps = {
  video: VideoSource;
  title: string;
  resetKey: string;
};

export function TikTokNativePlayer({ video, title, resetKey }: TikTokNativePlayerProps) {
  const videoId = getTikTokVideoId(video.href) ?? getTikTokVideoId(video.embedUrl ?? "");
  const { media, failed, loading } = useTikTokMedia(video.href, resetKey);

  if (media?.videoUrl) {
    return (
      <NativeVideoPlayer
        resetKey={resetKey}
        src={media.videoUrl}
        poster={media.thumbnailUrl ?? undefined}
        title={title}
      />
    );
  }

  if (failed || !videoId) {
    return <TikTokEmbedFallback videoId={videoId} title={title} resetKey={resetKey} />;
  }

  if (loading) {
    return <NativeVideoLoading />;
  }

  return null;
}

export function TikTokNativePreview({
  video,
  title,
  rawVideoUrl,
}: {
  video?: VideoSource;
  title: string;
  rawVideoUrl?: string;
}) {
  const sourceUrl = rawVideoUrl?.trim() || video?.href;
  const { media, failed } = useTikTokMedia(sourceUrl);
  const videoId =
    getTikTokVideoId(video?.href ?? "") ??
    getTikTokVideoId(rawVideoUrl ?? "") ??
    getTikTokVideoId(video?.embedUrl ?? "");

  if (media?.thumbnailUrl || media?.videoUrl) {
    return (
      <NativeVideoPreview
        poster={media.thumbnailUrl ?? undefined}
        src={media.thumbnailUrl ? undefined : (media.videoUrl ?? undefined)}
        title={title}
      />
    );
  }

  if (failed) {
    return (
      <TikTokEmbedFallback
        videoId={videoId}
        title={title}
        resetKey={sourceUrl ?? title}
        preview
      />
    );
  }

  return <div className="h-full w-full animate-pulse bg-[#111]" />;
}

function TikTokEmbedFallback({
  videoId,
  title,
  resetKey,
  preview = false,
}: {
  videoId: string | null;
  title: string;
  resetKey: string;
  preview?: boolean;
}) {
  if (!videoId) {
    return null;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <iframe
        key={resetKey}
        src={buildTikTokEmbedUrl(videoId, !preview)}
        title={title}
        loading="lazy"
        allow={
          preview
            ? "encrypted-media; picture-in-picture"
            : "autoplay; fullscreen; encrypted-media; picture-in-picture"
        }
        allowFullScreen={!preview}
        className={`h-full w-full border-0 bg-black ${preview ? "pointer-events-none" : ""}`}
      />
    </div>
  );
}
