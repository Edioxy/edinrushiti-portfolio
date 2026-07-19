"use client";

import { useEffect, useState } from "react";
import {
  buildInstagramEmbedUrl,
  getInstagramShortcode,
  type VideoSource,
} from "@/lib/video";

type InstagramMediaResponse = {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
};

function useInstagramMedia(sourceUrl: string | undefined, resetKey?: string) {
  const [media, setMedia] = useState<InstagramMediaResponse>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setMedia(undefined);
    setFailed(false);

    if (!sourceUrl) {
      setFailed(true);
      return;
    }

    let cancelled = false;

    void fetch(`/api/instagram/media?url=${encodeURIComponent(sourceUrl)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: InstagramMediaResponse) => {
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

type InstagramReelPlayerProps = {
  video: VideoSource;
  title: string;
  resetKey: string;
};

export function InstagramReelPlayer({ video, title, resetKey }: InstagramReelPlayerProps) {
  const shortcode =
    getInstagramShortcode(video.href) ?? getInstagramShortcode(video.embedUrl ?? "");
  const { media, failed, loading } = useInstagramMedia(video.href, resetKey);

  if (media?.videoUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          key={resetKey}
          src={media.videoUrl}
          poster={media.thumbnailUrl ?? undefined}
          title={title}
          controls
          autoPlay
          playsInline
          className="h-full w-full bg-black object-contain"
        />
      </div>
    );
  }

  if (failed || !shortcode) {
    return <InstagramEmbedFallback shortcode={shortcode} title={title} resetKey={resetKey} />;
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-black">
      {loading && <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />}
    </div>
  );
}

export function InstagramReelPreview({
  video,
  title,
  rawVideoUrl,
}: {
  video?: VideoSource;
  title: string;
  rawVideoUrl?: string;
}) {
  const sourceUrl = rawVideoUrl?.trim() || video?.href;
  const { media, failed } = useInstagramMedia(sourceUrl);

  if (media?.thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.thumbnailUrl}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }

  if (failed) {
    const shortcode =
      getInstagramShortcode(video?.href ?? "") ??
      getInstagramShortcode(rawVideoUrl ?? "") ??
      getInstagramShortcode(video?.embedUrl ?? "");

    return (
      <InstagramEmbedFallback
        shortcode={shortcode}
        title={title}
        resetKey={sourceUrl ?? title}
        preview
      />
    );
  }

  return <div className="h-full w-full animate-pulse bg-[#111]" />;
}

function InstagramEmbedFallback({
  shortcode,
  title,
  resetKey,
  preview = false,
}: {
  shortcode: string | null;
  title: string;
  resetKey: string;
  preview?: boolean;
}) {
  if (!shortcode) {
    return null;
  }

  const embedUrl = buildInstagramEmbedUrl(shortcode, "reel", {
    autoplay: !preview,
    muted: preview ? true : false,
  });

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <iframe
        key={resetKey}
        src={embedUrl}
        title={title}
        loading="lazy"
        scrolling="no"
        allow={
          preview
            ? "encrypted-media; picture-in-picture"
            : "autoplay; fullscreen; encrypted-media; picture-in-picture"
        }
        allowFullScreen={!preview}
        className={
          preview
            ? "pointer-events-none absolute left-1/2 top-1/2 h-[132%] w-[104%] -translate-x-1/2 -translate-y-[48%] border-0 bg-black"
            : "absolute left-1/2 top-1/2 h-[132%] w-[104%] -translate-x-1/2 -translate-y-[48%] border-0 bg-black"
        }
      />
    </div>
  );
}
