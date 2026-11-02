import { ExternalLink } from "lucide-react";
import {
  getImageKitSrcSet,
  getImageKitUrl,
  imageKitEnabled,
} from "@/lib/imagekit";

type ClinicalImageProps = {
  path: string;
  alt: string;
  caption?: string;
  label?: string;
  sizes?: string;
  quality?: number;
  eager?: boolean;
  className?: string;
};

export default function ClinicalImage({
  path,
  alt,
  caption,
  label,
  sizes = "(min-width: 1024px) 760px, (min-width: 640px) 88vw, 94vw",
  quality = 82,
  eager = false,
  className = "",
}: ClinicalImageProps) {
  if (!imageKitEnabled || !path) return null;

  const src = getImageKitUrl(path, { width: 1024, quality });
  const srcSet = getImageKitSrcSet(path, undefined, quality);
  const detailUrl = getImageKitUrl(path, { width: 1800, quality: 90 });

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
