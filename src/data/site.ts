export const siteConfig = {
  name: "Edin Rushiti",
  domain: "edinrushiti.com",
  title: "Professional Video Editor & Content Director",
  tagline: "10+ Years of Crafting High-Impact Visuals",
  description:
    "Premium commercial, cinematic, and UGC video editing with 10+ years of experience across Adobe Creative Suite, Blender, and advanced AI video pipelines.",
  email: "hello@edinrushiti.com",
  socials: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    linkedin: "https://linkedin.com/",
    vimeo: "https://vimeo.com/",
  },
} as const;

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  /** Replace with YouTube/Vimeo embed URL or direct video URL */
  videoUrl?: string;
  thumbnail?: string;
};

export type UgcItem = {
  id: string;
  title: string;
  brand?: string;
  /** Replace with vertical video embed or direct URL */
  videoUrl?: string;
  thumbnail?: string;
};

/** Drop in your commercial & cinematic work here */
export const portfolioItems: PortfolioItem[] = [
  {
    id: "commercial-1",
    title: "Luxury Brand Campaign",
    category: "Commercial",
    description: "High-end product film with cinematic color grade and motion design.",
  },
  {
    id: "commercial-2",
    title: "Automotive Launch Film",
    category: "Commercial",
    description: "Dynamic multi-shot edit with seamless transitions and sound design.",
  },
  {
    id: "cinematic-1",
    title: "Cinematic Short Form",
    category: "Cinematic",
    description: "Narrative-driven visual storytelling with atmospheric grading.",
  },
  {
    id: "commercial-3",
    title: "Tech Product Reveal",
    category: "Commercial",
    description: "Launch film combining live action, 3D, and AI-enhanced visuals.",
  },
  {
    id: "cinematic-2",
    title: "Documentary Style Edit",
    category: "Cinematic",
    description: "Long-form pacing with character-driven cuts and archival integration.",
  },
  {
    id: "commercial-4",
    title: "Global Ad Spot",
    category: "Commercial",
    description: "Multi-market commercial with localized variants and brand consistency.",
  },
];

/** Drop in your UGC vertical edits here — clients look for 9:16 work */
export const ugcItems: UgcItem[] = [
  { id: "ugc-1", title: "Skincare UGC Ad", brand: "Beauty Brand" },
  { id: "ugc-2", title: "Fitness App Promo", brand: "Health & Wellness" },
  { id: "ugc-3", title: "Food Delivery Hook", brand: "Consumer App" },
  { id: "ugc-4", title: "Fashion Try-On Edit", brand: "Streetwear" },
  { id: "ugc-5", title: "SaaS Testimonial Cut", brand: "B2B Software" },
  { id: "ugc-6", title: "Supplement UGC Stack", brand: "Nutrition" },
];

export const tools = [
  {
    name: "After Effects",
    category: "Motion & VFX",
    description: "Complex character animation, tracking, and compositing.",
  },
  {
    name: "Premiere Pro",
    category: "Editing",
    description: "Commercial timelines, multi-cam, and broadcast-ready delivery.",
  },
  {
    name: "Photoshop",
    category: "Design",
    description: "Frame refinement, ad design, and visual asset preparation.",
  },
  {
    name: "Blender",
    category: "3D",
    description: "Product visualization, motion graphics, and 3D integration.",
  },
  {
    name: "Rotato",
    category: "3D Mockups",
    description: "Premium device and product mockup animations.",
  },
  {
    name: "AI Video Pipelines",
    category: "Generative AI",
    description: "Higgsfield, Kling AI, SeeDance — multi-shot visual consistency.",
  },
] as const;
