"use client";

import { Play } from "lucide-react";
import { useState } from "react";
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
  const tiktokId =
    video?.type === "tiktok"
      ? getTikTokVideoId(video.href) ?? getTikTokVideoId(rawVideoUrl ?? "")
      : null;

  if (previewSrc && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewSrc}
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
        className="h-full w-full border-0 bg-black pointer-events-none"
      />
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
