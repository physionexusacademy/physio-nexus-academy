/** A simple picture of where the phone goes: the person, the phone on a stand or the floor, and the distance. Drawn here so it loads at once and works offline. */
export function PlacementArt({ lying, label }: { lying: boolean; label: string }) {
  const stroke = "#5eead4";
  return (
    <svg viewBox="0 0 320 170" role="img" aria-label={label} className="fc-art-svg">
      <defs>
        <linearGradient id="fc-floor" x1="0" x2="1"><stop offset="0" stopColor="#0d9488" stopOpacity="0" /><stop offset="0.5" stopColor="#5eead4" stopOpacity="0.5" /><stop offset="1" stopColor="#0d9488" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x="0" y="136" width="320" height="2" fill="url(#fc-floor)" />
      {/* the phone, on a low stand */}
      <g transform="translate(262 78)">
        <rect x="-2" y="40" width="4" height="18" fill="#7dd3fc" opacity="0.7" />
        <rect x="-14" y="56" width="28" height="4" rx="2" fill="#7dd3fc" opacity="0.7" />
        <rect x="-16" y="-26" width="32" height="64" rx="7" fill="#06182f" stroke="#22d3ee" strokeWidth="2.5" />
        <circle cx="0" cy="-17" r="3" fill="#22d3ee" />
        <path d="M-9 4 l9 -9 l9 9" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.0" />
      </g>
      {/* the person */}
      {lying ? (
        <g stroke={stroke} strokeWidth="5" strokeLinecap="round" fill="none">
          <rect x="30" y="122" width="150" height="10" rx="5" fill="#0b3a52" stroke="none" />
          <circle cx="50" cy="108" r="11" />
          <path d="M62 114 L120 114 L152 96 L176 118" />
          <path d="M120 114 L150 124" />
        </g>
      ) : (
        <g stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="86" cy="42" r="12" />
          <path d="M86 56 L86 98" />
          <path d="M86 66 L62 86 M86 66 L110 86" />
          <path d="M86 98 L72 132 M86 98 L102 132" />
        </g>
      )}
      {/* the distance */}
      <g stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d={lying ? "M184 152 H246" : "M116 152 H246"} strokeDasharray="6 6" />
        <path d={lying ? "M184 146 v12 M246 146 v12" : "M116 146 v12 M246 146 v12"} />
      </g>
      <text x={lying ? 215 : 181} y="168" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="800">2 m</text>
    </svg>
  );
}
