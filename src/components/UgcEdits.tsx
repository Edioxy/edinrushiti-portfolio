import { ugcItems } from "@/data/site";
import { UgcCarousel } from "./UgcCarousel";

export function UgcEdits() {
  return (
    <section
      id="ugc"
      className="scroll-mt-24 border-y border-white/5 bg-[#121212]/40 px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-[11px] tracking-[0.35em] text-white/35 uppercase">
              UGC Edits
            </p>
            <h2 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
              Scroll-Stopping Vertical Content
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/45">
              Dedicated UGC portfolio in native 9:16 format — optimized for TikTok,
              Reels, and paid social. Swipe through recent client-ready edits.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-[11px] tracking-[0.2em] text-white/50 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
            9:16 Native
          </div>
        </div>

        <UgcCarousel items={ugcItems} />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            "Hook-first pacing for paid social",
            "Brand-safe captions & on-screen text",
            "Fast turnaround for campaign batches",
          ].map((point) => (
            <div
              key={point}
              className="rounded-xl border border-white/5 bg-black/30 px-5 py-4 text-sm text-white/45"
            >
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
