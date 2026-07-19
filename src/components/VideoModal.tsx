"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import type { VideoSource } from "@/lib/video";

type VideoModalProps = {
  open: boolean;
  title: string;
  aspect?: "16/9" | "9/16";
  video?: VideoSource;
  onClose: () => void;
};

export function VideoModal({
  open,
  title,
  aspect = "16/9",
  video,
  onClose,
}: VideoModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !video) return null;

  const aspectClass = aspect === "9/16" ? "aspect-[9/16] max-w-sm" : "aspect-video max-w-5xl";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`relative w-full ${aspectClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {video.type === "file" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={video.embedUrl}
            controls
            autoPlay
            playsInline
            className="h-full w-full rounded-2xl bg-black object-contain"
          />
        ) : video.embedUrl ? (
          <iframe
            src={video.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full rounded-2xl bg-black"
          />
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-white/10 bg-[#121212]">
            <a
              href={video.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Open Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
