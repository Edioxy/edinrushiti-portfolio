"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { SocialVideoPreview } from "@/components/SocialVideoPreview";
import type { UgcVideo } from "@/lib/video";
import { VideoModal, type VideoPlaylistItem } from "./VideoModal";

type UgcCardProps = {
  item: UgcVideo;
  onPlay: (id: string) => void;
};

function UgcCard({ item, onPlay }: UgcCardProps) {
  const hasVideo = Boolean(item.video);

  return (
    <article className="group w-[220px] shrink-0 snap-start sm:w-[260px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121212] transition-all duration-500 hover:border-white/15">
        <button
          type="button"
          disabled={!hasVideo}
          onClick={() => onPlay(item.id)}
          className="relative block w-full overflow-hidden text-left disabled:cursor-default"
          aria-label={hasVideo ? `Play ${item.title}` : item.title}
        >
          <div className="relative aspect-[9/16] overflow-hidden bg-[#0a0a0a]">
            <SocialVideoPreview
              title={item.title}
              thumbnail={item.thumbnail}
              video={item.video}
              vertical
            />

            {hasVideo && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
                  <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                </div>
              </div>
            )}
          </div>
        </button>

        <div className="p-4">
          {item.brand && (
            <p className="mb-1 text-[10px] tracking-[0.25em] text-white/35 uppercase">
              {item.brand}
            </p>
          )}
          <h3 className="text-sm font-medium tracking-tight text-white">{item.title}</h3>
        </div>
      </div>
    </article>
  );
}

type UgcCarouselProps = {
  items: UgcVideo[];
};

export function UgcCarousel({ items }: UgcCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [startId, setStartId] = useState<string>();

  const playlist = useMemo<VideoPlaylistItem[]>(
    () =>
      items
        .filter((item): item is UgcVideo & { video: NonNullable<UgcVideo["video"]> } =>
          Boolean(item.video),
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          meta: item.brand,
          thumbnail: item.thumbnail,
          video: item.video,
        })),
    [items],
  );

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === "left" ? -320 : 320;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" />

        <div className="absolute -top-14 right-0 hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll UGC left"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-white/30 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll UGC right"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-white/30 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <UgcCard
              key={item.id}
              item={item}
              onPlay={(id) => {
                setStartId(id);
                setOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      <VideoModal
        open={open}
        playlist={playlist}
        startId={startId}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
