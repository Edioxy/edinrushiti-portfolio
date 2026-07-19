import { DEFAULT_SECTIONS } from "@/lib/content-types";
import { siteConfig } from "@/data/site";

type FooterProps = {
  siteName?: string;
};

export function Footer({ siteName = DEFAULT_SECTIONS.siteName }: FooterProps) {
  return (
    <footer className="border-t border-white/5 px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-white/35">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
        <p className="text-[11px] tracking-[0.25em] text-white/25 uppercase">
          {siteConfig.domain}
        </p>
      </div>
    </footer>
  );
}
