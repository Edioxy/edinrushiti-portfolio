import { readPortfolioContent } from "@/lib/content-store";
import {
  makePortfolioId,
  makeUgcId,
  parseVideoInput,
  resolveThumbnail,
  type PortfolioVideo,
  type UgcVideo,
} from "@/lib/video";
import type { PortfolioContentFile } from "@/lib/content-types";

export function mapContentToVideos(content: PortfolioContentFile) {
  const portfolioItems: PortfolioVideo[] = content.portfolio.map((item, index) => {
    const video = parseVideoInput(item.video);

    return {
      id: makePortfolioId(item.title, index),
      title: item.title,
      category: item.category,
      description: item.description,
      video,
      thumbnail: resolveThumbnail(item.thumbnail, video),
    };
  });

  const ugcItems: UgcVideo[] = content.ugc.map((item, index) => {
    const video = parseVideoInput(item.video);

    return {
      id: makeUgcId(item.title, index),
      title: item.title,
      brand: item.brand,
      video,
      thumbnail: resolveThumbnail(item.thumbnail, video),
    };
  });

  return { portfolioItems, ugcItems, settings: content.settings };
}

export async function getPortfolioVideos() {
  const content = await readPortfolioContent();
  return mapContentToVideos(content);
}
