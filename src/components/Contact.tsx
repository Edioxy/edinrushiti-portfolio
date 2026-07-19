"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { siteConfig } from "@/data/site";

const socialLinks = [
  {
    label: "Instagram",
    href: siteConfig.socials.instagram,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.5]">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: siteConfig.socials.youtube,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.5]">
        <path d="M3 8.5c0-1.2.9-2.2 2.1-2.3C8.6 5.8 12 5.8 12 5.8s3.4 0 6.9.4c1.2.1 2.1 1.1 2.1 2.3v7c0 1.2-.9 2.2-2.1 2.3-3.5.4-6.9.4-6.9.4s-3.4 0-6.9-.4A2.25 2.25 0 0 1 3 15.5v-7Z" />
        <path d="M10.5 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: siteConfig.socials.linkedin,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.5]">
        <path d="M7 10v8M7 7v.01M11 18v-5a2 2 0 0 1 4 0v5M5 6.5A2.5 2.5 0 1 1 5 11.5 2.5 2.5 0 0 1 5 6.5Z" />
        <path d="M5 18V10M11 18v-5" />
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    ),
  },
] as const;

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    const subject = encodeURIComponent(`Project Inquiry — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );

    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="scroll-mt-24 px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-white/5 p-8 sm:p-12 lg:border-r lg:border-b-0">
              <p className="mb-4 text-[11px] tracking-[0.35em] text-white/35 uppercase">
                Contact
              </p>
              <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
                Let&apos;s Build Your Next Visual
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/45">
                Available for commercial campaigns, UGC batches, and long-form
                cinematic projects. Share your brief and timeline — I&apos;ll respond
                within 24 hours.
              </p>

              <div className="mt-10 space-y-4">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="group flex items-center gap-3 text-white transition-colors hover:text-white/80"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="text-sm">{siteConfig.email}</span>
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </div>

              <div className="mt-10 flex items-center gap-3">
                {socialLinks.map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-white/30 hover:text-white"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="p-8 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-[11px] tracking-[0.2em] text-white/35 uppercase">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-[11px] tracking-[0.2em] text-white/35 uppercase">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-[11px] tracking-[0.2em] text-white/35 uppercase">
                    Project Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                    placeholder="Tell me about your project, deliverables, and timeline..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-medium tracking-wide text-black transition-all hover:bg-white/90"
                >
                  Send Inquiry
                </button>

                {submitted && (
                  <p className="text-center text-sm text-white/50">
                    Opening your email client…
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
