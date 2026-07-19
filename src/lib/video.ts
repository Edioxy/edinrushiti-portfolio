export type VideoSource = {
  type: "youtube" | "vimeo" | "gdrive" | "file" | "link";
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

export function buildYouTubeEmbedUrl(videoId: string, origin?: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    controls: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    cc_load_policy: "0",
    playsinline: "1",
    fs: "1",
    disablekb: "0",
  });

  if (origin) {
    params.set("origin", origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function buildVimeoEmbedUrl(videoId: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    title: "0",
    byline: "0",
    portrait: "0",
    badge: "0",
    dnt: "1",
  });

  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
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
    return {
      type: "youtube",
      href: `https://www.youtube.com/watch?v=${youtubeId}`,
      embedUrl: buildYouTubeEmbedUrl(youtubeId, "https://edinrushiti.com"),
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
