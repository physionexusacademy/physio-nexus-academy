"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { getImageKitSrcSet, getImageKitUrl } from "@/lib/imagekit";
import type { AtlasHotspot } from "@/lib/clinical-visual-atlas";

export default function HotspotVisual({
  path,
  alt,
  hotspots,
}: {
  path: string;
  alt: string;
  hotspots: AtlasHotspot[];
}) {
  const [active, setActive] = useState(0);
  const src = getImageKitUrl(path, { width: 1200, quality: 84 });
  const srcSet = getImageKitSrcSet(path, [480, 768, 1024, 1440], 84);
  const selected = hotspots[active];

  return (
    <div className="overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-grey-50 via-white to-cyan-50">
        <img
          src={src}
          srcSet={srcSet}
          sizes="(min-width: 1024px) 900px, 94vw"
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-contain p-3 sm:p-5"
        />

        {hotspots.map((hotspot, index) => (
          <button
            key={hotspot.label}
            type="button"
            onClick={() => setActive(index)}
            className={
              "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-black shadow-lg transition " +
              (active === index
                ? "scale-110 bg-teal-600 text-white"
                : "bg-navy-800 text-white hover:scale-105")
            }
            style={{ left: hotspot.x + "%", top: hotspot.y + "%" }}
            aria-label={"Show " + hotspot.label}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="flex gap-3 border-t border-grey-100 p-4 sm:p-5">
          <Info className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
          <div>
            <p className="text-sm font-black text-navy-900">{selected.label}</p>
            <p className="mt-1 text-sm leading-6 text-navy-600">{selected.note}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
