import { ExternalLink } from "lucide-react";
import {
  getCloudinarySrcSet,
  getCloudinaryUrl,
  cloudinaryEnabled,
} from "@/lib/cloudinary";

type CloudinaryClinicalImageProps = {
  publicId: string;
  alt: string;
  caption?: string;
  label?: string;
  sizes?: string;
  quality?: number;
  eager?: boolean;
  className?: string;
};

export default function CloudinaryClinicalImage({
  publicId,
  alt,
  caption,
  label,
  sizes = "(min-width: 1024px) 760px, (min-width: 640px) 88vw, 94vw",
  quality = 82,
  eager = false,
  className = "",
}: CloudinaryClinicalImageProps) {
  if (!cloudinaryEnabled || !publicId) return null;

  const src = getCloudinaryUrl(publicId, { width: 1200, quality, format: "auto" });
  const srcSet = getCloudinarySrcSet(publicId, [480, 720, 900, 1200, 1600]);
  const detailUrl = getCloudinaryUrl(publicId, { width: 1800, quality: 90, format: "auto" });

  return (
    <figure className={"overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-sm " + className}>
      {label ? (
        <div className="border-b border-grey-100 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
          {label}
        </div>
      ) : null}

      <div className="bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-3 sm:p-5">
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          className="mx-auto h-auto max-h-[760px] w-full rounded-2xl object-contain"
        />
      </div>

      {(caption || detailUrl) ? (
        <figcaption className="flex flex-wrap items-start justify-between gap-3 border-t border-grey-100 px-5 py-4">
          {caption ? (
            <p className="max-w-3xl text-sm leading-6 text-navy-600">{caption}</p>
          ) : (
            <span />
          )}
          <a
            href={detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-none items-center gap-1 text-xs font-bold text-violet-700"
          >
            Detailed view <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </figcaption>
      ) : null}
    </figure>
  );
}
