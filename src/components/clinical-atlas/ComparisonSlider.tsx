"use client";

import { useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { getImageKitSrcSet, getImageKitUrl } from "@/lib/imagekit";

export default function ComparisonSlider({
  beforePath,
  afterPath,
  beforeLabel,
  afterLabel,
  alt,
}: {
  beforePath: string;
  afterPath: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
}) {
  const [position, setPosition] = useState(50);
  const beforeSrc = getImageKitUrl(beforePath, { width: 1200, quality: 84 });
  const afterSrc = getImageKitUrl(afterPath, { width: 1200, quality: 84 });
  const beforeSet = getImageKitSrcSet(beforePath, [480, 768, 1024, 1440], 84);
  const afterSet = getImageKitSrcSet(afterPath, [480, 768, 1024, 1440], 84);

  return (
    <div className="overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-grey-50 via-white to-cyan-50">
        <img
          src={afterSrc}
          srcSet={afterSet}
          sizes="(min-width: 1024px) 900px, 94vw"
          alt={alt + " — " + afterLabel}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain p-3 sm:p-5"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden="true"
        >
          <img
            src={beforeSrc}
            srcSet={beforeSet}
            sizes="(min-width: 1024px) 900px, 94vw"
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-3 sm:p-5"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(2,20,44,0.12)]"
          style={{ left: `calc(${position}% - 1px)` }}
        >
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-navy-800 text-white shadow-lg">
            <MoveHorizontal className="h-5 w-5" />
          </span>
        </div>

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-navy-800 shadow-sm">
          {beforeLabel}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-navy-800 shadow-sm">
          {afterLabel}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          aria-label={`Compare ${beforeLabel} with ${afterLabel}`}
        />
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-grey-100 px-4 py-3 text-xs font-bold text-navy-500">
        <MoveHorizontal className="h-4 w-4 text-teal-600" />
        Drag to compare
      </div>
    </div>
  );
}
