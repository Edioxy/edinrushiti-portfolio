"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SocialClipPlayer } from "@/components/SocialClipPlayer";
import { YouTubeEmbedPlayer } from "@/components/YouTubeEmbedPlayer";
import { getVideoAspect, type VideoSource } from "@/lib/video";

export type VideoPlaylistItem = {
  id: string;
  title: string;
  meta?: string;
  thumbnail?: string;
  video: VideoSource;
};

type VideoModalProps = {
  open: boolean;
  playlist: VideoPlaylistItem[];
  startId?: string;
  onClose: () => void;
};

export function VideoModal({
  open,
  playlist,
  startId,
  onClose,
}: VideoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = playlist[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < playlist.length - 1;

  useEffect(() => {
    if (!open) return;

    const index = startId ? playlist.findIndex((item) => item.id === startId) : 0;
    setCurrentIndex(index >= 0 ? index : 0);
  }, [open, startId, playlist]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setCurrentIndex((value) => Math.max(0, value - 1));
      }
      if (event.key === "ArrowRight") {
        setCurrentIndex((value) => Math.min(playlist.length - 1, value + 1));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, playlist.length]);

  const iframeKey = useMemo(
    () => (current ? `${current.id}-${currentIndex}` : "empty"),
    [current, currentIndex],
  );

  if (!open || !current) return null;

  const isVertical = getVideoAspect(current.video) === "9/16";
  const aspectClass = isVertical
    ? "aspect-[9/16] max-h-[78vh] max-w-sm"
    : "aspect-video max-w-5xl";
  const isSocialClip =
    current.video.type === "tiktok" || current.video.type === "instagram";
  const isYouTube = current.video.type === "youtube";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
    >
      <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4 px-1">
          <div>
            {current.meta && (
              <p className="mb-2 text-[10px] tracking-[0.3em] text-white/35 uppercase">
                {current.meta}
              </p>
            )}
            <h2 className="text-lg font-medium tracking-tight text-white sm:text-xl">
              {current.title}
            </h2>
            {playlist.length > 1 && (
              <p className="mt-2 text-[11px] tracking-[0.2em] text-white/30 uppercase">
                {currentIndex + 1} / {playlist.length}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-white/30 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex items-center justify-center gap-3 sm:gap-5">
          {playlist.length > 1 && (
            <button
              type="button"
              onClick={() => setCurrentIndex((value) => value - 1)}
              disabled={!hasPrevious}
              aria-label="Previous video"
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#121212]/80 text-white/60 backdrop-blur transition-all hover:border-white/30 hover:text-white disabled:opacity-20 sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className={`relative w-full ${aspectClass}`}>
            {playlist.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((value) => value - 1)}
                  disabled={!hasPrevious}
                  aria-label="Previous video"
                  className="absolute top-1/2 left-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur transition-all hover:border-white/30 hover:text-white disabled:opacity-0 sm:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((value) => value + 1)}
                  disabled={!hasNext}
                  aria-label="Next video"
                  className="absolute top-1/2 right-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur transition-all hover:border-white/30 hover:text-white disabled:opacity-0 sm:hidden"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {current.video.type === "file" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                key={iframeKey}
                src={current.video.embedUrl}
                controls
                autoPlay
                playsInline
                className="h-full w-full rounded-2xl bg-black object-contain"
              />
            ) : isSocialClip ? (
              <SocialClipPlayer
                video={current.video}
                title={current.title}
                resetKey={iframeKey}
                poster={current.thumbnail}
              />
            ) : isYouTube ? (
              <YouTubeEmbedPlayer video={current.video} resetKey={iframeKey} />
            ) : current.video.embedUrl ? (
              <iframe
                key={iframeKey}
                src={current.video.embedUrl}
                title={current.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                scrolling="no"
                className="h-full w-full rounded-2xl bg-black"
              />
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-white/10 bg-[#121212]">
                <a
                  href={current.video.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
                >
                  Open Video
                </a>
              </div>
            )}
          </div>

          {playlist.length > 1 && (
            <button
              type="button"
              onClick={() => setCurrentIndex((value) => value + 1)}
              disabled={!hasNext}
              aria-label="Next video"
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#121212]/80 text-white/60 backdrop-blur transition-all hover:border-white/30 hover:text-white disabled:opacity-20 sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {playlist.length > 1 && hasNext && (
          <div className="mt-5 flex justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => setCurrentIndex((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm tracking-wide text-white/80 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              Next Project
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
