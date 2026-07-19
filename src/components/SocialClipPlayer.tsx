"use client";

import { ExternalLink, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { buildTikTokEmbedUrl, getTikTokVideoId, type VideoSource } from "@/lib/video";

type SocialClipPlayerProps = {
  video: VideoSource;
  title: string;
  thumbnail?: string;
  resetKey: string;
};

export function SocialClipPlayer({
  video,
  title,
  thumbnail,
  resetKey,
}: SocialClipPlayerProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
  }, [resetKey]);

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group relative h-full w-full overflow-hidden rounded-2xl bg-black text-left"
        aria-label={`Play ${title}`}
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-gradient-to-b from-[#161616] to-black" />
        )}

        <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/45 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
            <Play className="ml-1 h-6 w-6 fill-white text-white" />
          </div>
          <p className="text-sm tracking-wide text-white/75">Tap to play</p>
        </div>

        <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] tracking-[0.2em] text-white/60 uppercase backdrop-blur-sm">
            {video.type === "tiktok" ? "TikTok" : "Instagram"}
          </span>
          <a
            href={video.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[11px] text-white/50 transition-colors hover:text-white"
          >
            Open original
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </button>
    );
  }

  if (video.type === "tiktok") {
    const videoId = getTikTokVideoId(video.href) ?? getTikTokVideoId(video.embedUrl ?? "");
    if (!videoId) {
      return <OpenLinkFallback href={video.href} label="Open on TikTok" />;
    }

    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <iframe
          key={resetKey}
          src={buildTikTokEmbedUrl(videoId, true)}
          title={title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0 bg-black"
        />
      </div>
    );
  }

  if (video.embedUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <iframe
          key={resetKey}
          src={video.embedUrl}
          title={title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          scrolling="no"
          className="h-full w-full border-0 bg-black"
        />
      </div>
    );
  }

  return <OpenLinkFallback href={video.href} label="Open video" />;
}

function OpenLinkFallback({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-[#121212]">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
      >
        {label}
      </a>
    </div>
  );
}
