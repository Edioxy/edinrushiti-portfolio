export type VideoSource = {
  type: "youtube" | "vimeo" | "tiktok" | "instagram" | "gdrive" | "file" | "link";
  variant?: "short" | "standard";
  embedUrl?: string;
  href: string;
  thumbnail?: string;
};

export type PortfolioVideo = {
  id: string;
  title: string;
  category: string;
  description: string;
  video?: VideoSource;
  thumbnail?: string;
};

export type UgcVideo = {
  id: string;
  title: string;
  brand?: string;
  video?: VideoSource;
  thumbnail?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseYouTubeId(url: string) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function isYouTubeShortUrl(url: string) {
  return /youtube\.com\/shorts\//.test(url);
}

export function buildYouTubeEmbedUrl(
  videoId: string,
  options?: { short?: boolean; muted?: boolean },
) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    playsinline: "1",
    mute: options?.muted === true ? "1" : "0",
  });

  if (options?.short) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function buildVimeoEmbedUrl(videoId: string) {
  return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0`;
}

export function buildTikTokEmbedUrl(videoId: string, autoplay = true) {
  const params = new URLSearchParams({
    music_info: "0",
    description: "0",
    controls: "1",
  });

  if (autoplay) {
    params.set("autoplay", "1");
  }

  params.set("mute", "0");

  return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;
}

export function getTikTokVideoId(url: string) {
  const patterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /tiktok\.com\/video\/(\d+)/,
    /tiktok\.com\/embed\/v2\/(\d+)/,
    /tiktok\.com\/player\/v1\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function normalizeTikTokUrl(input: string) {
  const trimmed = input.trim().split("?")[0].replace(/\/$/, "");
  const videoId = getTikTokVideoId(trimmed);

  if (!videoId) {
    return trimmed;
  }

  const handleMatch = trimmed.match(/tiktok\.com\/@([\w.-]+)\/video\//);
  if (handleMatch?.[1]) {
    return `https://www.tiktok.com/@${handleMatch[1]}/video/${videoId}`;
  }

  return `https://www.tiktok.com/video/${videoId}`;
}

export function buildInstagramEmbedUrl(shortcode: string, kind: "reel" | "post") {
  const path = kind === "reel" ? "reel" : "p";
  return `https://www.instagram.com/${path}/${shortcode}/embed?autoplay=1&mute=0`;
}

export function getVideoAspect(video: VideoSource): "16/9" | "9/16" {
  if (video.type === "tiktok" || video.type === "instagram") {
    return "9/16";
  }

  if (video.type === "youtube" && video.variant === "short") {
    return "9/16";
  }

  return "16/9";
}

export function isVerticalVideo(video: VideoSource) {
  return getVideoAspect(video) === "9/16";
}

export function getYouTubeEmbedSrc(video: VideoSource) {
  const videoId = getYouTubeIdFromSource(video);
  if (!videoId) return video.embedUrl;

  return buildYouTubeEmbedUrl(videoId, {
    short: video.variant === "short",
    muted: false,
  });
}

export function getYouTubeIdFromSource(video: VideoSource) {
  return parseYouTubeId(video.href) ?? parseYouTubeId(video.embedUrl ?? "");
}

export function getVimeoIdFromSource(video: VideoSource) {
  const match = video.href.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

function parseVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

function parseTikTokId(url: string) {
  const patterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /tiktok\.com\/video\/(\d+)/,
    /tiktok\.com\/embed\/v2\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function parseInstagramShortcode(url: string) {
  const reelMatch = url.match(/instagram\.com\/reels?\/([A-Za-z0-9_-]+)/);
  if (reelMatch?.[1]) {
    return { shortcode: reelMatch[1], kind: "reel" as const };
  }

  const postMatch = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
  if (postMatch?.[1]) {
    return { shortcode: postMatch[1], kind: "post" as const };
  }

  return null;
}

function parseGoogleDriveId(url: string) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function parseVideoInput(input?: string): VideoSource | undefined {
  const value = input?.trim();
  if (!value) return undefined;

  const youtubeId = parseYouTubeId(value);
  if (youtubeId) {
    const isShort = isYouTubeShortUrl(value);

    return {
      type: "youtube",
      variant: isShort ? "short" : "standard",
      href: isShort
        ? `https://www.youtube.com/shorts/${youtubeId}`
        : `https://www.youtube.com/watch?v=${youtubeId}`,
      embedUrl: buildYouTubeEmbedUrl(youtubeId, { short: isShort, muted: false }),
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    };
  }

  const vimeoId = parseVimeoId(value);
  if (vimeoId) {
    return {
      type: "vimeo",
      href: `https://vimeo.com/${vimeoId}`,
      embedUrl: buildVimeoEmbedUrl(vimeoId),
    };
  }

  const tiktokId = parseTikTokId(value);
  if (tiktokId) {
    const href = normalizeTikTokUrl(value);

    return {
      type: "tiktok",
      href,
      embedUrl: buildTikTokEmbedUrl(tiktokId),
    };
  }

  const instagram = parseInstagramShortcode(value);
  if (instagram) {
    const path = instagram.kind === "reel" ? "reel" : "p";

    return {
      type: "instagram",
      href: `https://www.instagram.com/${path}/${instagram.shortcode}/`,
      embedUrl: buildInstagramEmbedUrl(instagram.shortcode, instagram.kind),
    };
  }

  const driveId = parseGoogleDriveId(value);
  if (driveId) {
    return {
      type: "gdrive",
      href: `https://drive.google.com/file/d/${driveId}/view`,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
    };
  }

  if (value.startsWith("/") || value.endsWith(".mp4") || value.endsWith(".webm")) {
    return {
      type: "file",
      href: value,
      embedUrl: value,
    };
  }

  return {
    type: "link",
    href: value,
  };
}

export function resolveThumbnail(
  manualThumbnail: string | undefined,
  video?: VideoSource,
) {
  const manual = manualThumbnail?.trim();
  if (manual) return manual;
  return video?.thumbnail;
}

export function makePortfolioId(title: string, index: number) {
  const slug = slugify(title);
  return slug ? `${slug}-${index}` : `portfolio-${index}`;
}

export function makeUgcId(title: string, index: number) {
  const slug = slugify(title);
  return slug ? `${slug}-${index}` : `ugc-${index}`;
}
