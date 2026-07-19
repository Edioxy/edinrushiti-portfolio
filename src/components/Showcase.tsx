import { PortfolioGrid } from "@/components/PortfolioGrid";
import { DEFAULT_SECTIONS, type SiteSections } from "@/lib/content-types";
import type { PortfolioVideo } from "@/lib/video";

type ShowcaseProps = {
  items: PortfolioVideo[];
  sections?: SiteSections;
};

export function Showcase({ items, sections = DEFAULT_SECTIONS }: ShowcaseProps) {
  const { portfolio } = sections;

  return (
    <section id="work" className="scroll-mt-24 px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-[11px] tracking-[0.35em] text-white/35 uppercase">
            {portfolio.eyebrow}
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
            {portfolio.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/45">{portfolio.description}</p>
        </div>

        <PortfolioGrid items={items} />
      </div>
    </section>
  );
}
