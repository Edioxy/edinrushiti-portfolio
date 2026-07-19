import { readPortfolioContent } from "@/lib/content-store";
import { resolveSocialThumbnail } from "@/lib/social-thumbnail";
import { DEFAULT_SECTIONS, type PortfolioContentFile } from "@/lib/content-types";
import {
  buildInstagramEmbedUrl,
  buildYouTubeEmbedUrl,
  getInstagramShortcode,
  getYouTubeIdFromSource,
  makePortfolioId,
  makeUgcId,
  parseVideoInput,
  resolveThumbnail,
  type PortfolioVideo,
  type UgcVideo,
} from "@/lib/video";

export async function mapContentToVideos(content: PortfolioContentFile) {
  const portfolioItems: PortfolioVideo[] = await Promise.all(
    content.portfolio.map(async (item, index) => {
      const video = parseVideoInput(item.video);
      const thumbnail = video
        ? await resolveSocialThumbnail(item.thumbnail, video)
        : resolveThumbnail(item.thumbnail, video);

      return {
        id: makePortfolioId(item.title, index),
        title: item.title,
        category: item.category,
        description: item.description,
        video,
        thumbnail,
      };
    }),
  );

  const ugcItems: UgcVideo[] = await Promise.all(
    content.ugc.map(async (item, index) => {
      const parsed = parseVideoInput(item.video);
      let video = parsed;

      if (parsed?.type === "youtube") {
        const youtubeId = getYouTubeIdFromSource(parsed);

        if (youtubeId) {
          video = {
            ...parsed,
            variant: "short",
            href: `https://www.youtube.com/shorts/${youtubeId}`,
            embedUrl: buildYouTubeEmbedUrl(youtubeId, { short: true, muted: false }),
          };
        }
      }

      if (parsed?.type === "instagram") {
        const shortcode = getInstagramShortcode(parsed.href);

        if (shortcode) {
          video = {
            ...parsed,
            variant: "reel",
            href: `https://www.instagram.com/reel/${shortcode}/`,
            embedUrl: buildInstagramEmbedUrl(shortcode, "reel", {
              autoplay: true,
              muted: false,
            }),
          };
        }
      }

      if (parsed?.type === "file") {
        video = {
          ...parsed,
          variant: "short",
        };
      }

      const thumbnail = video
        ? await resolveSocialThumbnail(item.thumbnail, video)
        : resolveThumbnail(item.thumbnail, video);

      return {
        id: makeUgcId(item.title, index),
        title: item.title,
        brand: item.brand,
        video,
        thumbnail,
      };
    }),
  );

  return {
    portfolioItems,
    ugcItems,
    settings: content.settings,
    sections: content.sections ?? DEFAULT_SECTIONS,
  };
}

export async function getPortfolioVideos() {
  const content = await readPortfolioContent();
  return mapContentToVideos(content);
}
