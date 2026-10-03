const IMAGEKIT_ENDPOINT = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "")
  .trim()
  .replace(/\/+$/, "");

export const imageKitEnabled = IMAGEKIT_ENDPOINT.length > 0;

function normalizePath(path: string) {
  return path.replace(/^\/+/, "");
}

export function getImageKitUrl(
  path: string,
  options: {
    width?: number;
    quality?: number;
  } = {}
) {
  if (!IMAGEKIT_ENDPOINT || !path) return "";

  const cleanPath = normalizePath(path);
  const transforms: string[] = [];

  if (options.width) transforms.push(`w-${Math.round(options.width)}`);
  if (options.quality) transforms.push(`q-${Math.round(options.quality)}`);

  const transformation = transforms.length ? `/tr:${transforms.join(",")}` : "";

  return `${IMAGEKIT_ENDPOINT}${transformation}/${cleanPath}`;
}

export function getImageKitSrcSet(
  path: string,
  widths: number[] = [480, 768, 1024, 1440, 1800],
  quality = 82
) {
  if (!imageKitEnabled || !path) return undefined;

  return widths
    .map((width) => `${getImageKitUrl(path, { width, quality })} ${width}w`)
    .join(", ");
}
