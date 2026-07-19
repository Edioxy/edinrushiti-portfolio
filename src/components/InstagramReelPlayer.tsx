"use client";

import {
  buildInstagramEmbedUrl,
  getInstagramShortcode,
  type VideoSource,
} from "@/lib/video";

type InstagramReelPlayerProps = {
  video: VideoSource;
  title: string;
  resetKey: string;
};

export function InstagramReelPlayer({ video, title, resetKey }: InstagramReelPlayerProps) {
  const shortcode =
    getInstagramShortcode(video.href) ?? getInstagramShortcode(video.embedUrl ?? "");

  if (!shortcode) {
    return null;
  }

  const embedUrl = buildInstagramEmbedUrl(shortcode, "reel", {
    autoplay: true,
    muted: false,
  });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <iframe
        key={resetKey}
        src={embedUrl}
        title={title}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        scrolling="no"
        className="absolute left-1/2 top-1/2 h-[132%] w-[104%] -translate-x-1/2 -translate-y-[48%] border-0 bg-black"
      />
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
  const shortcode =
    getInstagramShortcode(video?.href ?? "") ??
    getInstagramShortcode(rawVideoUrl ?? "") ??
    getInstagramShortcode(video?.embedUrl ?? "");

  if (!shortcode) {
    return null;
  }

  const embedUrl = buildInstagramEmbedUrl(shortcode, "reel", { autoplay: false });

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        scrolling="no"
        allow="encrypted-media; picture-in-picture"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[132%] w-[104%] -translate-x-1/2 -translate-y-[48%] border-0 bg-black"
      />
    </div>
  );
}
