import { portfolioItems } from "@/data/site";
import { VideoCard } from "./VideoCard";

export function Showcase() {
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
            A selection of premium brand films and cinematic edits. Replace placeholders
            with your embedded players or video links in{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-sm text-white/70">
              src/data/site.ts
            </code>
            .
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {portfolioItems.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
