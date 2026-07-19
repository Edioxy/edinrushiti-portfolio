import { readPortfolioContent } from "@/lib/content-store";
import { resolveSocialThumbnail } from "@/lib/social-thumbnail";
import type { PortfolioContentFile } from "@/lib/content-types";
import {
  buildYouTubeEmbedUrl,
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

  return { portfolioItems, ugcItems, settings: content.settings };
}

export async function getPortfolioVideos() {
  const content = await readPortfolioContent();
  return mapContentToVideos(content);
}
