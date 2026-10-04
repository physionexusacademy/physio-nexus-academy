"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  cloudinaryEnabled,
  getCloudinarySrcSet,
  getCloudinaryUrl,
} from "@/lib/cloudinary";

type OnDemand3DAnatomyProps = {
  publicId: string;
  alt: string;
  title: string;
  target: string;
  caption?: string;
};

export default function OnDemand3DAnatomy({
  publicId,
  alt,
  title,
  target,
  caption,
}: OnDemand3DAnatomyProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  if (!cloudinaryEnabled || !publicId) return null;

  const src = getCloudinaryUrl(publicId, {
    width: 900,
    quality: "auto",
    format: "auto",
  });
  const srcSet = getCloudinarySrcSet(publicId, [480, 720, 900, 1200]);
  const detailUrl = getCloudinaryUrl(publicId, {
    width: 1800,
    quality: "auto",
    format: "auto",
  });

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-700 text-white shadow-sm">
            <ImageIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
              PNA 3D Anatomy Atlas
            </span>
            <span className="mt-0.5 block text-sm font-bold text-navy-900">
              View realistic 3D anatomy
            </span>
          </span>
        </span>

        {open ? (
          <ChevronUp className="h-5 w-5 text-indigo-700" />
        ) : (
          <ChevronDown className="h-5 w-5 text-indigo-700" />
        )}
      </button>

      {open ? (
        <div className="border-t border-indigo-100 p-4">
          {!missing ? (
            <>
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {loading ? (
                  <div className="absolute inset-0 z-10 flex min-h-64 items-center justify-center bg-white/90">
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading 3D anatomy…
                    </div>
                  </div>
                ) : null}

                <img
                  src={src}
                  srcSet={srcSet}
                  sizes="(min-width: 1024px) 520px, (min-width: 640px) 76vw, 92vw"
                  alt={alt}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setMissing(true);
                  }}
                  className="mx-auto max-h-[620px] w-full object-contain"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-navy-900">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-navy-600">
                    Target: {target}
                  </p>
                  {caption ? (
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-navy-500">
                      {caption}
                    </p>
                  ) : null}
                </div>

                <a
                  href={detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700"
                >
                  Full detail
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">
                3D atlas image is not uploaded yet.
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                The lightweight structure-specific map above remains available.
                Once this asset is uploaded to Cloudinary with its assigned public ID,
                the 3D view will appear automatically.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
