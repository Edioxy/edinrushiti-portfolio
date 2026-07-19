import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-white/35">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <p className="text-[11px] tracking-[0.25em] text-white/25 uppercase">
          {siteConfig.domain}
        </p>
      </div>
    </footer>
  );
}
