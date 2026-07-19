import { DEFAULT_SECTIONS, type SiteSections } from "@/lib/content-types";
import { tools } from "@/data/site";

type TechnicalArsenalProps = {
  sections?: SiteSections;
};

export function TechnicalArsenal({ sections = DEFAULT_SECTIONS }: TechnicalArsenalProps) {
  const { tools: toolsSection } = sections;

  return (
    <section id="tools" className="scroll-mt-24 px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-[11px] tracking-[0.35em] text-white/35 uppercase">
            {toolsSection.eyebrow}
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
            {toolsSection.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/45">
            {toolsSection.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <article
              key={tool.name}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#121212] p-6 transition-all duration-500 hover:border-white/15"
            >
              <div className="absolute top-4 right-4 text-[11px] tracking-[0.2em] text-white/15">
                {String(index + 1).padStart(2, "0")}
              </div>

              <p className="mb-3 text-[10px] tracking-[0.25em] text-white/35 uppercase">
                {tool.category}
              </p>
              <h3 className="text-xl font-medium tracking-tight text-white transition-colors group-hover:text-white">
                {tool.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/45">{tool.description}</p>

              <div className="mt-6 h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
