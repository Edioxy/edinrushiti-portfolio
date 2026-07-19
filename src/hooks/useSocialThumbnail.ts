"use client";

import { useEffect, useState } from "react";
import type { VideoSource } from "@/lib/video";

export function useSocialThumbnail(
  storedThumbnail: string | undefined,
  video?: VideoSource,
) {
  const [thumbnail, setThumbnail] = useState(storedThumbnail);

  useEffect(() => {
    setThumbnail(storedThumbnail);
  }, [storedThumbnail]);

  useEffect(() => {
    if (thumbnail?.trim() || video?.type !== "tiktok" || !video.href) {
      return;
    }

    let cancelled = false;

    void fetch(`/api/oembed?url=${encodeURIComponent(video.href)}`)
      .then((response) => response.json())
      .then((data: { thumbnail?: string | null }) => {
        if (!cancelled && data.thumbnail) {
          setThumbnail(data.thumbnail);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [thumbnail, video]);

  return thumbnail;
}
