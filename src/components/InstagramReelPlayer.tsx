"use client";

import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NativeVideoLoading, NativeVideoPlayer } from "@/components/NativeVideoPlayer";
import {
  buildInstagramEmbedUrl,
  getInstagramShortcode,
  type VideoSource,
} from "@/lib/video";
import { buildInstagramLocalFallbackUrl } from "@/lib/instagram-media";

type InstagramMediaResponse = {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
};

function useInstagramMedia(
  sourceUrl: string | undefined,
  resetKey?: string,
  enabled = true,
) {
  const [media, setMedia] = useState<InstagramMediaResponse>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    setMedia(undefined);
    setFailed(false);

    if (!enabled || !sourceUrl) {
      if (!sourceUrl) {
        setFailed(true);
      }
      return;
    }

    let cancelled = false;

    const run = async () => {
      for (let index = 0; index < 3; index += 1) {
        try {
          const response = await fetch(`/api/instagram/media?url=${encodeURIComponent(sourceUrl)}`);
          if (!response.ok) {
            throw new Error("Instagram media unavailable");
          }

          const data = (await response.json()) as InstagramMediaResponse;
          if (data.videoUrl) {
            if (!cancelled) {
              setMedia(data);
              setFailed(false);
            }
            return;
          }
        } catch {
          if (index < 2) {
            await new Promise((resolve) => window.setTimeout(resolve, 600 * (index + 1)));
          }
        }
      }

      if (!cancelled) {
        setFailed(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [enabled, sourceUrl, resetKey, attempt]);

  return { media, failed, loading: enabled && !media && !failed, retry };
}

type InstagramReelPlayerProps = {
  video: VideoSource;
  title: string;
  resetKey: string;
  poster?: string;
};

export function InstagramReelPlayer({ video, title, resetKey, poster }: InstagramReelPlayerProps) {
  const shortcode =
    getInstagramShortcode(video.href) ?? getInstagramShortcode(video.embedUrl ?? "");
  const localFallback = shortcode ? buildInstagramLocalFallbackUrl(shortcode) : undefined;
  const { media, failed, loading, retry } = useInstagramMedia(video.href, resetKey);
  const [localFailed, setLocalFailed] = useState(false);
  const resolvedPoster = poster || media?.thumbnailUrl || undefined;

  useEffect(() => {
    setLocalFailed(false);
  }, [resetKey, video.href]);

  if (localFallback && localFailed) {
    return (
      <NativeVideoPlayer
        resetKey={`${resetKey}-local`}
        src={localFallback}
        poster={resolvedPoster}
        title={title}
      />
    );
  }

  if (media?.videoUrl && !localFailed) {
    return (
      <NativeVideoPlayer
        resetKey={resetKey}
        src={media.videoUrl}
        poster={resolvedPoster}
        title={title}
        onError={() => {
          if (localFallback) {
            setLocalFailed(true);
            return;
          }
          retry();
        }}
      />
    );
  }

  if (failed || !shortcode) {
    if (localFallback) {
      return (
        <NativeVideoPlayer
          resetKey={`${resetKey}-local`}
          src={localFallback}
          poster={resolvedPoster}
          title={title}
        />
      );
    }

    return (
      <InstagramOpenFallback href={video.href} poster={resolvedPoster} title={title} onRetry={retry} />
    );
  }

  if (loading) {
    return <NativeVideoLoading />;
  }

  return null;
}

export function InstagramReelPreview({
  video,
  title,
  rawVideoUrl,
  poster,
}: {
  video?: VideoSource;
  title: string;
  rawVideoUrl?: string;
  poster?: string;
}) {
  const sourceUrl = rawVideoUrl?.trim() || video?.href;
  const { media, failed } = useInstagramMedia(sourceUrl, undefined, Boolean(sourceUrl));
  const resolvedPoster = poster || media?.thumbnailUrl;

  if (resolvedPoster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedPoster}
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

    if (shortcode) {
      return (
        <InstagramEmbedPreview
          shortcode={shortcode}
          title={title}
          resetKey={sourceUrl ?? title}
        />
      );
    }
  }

  return <div className="h-full w-full animate-pulse bg-[#111]" />;
}

function InstagramEmbedPreview({
  shortcode,
  title,
  resetKey,
}: {
  shortcode: string;
  title: string;
  resetKey: string;
}) {
  const embedUrl = buildInstagramEmbedUrl(shortcode, "reel", { autoplay: false, muted: true });

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <iframe
        key={resetKey}
        src={embedUrl}
        title={title}
        loading="lazy"
        scrolling="no"
        allow="encrypted-media; picture-in-picture"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[155%] w-[108%] -translate-x-1/2 -translate-y-[54%] border-0 bg-black"
      />
    </div>
  );
}

function InstagramOpenFallback({
  href,
  poster,
  title,
  onRetry,
}: {
  href: string;
  poster?: string;
  title: string;
  onRetry: () => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-black">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-35" />
      ) : null}
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
        >
          Watch on Instagram
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={onRetry}
          className="text-sm text-white/60 transition-colors hover:text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
