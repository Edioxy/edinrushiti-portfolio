"use client";

import { useEffect, useId, useRef } from "react";
import { loadYouTubeApi, type YouTubePlayerInstance } from "@/lib/youtube-player-api";
import { getYouTubeIdFromSource, type VideoSource } from "@/lib/video";

type YouTubeEmbedPlayerProps = {
  video: VideoSource;
  resetKey: string;
};

export function YouTubeEmbedPlayer({ video, resetKey }: YouTubeEmbedPlayerProps) {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const playerDomId = useId().replace(/:/g, "");
  const videoId = getYouTubeIdFromSource(video);
  const isShort = video.variant === "short";

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;

    void loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;

      playerRef.current?.destroy();
      playerRef.current = null;

      const player = new window.YT.Player(playerDomId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          ...(isShort ? { loop: 1, playlist: videoId } : {}),
        },
        events: {
          onReady: (event) => {
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
  }, [videoId, playerDomId, resetKey, isShort]);

  if (!videoId) return null;

  if (isShort) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black">
        <div
          id={playerDomId}
          className="absolute top-0 left-1/2 h-full w-[316%] max-w-none -translate-x-1/2 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
        />
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
