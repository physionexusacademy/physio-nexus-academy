const CLOUD_NAME = (
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""
).trim();

export const cloudinaryEnabled = CLOUD_NAME.length > 0;

function normalizePublicId(publicId: string) {
  return publicId
    .replace(/^\/+/, "")
    .replace(/\.(webp|png|jpe?g|avif)$/i, "");
}

export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
  } = {}
) {
  if (!cloudinaryEnabled || !publicId) return "";

  const cleanId = normalizePublicId(publicId);
  const transforms: string[] = [];

  transforms.push(`f_${options.format ?? "auto"}`);
  transforms.push(
    typeof options.quality === "number"
      ? `q_${Math.round(options.quality)}`
      : "q_auto"
  );

  if (options.width) {
    transforms.push(`w_${Math.round(options.width)}`);
    transforms.push("c_limit");
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(
    ","
  )}/${cleanId}`;
}

export function getCloudinarySrcSet(
  publicId: string,
  widths: number[] = [480, 720, 900, 1200],
) {
  if (!cloudinaryEnabled || !publicId) return undefined;

  return widths
    .map(
      (width) =>
        `${getCloudinaryUrl(publicId, {
          width,
          quality: "auto",
          format: "auto",
        })} ${width}w`
    )
    .join(", ");
}
