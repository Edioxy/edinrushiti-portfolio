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

export type PortfolioContentFile = {
  _readme?: string;
  settings?: SiteSettings;
  portfolio: RawPortfolioItem[];
  ugc: RawUgcItem[];
};

export const DEFAULT_SETTINGS: SiteSettings = {
  email: "hello@edinrushiti.com",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
  linkedin: "https://linkedin.com/",
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
  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...input.settings,
    },
    portfolio: input.portfolio ?? [],
    ugc: input.ugc ?? [],
  };
}
