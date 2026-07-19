import type { PortfolioVideo } from "@/lib/video";
import { VideoCard } from "./VideoCard";

type ShowcaseProps = {
  items: PortfolioVideo[];
};

export function Showcase({ items }: ShowcaseProps) {
  return (
    <section id="work" className="scroll-mt-24 px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-[11px] tracking-[0.35em] text-white/35 uppercase">
            Portfolio
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
            Commercial & Cinematic Work
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/45">
            Premium commercial and cinematic edits curated for brand and campaign work.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
