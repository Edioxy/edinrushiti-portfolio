"use client";

import { Play } from "lucide-react";
import { getVideoPreviewSrc } from "@/lib/social-thumbnail";
import type { PortfolioVideo } from "@/lib/video";

type VideoCardProps = {
  item: PortfolioVideo;
  onPlay: (id: string) => void;
};

export function VideoCard({ item, onPlay }: VideoCardProps) {
  const hasVideo = Boolean(item.video);
  const previewSrc = getVideoPreviewSrc(item.thumbnail, item.video);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#121212] transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_-24px_rgba(255,255,255,0.12)]">
      <button
        type="button"
        disabled={!hasVideo}
        onClick={() => onPlay(item.id)}
        className="relative block w-full overflow-hidden text-left disabled:cursor-default"
        aria-label={hasVideo ? `Play ${item.title}` : item.title}
      >
        <div className="relative aspect-video overflow-hidden bg-[#0a0a0a]">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_50%)]" />
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 ${
                  hasVideo
                    ? "group-hover:scale-110 group-hover:border-white/25 group-hover:bg-white/10"
                    : "opacity-40"
                }`}
              >
                <Play className="ml-1 h-6 w-6 fill-white text-white" />
              </div>
            </div>
          )}

          {hasVideo && (
            <>
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
                  <Play className="ml-1 h-5 w-5 fill-white text-white" />
                </div>
              </div>
            </>
          )}
        </div>
      </button>

      <div className="p-5 sm:p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] tracking-[0.25em] text-white/35 uppercase">
            {item.category}
          </span>
          <span className="text-[10px] text-white/25">16:9</span>
        </div>
        <h3 className="text-lg font-medium tracking-tight text-white">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/45">{item.description}</p>
      </div>
    </article>
  );
}
