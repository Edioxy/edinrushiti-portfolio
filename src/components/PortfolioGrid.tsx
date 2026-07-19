"use client";

import { useMemo, useState } from "react";
import type { PortfolioVideo } from "@/lib/video";
import { VideoCard } from "./VideoCard";
import { VideoModal, type VideoPlaylistItem } from "./VideoModal";

type PortfolioGridProps = {
  items: PortfolioVideo[];
};

export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [open, setOpen] = useState(false);
  const [startId, setStartId] = useState<string>();

  const playlist = useMemo<VideoPlaylistItem[]>(
    () =>
      items
        .filter((item): item is PortfolioVideo & { video: NonNullable<PortfolioVideo["video"]> } =>
          Boolean(item.video),
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          meta: item.category,
          video: item.video,
        })),
    [items],
  );

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <VideoCard
            key={item.id}
            item={item}
            onPlay={(id) => {
              setStartId(id);
              setOpen(true);
            }}
          />
        ))}
      </div>

      <VideoModal
        open={open}
        playlist={playlist}
        startId={startId}
        aspect="16/9"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
