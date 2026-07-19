"use client";

import { ExternalLink } from "lucide-react";
import { InstagramReelPlayer } from "@/components/InstagramReelPlayer";
import { TikTokNativePlayer } from "@/components/TikTokNativePlayer";
import {
  getInstagramShortcode,
  type VideoSource,
} from "@/lib/video";

type SocialClipPlayerProps = {
  video: VideoSource;
  title: string;
  resetKey: string;
};

export function SocialClipPlayer({ video, title, resetKey }: SocialClipPlayerProps) {
  if (video.type === "tiktok") {
    return <TikTokNativePlayer video={video} title={title} resetKey={resetKey} />;
  }

  if (video.type === "instagram") {
    const shortcode =
      getInstagramShortcode(video.href) ?? getInstagramShortcode(video.embedUrl ?? "");
    if (!shortcode) {
      return <OpenLinkFallback href={video.href} label="Open on Instagram" />;
    }

    return <InstagramReelPlayer video={video} title={title} resetKey={resetKey} />;
  }

  if (video.embedUrl) {
    const embedUrl = video.embedUrl.includes("autoplay=1")
      ? video.embedUrl.replace(/([?&])mute=1(?=&|$)/, "$1mute=0")
      : `${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1&mute=0`;

    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <iframe
          key={resetKey}
          src={embedUrl}
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
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
      >
        {label}
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
