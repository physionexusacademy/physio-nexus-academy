const CLOUD_NAME = (
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "qoc7ukqs"
).trim();

export const cloudinaryEnabled = CLOUD_NAME.length > 0;

export type CloudinaryCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function normalizePublicId(publicId: string) {
  let clean = publicId;

  while (clean.startsWith("/")) {
    clean = clean.slice(1);
  }

  return clean.replace(/\.(webp|png|jpe?g|avif)$/i, "");
}

export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
    crop?: CloudinaryCrop;
  } = {}
) {
  if (!cloudinaryEnabled || !publicId) return "";

  const cleanId = normalizePublicId(publicId);
  const stages: string[] = [];

  if (options.crop) {
    const { x, y, width, height } = options.crop;
    stages.push(
      [
        \`x_\${Math.round(x)}\`,
        \`y_\${Math.round(y)}\`,
        \`w_\${Math.round(width)}\`,
        \`h_\${Math.round(height)}\`,
        "c_crop",
      ].join(",")
    );
  }

  const delivery: string[] = [
    \`f_\${options.format ?? "auto"}\`,
    typeof options.quality === "number"
      ? \`q_\${Math.round(options.quality)}\`
      : "q_auto",
  ];

  if (options.width) {
    delivery.push(\`w_\${Math.round(options.width)}\`, "c_limit");
  }

  stages.push(delivery.join(","));

  return \`https://res.cloudinary.com/\${CLOUD_NAME}/image/upload/\${stages.join(
    "/"
  )}/\${cleanId}\`;
}

export function getCloudinarySrcSet(
  publicId: string,
  widths: number[] = [480, 720, 900, 1200],
  crop?: CloudinaryCrop,
) {
  if (!cloudinaryEnabled || !publicId) return undefined;

  return widths
    .map(
      (width) =>
        \`\${getCloudinaryUrl(publicId, {
          width,
          quality: "auto",
          format: "auto",
          crop,
        })} \${width}w\`
    )
    .join(", ");
}
