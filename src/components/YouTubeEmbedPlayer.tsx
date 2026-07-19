"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NativeVideoLoading, NativeVideoPlayer } from "@/components/NativeVideoPlayer";
import { loadYouTubeApi, type YouTubePlayerInstance } from "@/lib/youtube-player-api";
import { getYouTubeIdFromSource, getYouTubeIframePlayerVars, type VideoSource } from "@/lib/video";

type YouTubeEmbedPlayerProps = {
  video: VideoSource;
  resetKey: string;
};

type YouTubeMediaResponse = {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
};

const SHORT_IFRAME_CROP_CLASS =
  "absolute left-1/2 top-1/2 h-[142%] w-[318%] max-w-none -translate-x-1/2 -translate-y-[48%] [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0";

function disableYouTubeCaptions(player: YouTubePlayerInstance) {
  try {
    player.setOption?.("captions", "track", {});
  } catch {
    // Ignore if captions module is unavailable.
  }
}

function useYouTubeNativeMedia(
  sourceUrl: string | undefined,
  enabled: boolean,
  resetKey: string,
) {
  const [media, setMedia] = useState<YouTubeMediaResponse>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setMedia(undefined);
    setFailed(false);

    if (!enabled || !sourceUrl) {
      return;
    }

    let cancelled = false;

    void fetch(`/api/youtube/media?url=${encodeURIComponent(sourceUrl)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: YouTubeMediaResponse) => {
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
  }, [enabled, sourceUrl, resetKey]);

  return { media, failed, loading: enabled && !media && !failed };
}

export function YouTubeEmbedPlayer({ video, resetKey }: YouTubeEmbedPlayerProps) {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const playerDomId = useId().replace(/:/g, "");
  const videoId = getYouTubeIdFromSource(video);
  const isShort = video.variant === "short";
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const tryNative = isShort && !useIframeFallback;
  const { media, failed, loading } = useYouTubeNativeMedia(video.href, tryNative, resetKey);
  const shouldUseIframe = !isShort || useIframeFallback || failed;

  useEffect(() => {
    setUseIframeFallback(false);
  }, [resetKey, video.href]);

  useEffect(() => {
    if (failed && isShort) {
      setUseIframeFallback(true);
    }
  }, [failed, isShort]);

  useEffect(() => {
    if (!videoId || !shouldUseIframe) return;

    let cancelled = false;

    void loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;

      playerRef.current?.destroy();
      playerRef.current = null;

      const player = new window.YT.Player(playerDomId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: getYouTubeIframePlayerVars({
          short: isShort,
          videoId,
        }),
        events: {
          onReady: (event) => {
            disableYouTubeCaptions(event.target);
            event.target.unMute();
            event.target.playVideo();
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId, playerDomId, resetKey, isShort, shouldUseIframe]);

  if (!videoId) return null;

  if (tryNative && media?.videoUrl) {
    return (
      <NativeVideoPlayer
        resetKey={resetKey}
        src={media.videoUrl}
        poster={media.thumbnailUrl ?? undefined}
        title={video.href}
        loop
        muted
        onError={() => setUseIframeFallback(true)}
      />
    );
  }

  if (tryNative && loading) {
    return <NativeVideoLoading />;
  }

  if (isShort) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black">
        <div id={playerDomId} className={SHORT_IFRAME_CROP_CLASS} />
      </div>
    );
  }

  return (
    <div
      id={playerDomId}
      className="h-full w-full overflow-hidden rounded-2xl bg-black [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
    />
  );
}
