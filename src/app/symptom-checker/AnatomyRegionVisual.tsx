import type { RegionId } from "@/lib/msk-symptom-checker";

type AnatomyRegionVisualProps = {
  region: RegionId;
  className?: string;
  compact?: boolean;
};

const highlights: Record<RegionId, { x: number; y: number; rx: number; ry: number }> = {
  neck: { x: 60, y: 49, rx: 13, ry: 10 },
  shoulder: { x: 82, y: 72, rx: 15, ry: 13 },
  elbow: { x: 30, y: 119, rx: 11, ry: 12 },
  "wrist-hand": { x: 22, y: 157, rx: 10, ry: 13 },
  "upper-back-ribs": { x: 60, y: 96, rx: 24, ry: 20 },
  "low-back": { x: 60, y: 135, rx: 22, ry: 17 },
  "hip-groin": { x: 60, y: 164, rx: 22, ry: 17 },
  knee: { x: 48, y: 235, rx: 12, ry: 13 },
  "lower-leg": { x: 49, y: 278, rx: 11, ry: 22 },
  "ankle-foot": { x: 48, y: 319, rx: 13, ry: 10 },
};

export function AnatomyRegionVisual({ region, className = "", compact = false }: AnatomyRegionVisualProps) {
  const glow = highlights[region];
  const id = region.replace(/[^a-z0-9]/gi, "");

  return (
    <svg
      viewBox="0 0 120 340"
      role="img"
      aria-label={`Anatomical locator highlighting the ${region.replace(/-/g, " ")} region`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dceff3" stopOpacity="0.98" />
          <stop offset="55%" stopColor="#b8dfe5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7fbec9" stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id={`bone-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eafcff" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#a7e8ee" stopOpacity="0.78" />
        </linearGradient>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0%" stopColor="#ff7a3d" stopOpacity="0.98" />
          <stop offset="35%" stopColor="#ff4d3d" stopOpacity="0.82" />
          <stop offset="70%" stopColor="#ef3340" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#ef3340" stopOpacity="0" />
        </radialGradient>
        <filter id={`soft-${id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={compact ? 3.5 : 5.5} />
        </filter>
      </defs>

      <g opacity="0.98">
        <circle cx="60" cy="26" r="17" fill={`url(#body-${id})`} />
        <path
          d="M45 44 C38 49 34 59 32 74 L26 111 L19 149 C18 156 21 160 26 159 L34 127 L39 92 L42 145 C43 155 47 166 48 176 L43 228 L40 291 L45 328 C46 335 53 335 55 329 L56 293 L58 240 L62 240 L64 293 L65 329 C67 335 74 335 75 328 L80 291 L77 228 L72 176 C73 166 77 155 78 145 L81 92 L86 127 L94 159 C99 160 102 156 101 149 L94 111 L88 74 C86 59 82 49 75 44 C68 40 52 40 45 44 Z"
          fill={`url(#body-${id})`}
          stroke="#8ccbd3"
          strokeWidth="0.8"
        />
      </g>

      <g fill="none" stroke={`url(#bone-${id})`} strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 44 L60 176" strokeWidth="2.2" opacity="0.9" />
        {Array.from({ length: 16 }).map((_, index) => (
          <circle
            key={index}
            cx="60"
            cy={52 + index * 7.2}
            r={index < 4 ? 1.7 : 2}
            fill="#bff4f5"
            stroke="#6fd0d6"
            strokeWidth="0.7"
            opacity={0.95 - index * 0.02}
          />
        ))}
        <path d="M60 70 C49 72 42 76 38 84" strokeWidth="1.7" opacity="0.72" />
        <path d="M60 70 C71 72 78 76 82 84" strokeWidth="1.7" opacity="0.72" />
        <path d="M60 84 C48 88 42 95 39 105" strokeWidth="1.2" opacity="0.55" />
        <path d="M60 84 C72 88 78 95 81 105" strokeWidth="1.2" opacity="0.55" />
        <path d="M60 98 C48 101 43 108 41 118" strokeWidth="1.1" opacity="0.45" />
        <path d="M60 98 C72 101 77 108 79 118" strokeWidth="1.1" opacity="0.45" />
        <path d="M48 160 C52 155 68 155 72 160 C70 170 65 176 60 178 C55 176 50 170 48 160 Z" strokeWidth="1.7" opacity="0.8" />
        <path d="M53 180 L48 232 L48 306" strokeWidth="1.6" opacity="0.75" />
        <path d="M67 180 L72 232 L72 306" strokeWidth="1.6" opacity="0.75" />
        <path d="M39 85 L30 120 L23 154" strokeWidth="1.4" opacity="0.62" />
        <path d="M81 85 L90 120 L97 154" strokeWidth="1.4" opacity="0.62" />
      </g>

      <ellipse
        cx={glow.x}
        cy={glow.y}
        rx={glow.rx * 1.6}
        ry={glow.ry * 1.6}
        fill={`url(#glow-${id})`}
        filter={`url(#soft-${id})`}
        opacity="0.9"
      />
      <ellipse
        cx={glow.x}
        cy={glow.y}
        rx={glow.rx}
        ry={glow.ry}
        fill="none"
        stroke="#ff6b4a"
        strokeWidth={compact ? 1.2 : 1.7}
        opacity="0.9"
      />
      <ellipse
        cx={glow.x}
        cy={glow.y}
        rx={glow.rx * 0.42}
        ry={glow.ry * 0.42}
        fill="#ff5a3d"
        opacity="0.92"
      />
    </svg>
  );
}
