const DEFAULT_UPSTREAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

export async function proxyRemoteVideo(
  upstreamUrl: string,
  request: Request,
  options?: { referer?: string; userAgent?: string; cookie?: string },
) {
  const range = request.headers.get("range");
  const upstreamHeaders: HeadersInit = {
    "User-Agent": options?.userAgent ?? DEFAULT_UPSTREAM_UA,
  };

  if (options?.referer) {
    upstreamHeaders.Referer = options.referer;
  }

  if (options?.cookie) {
    upstreamHeaders.Cookie = options.cookie;
  }

  if (range) {
    upstreamHeaders.Range = range;
  }

  const upstream = await fetch(upstreamUrl, {
    headers: upstreamHeaders,
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return upstream;
  }

  const responseHeaders = new Headers();
  const passthroughHeaders = [
    "Content-Type",
    "Content-Length",
    "Content-Range",
    "Accept-Ranges",
  ] as const;

  for (const header of passthroughHeaders) {
    const value = upstream.headers.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  }

  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", "video/mp4");
  }

  if (!responseHeaders.has("Accept-Ranges")) {
    responseHeaders.set("Accept-Ranges", "bytes");
  }

  responseHeaders.set("Cache-Control", "private, max-age=3600");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
