"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "UGC", href: "#ugc" },
  { label: "Tools", href: "#tools" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/5 bg-black/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <a
          href="#"
          className="text-sm font-medium tracking-[0.2em] text-white uppercase transition-opacity hover:opacity-70"
        >
          {siteConfig.name}
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] tracking-wide text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="rounded-full border border-white/15 px-4 py-2 text-[13px] tracking-wide text-white transition-all hover:border-white/40 hover:bg-white/5"
        >
          Book a Project
        </a>
      </div>
    </header>
  );
}
