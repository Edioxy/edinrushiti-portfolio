export type RawPortfolioItem = {
  title: string;
  category: string;
  description: string;
  video?: string;
  thumbnail?: string;
};

export type RawUgcItem = {
  title: string;
  brand?: string;
  video?: string;
  thumbnail?: string;
};

export type SiteSettings = {
  email: string;
  instagram: string;
  youtube: string;
  linkedin: string;
};

export type SectionBlock = {
  eyebrow: string;
  heading: string;
  description: string;
};

export type HeroSection = {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  scrollLabel: string;
  backgroundVideoUrl?: string;
  backgroundStartSeconds?: number;
  backgroundEndSeconds?: number;
  backgroundBlur?: number;
  backgroundVideoOpacity?: number;
  backgroundDarkness?: number;
};

export type UgcSection = SectionBlock & {
  badge: string;
  highlights: [string, string, string];
};

export type SiteSections = {
  siteName: string;
  headerCta: string;
  hero: HeroSection;
  portfolio: SectionBlock;
  ugc: UgcSection;
  tools: SectionBlock;
  contact: SectionBlock;
};

export type PortfolioContentFile = {
  _readme?: string;
  settings?: SiteSettings;
  sections?: SiteSections;
  portfolio: RawPortfolioItem[];
  ugc: RawUgcItem[];
};

export const DEFAULT_SETTINGS: SiteSettings = {
  email: "hello@edinrushiti.com",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
  linkedin: "https://linkedin.com/",
};

export const DEFAULT_SECTIONS: SiteSections = {
  siteName: "Edin Rushiti",
  headerCta: "Book a Project",
  hero: {
    eyebrow: "Professional Video Editor & Content Director",
    headingLine1: "10+ Years of Crafting",
    headingLine2: "High-Impact Visuals",
    description:
      "Premium commercial edits, cinematic storytelling, and scroll-stopping UGC — engineered for brands that demand visual excellence.",
    primaryCta: "View Work",
    secondaryCta: "Contact Me",
    scrollLabel: "Scroll",
    backgroundVideoUrl: "",
    backgroundStartSeconds: 0,
    backgroundEndSeconds: 0,
    backgroundBlur: 40,
    backgroundVideoOpacity: 60,
    backgroundDarkness: 35,
  },
  portfolio: {
    eyebrow: "Portfolio",
    heading: "Commercial & Cinematic Work",
    description:
      "Premium commercial and cinematic edits curated for brand and campaign work.",
  },
  ugc: {
    eyebrow: "UGC Edits",
    heading: "Scroll-Stopping Vertical Content",
    description:
      "Dedicated UGC portfolio in native 9:16 format — optimized for TikTok, Reels, and paid social. Swipe through recent client-ready edits.",
    badge: "9:16 Native",
    highlights: [
      "Hook-first pacing for paid social",
      "Brand-safe captions & on-screen text",
      "Fast turnaround for campaign batches",
    ],
  },
  tools: {
    eyebrow: "Technical Arsenal",
    heading: "Tools & Advanced Pipelines",
    description:
      "From traditional post-production to generative AI workflows — built for commercial speed without sacrificing cinematic quality.",
  },
  contact: {
    eyebrow: "Contact",
    heading: "Let's Build Your Next Visual",
    description:
      "Available for commercial campaigns, UGC batches, and long-form cinematic projects. Share your brief and timeline — I'll respond within 24 hours.",
  },
};

export const CONTENT_FILE_PATH = "content/portfolio.json";

export function createEmptyPortfolioItem(): RawPortfolioItem {
  return {
    title: "New Project",
    category: "Commercial",
    description: "Short description of this edit.",
    video: "",
    thumbnail: "",
  };
}

export function createEmptyUgcItem(): RawUgcItem {
  return {
    title: "New UGC Edit",
    brand: "Client Name",
    video: "",
    thumbnail: "",
  };
}

export function normalizeContent(input: PortfolioContentFile): PortfolioContentFile {
  const ugcHighlights = input.sections?.ugc?.highlights;
  const highlights: [string, string, string] =
    ugcHighlights?.length === 3
      ? [ugcHighlights[0], ugcHighlights[1], ugcHighlights[2]]
      : DEFAULT_SECTIONS.ugc.highlights;

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...input.settings,
    },
    sections: {
      ...DEFAULT_SECTIONS,
      ...input.sections,
      hero: { ...DEFAULT_SECTIONS.hero, ...input.sections?.hero },
      portfolio: { ...DEFAULT_SECTIONS.portfolio, ...input.sections?.portfolio },
      ugc: {
        ...DEFAULT_SECTIONS.ugc,
        ...input.sections?.ugc,
        highlights,
      },
      tools: { ...DEFAULT_SECTIONS.tools, ...input.sections?.tools },
      contact: { ...DEFAULT_SECTIONS.contact, ...input.sections?.contact },
    },
    portfolio: input.portfolio ?? [],
    ugc: input.ugc ?? [],
  };
}
