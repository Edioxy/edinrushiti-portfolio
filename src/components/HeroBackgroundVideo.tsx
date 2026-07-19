"use client";

import { useEffect, useId, useRef } from "react";
import { loadYouTubeApi, type YouTubePlayerInstance } from "@/lib/youtube-player-api";
import { getYouTubeIdFromSource, parseVideoInput } from "@/lib/video";

type HeroBackgroundVideoProps = {
  videoUrl?: string;
  startSeconds?: number;
  endSeconds?: number;
  blur?: number;
  videoOpacity?: number;
  darkness?: number;
};

function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
function normalizeSeconds(value: number | undefined, fallback: number) {
  return clamp(value, 0, 60 * 60, fallback);
}

export function HeroBackgroundVideo({
  videoUrl,
  startSeconds = 0,
  endSeconds = 0,
  blur = 40,
  videoOpacity = 60,
  darkness = 35,
}: HeroBackgroundVideoProps) {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const loopTimerRef = useRef<number | null>(null);
  const playerDomId = useId().replace(/:/g, "");
  const trimmedUrl = videoUrl?.trim();
  const parsed = trimmedUrl ? parseVideoInput(trimmedUrl) : undefined;
  const videoId =
    parsed?.type === "youtube" ? getYouTubeIdFromSource(parsed) ?? undefined : undefined;

  const loopStart = normalizeSeconds(startSeconds, 0);
  const loopEnd = normalizeSeconds(endSeconds, 0);
  const hasValidLoop = loopEnd > loopStart;
  const blurAmount = clamp(blur, 0, 80, 40);
  const videoAlpha = clamp(videoOpacity, 0, 100, 60) / 100;
  const overlayAlpha = clamp(darkness, 0, 100, 35) / 100;
  const gradientTop = Math.min(overlayAlpha * 0.65, 0.55);
  const gradientMiddle = Math.min(overlayAlpha * 0.85, 0.75);

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;

    void loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;

      playerRef.current?.destroy();
      playerRef.current = null;

      if (loopTimerRef.current !== null) {
        window.clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }

      const player = new window.YT.Player(playerDomId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          start: Math.floor(loopStart),
          ...(hasValidLoop ? { end: Math.ceil(loopEnd) } : {}),
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.seekTo(loopStart, true);
            event.target.playVideo();

            if (hasValidLoop) {
              loopTimerRef.current = window.setInterval(() => {
                const currentTime = event.target.getCurrentTime();
                if (currentTime >= loopEnd - 0.15) {
                  event.target.seekTo(loopStart, true);
                  event.target.playVideo();
                }
              }, 200);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState?.ENDED) {
              event.target.seekTo(loopStart, true);
              event.target.playVideo();
            }
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;

      if (loopTimerRef.current !== null) {
        window.clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }

      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId, playerDomId, loopStart, loopEnd, hasValidLoop]);

  if (!videoId) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 scale-[1.35] saturate-150"
        style={{
          filter: `blur(${blurAmount}px)`,
          opacity: videoAlpha,
        }}
      >
        <div
          id={playerDomId}
          className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
        />
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayAlpha})` }} />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black via-black to-black"
        style={{
          opacity: 1,
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,${gradientTop}), rgba(0,0,0,${gradientMiddle}), rgba(0,0,0,${overlayAlpha}))`,
        }}
      />
    </div>
  );
}
