import { ArrowDown } from "lucide-react";
import { DEFAULT_SECTIONS, type SiteSections } from "@/lib/content-types";

type HeroProps = {
  sections?: SiteSections;
};

export function Hero({ sections = DEFAULT_SECTIONS }: HeroProps) {
  const { hero } = sections;

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute right-0 bottom-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-6 text-[11px] tracking-[0.35em] text-white/40 uppercase">
          {hero.eyebrow}
        </p>

        <h1 className="text-4xl leading-[1.05] font-light tracking-tight text-white sm:text-6xl lg:text-7xl">
          {hero.headingLine1}
          <span className="block text-white/90">{hero.headingLine2}</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg">
          {hero.description}
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#work"
            className="group inline-flex h-12 min-w-[160px] items-center justify-center rounded-full bg-white px-8 text-sm font-medium tracking-wide text-black transition-all hover:bg-white/90"
          >
            {hero.primaryCta}
          </a>
          <a
            href="#contact"
            className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full border border-white/20 px-8 text-sm tracking-wide text-white transition-all hover:border-white/50 hover:bg-white/5"
          >
            {hero.secondaryCta}
          </a>
        </div>

        <a
          href="#work"
          aria-label="Scroll to work"
          className="mt-20 inline-flex flex-col items-center gap-2 text-white/30 transition-colors hover:text-white/60"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">{hero.scrollLabel}</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
