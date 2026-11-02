export type EditorialArt = {
  publicId: string;
  position: string;
  tone: "violet" | "teal" | "blue" | "rose";
};

/**
 * Artwork ONLY: imagery is illustrative and must never communicate a
 * clinically correct force direction, tissue diagnosis or maneuver.
 * Reuse previously published PNA Cloudinary assets to keep requests cacheable.
 */
const ART = {
  neck: { publicId: "l4ocacerz3cj1hs4kd3t", position: "center 42%", tone: "violet" },
  shoulder: { publicId: "my7sknkgvla6h8so2sz3", position: "center 50%", tone: "blue" },
  knee: { publicId: "swvfhjbwbroyj6lysdxi", position: "center 52%", tone: "teal" },
  ankle: { publicId: "vdnhp1cc1ytjwsqb3zgp", position: "center 50%", tone: "teal" },
  thoracic: { publicId: "tfuqogqnk8lt9qboqpjp", position: "center 46%", tone: "blue" },
  lumbar: { publicId: "sgsx27zr83dmlznsxfte", position: "center 47%", tone: "rose" },
} as const satisfies Record<string, EditorialArt>;

export function getEditorialArt(slug: string, family: string): EditorialArt | null {
  if (
    slug.includes("cervical") || slug.includes("nags") || slug.includes("snags") ||
    slug.includes("paivm") || slug.includes("traction") || slug.includes("mckenzie")
  ) return ART.neck;
  if (slug.includes("kaltenborn") || slug.includes("shoulder") || slug.includes("spencer")) return ART.shoulder;
  if (slug.includes("maitland")) return ART.neck;
  if (slug.includes("ankle") || slug.includes("talar")) return ART.ankle;
  if (slug.includes("lymphatic") || slug.includes("knee")) return ART.knee;
  if (slug.includes("thoracic") || slug.includes("fascial") || slug.includes("rolfing")) return ART.thoracic;
  if (slug.includes("lumbar") || slug.includes("paris")) return ART.lumbar;
  if (family === "Joint Mobilization" || family === "Mobilization With Movement") return ART.shoulder;
  if (family === "Spinal Mobilization" || family === "Orthopedic Assessment & Reasoning") return ART.neck;
  if (family === "Fascial & Soft-Tissue") return ART.thoracic;
  if (family === "Soft-Tissue Mobilization") return ART.lumbar;
  if (family === "Osteopathic & Neuromuscular") return ART.neck;
  if (family === "Neural Mobilization") return ART.neck;
  if (family === "Specialized Manual Therapy") return ART.knee;
  return null;
}
