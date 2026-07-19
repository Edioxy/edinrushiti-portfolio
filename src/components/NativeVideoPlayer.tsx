"use client";

type NativeVideoPlayerProps = {
  src: string;
  poster?: string;
  title: string;
  resetKey: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  objectFit?: "contain" | "cover";
};

export function NativeVideoPlayer({
  src,
  poster,
  title,
  resetKey,
  autoplay = true,
  controls = true,
  muted = false,
  loop = false,
  objectFit = "contain",
}: NativeVideoPlayerProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        key={resetKey}
        src={src}
        poster={poster}
        title={title}
        controls={controls}
        autoPlay={autoplay}
        playsInline
        muted={muted}
        loop={loop}
        preload="metadata"
        className={`h-full w-full bg-black ${objectFit === "cover" ? "object-cover" : "object-contain"}`}
      />
    </div>
  );
}

export function NativeVideoPreview({
  src,
  poster,
  title,
}: {
  src?: string;
  poster?: string;
  title: string;
}) {
  if (poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster} alt={title} loading="lazy" className="h-full w-full object-cover" />
    );
  }

  if (src) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={src}
          title={title}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return <div className="h-full w-full animate-pulse bg-[#111]" />;
}

export function NativeVideoLoading() {
  return (
    <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-black">
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}
