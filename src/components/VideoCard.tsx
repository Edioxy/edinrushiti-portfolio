import { Play } from "lucide-react";
import type { PortfolioItem } from "@/data/site";

type VideoCardProps = {
  item: PortfolioItem;
};

export function VideoCard({ item }: VideoCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#121212] transition-all duration-500 hover:border-white/15 hover:shadow-[0_24px_80px_-24px_rgba(255,255,255,0.12)]">
      <div className="relative aspect-video overflow-hidden bg-[#0a0a0a]">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_50%)]" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-white/25 group-hover:bg-white/10">
              <Play className="ml-1 h-6 w-6 fill-white text-white" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {item.videoUrl && (
          <a
            href={item.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-10"
            aria-label={`Watch ${item.title}`}
          />
        )}
      </div>

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
