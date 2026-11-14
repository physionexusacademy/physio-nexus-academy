/**
 * "Guide me": Dr. Sajjad's tour of the academy. Every line is the site guide's own text for that feature (lib/pna-ai/site-guide.ts,
 * English + Roman Urdu); the button under each stop opens that feature's page. The 3D part is a short, harmless demonstration that
 * suggests what the feature does (a goniometer sweep for the Skills Lab, an exercise for RehabVerse, hands-on for Manual Therapy).
 */
import type { Choreo, DoctorStep } from "./types.ts";

const STAND = { side: "tested", at: "upperarm01", distance: 0.85, face: "camera" } as const;
const STAND_LYING = { side: "tested", at: "upperarm01", distance: 0.62, face: "patient" } as const;
const HEAD_HAND = (hand: "L" | "R", at: string) => ({ hand, at, palm: [0, 0, -1] as [number, number, number], fingers: [-1, -0.25, 0] as [number, number, number], shape: "flat" as const });

const talk = (id: string, chip: string, extra: Partial<DoctorStep> = {}, withPoint = false): DoctorStep => ({
  chip,
  say: [{ src: "site", id, part: "summary" }, ...(withPoint ? [{ src: "site", id, part: "point", index: 0 } as const] : [])],
  link: { id, ...(id === "overview" ? { label: { en: "Explore everything on the homepage", ur: "Homepage par sab kuch dekhein" } } : {}) },
  gesture: "open",
  look: "camera",
  ...extra,
});

export const siteTour: Choreo = {
  kind: "tour",
  slug: "site-tour",
  title: { en: "Tour of Physio Nexus Academy", ur: "Physio Nexus Academy ka tour" },
  side: "left",
  position: "standing",
  patient: {},
  enter: { away: 1.6, towardFeet: 0.4 },
  review: { status: "reviewed", by: "Interface text only (site guide wording)", date: "2026-11-14" },
  steps: [
    talk("overview", "PNA", { stand: STAND, position: "standing" }),
    talk("teacher", "Teacher", { gesture: "nod" }),
    talk("skills", "Skills Lab", {
      patient: { "shoulder.left": { flex: 0 } },
      cycle: { to: { "shoulder.left": { flex: 150 } }, seconds: 4.5 },
      overlays: [{ t: "angle", vertex: "upperarm01", a: "upperarm01{0,-1,0}", b: "lowerarm01", label: "Shoulder flexion {deg}°", tone: "cyan" }],
      gesture: "point",
      look: "patient",
    }),
    talk("virtual-patient", "Virtual Patient", {
      position: "supine",
      stand: { side: "tested", at: "lowerleg01", distance: 0.55, face: "patient" },
      patient: {},
      contacts: [{ hand: "R", at: "@patella", palm: [0, 0, -1], fingers: [0, 1, 0], shape: "flat" }],
      overlays: [{ t: "beacon", at: "@patella", label: "Examine", tone: "cyan" }],
      look: "hands",
      gesture: "none",
    }),
    talk("rehabverse", "RehabVerse", {
      position: "standing",
      stand: STAND,
      patient: { "hip.left": { flex: 0 }, "knee.left": { flex: 0 }, "hip.right": { flex: 0 }, "knee.right": { flex: 0 } },
      cycle: { to: { "hip.left": { flex: 55 }, "hip.right": { flex: 55 }, "knee.left": { flex: 70 }, "knee.right": { flex: 70 }, "ankle.left": { flex: 15 }, "ankle.right": { flex: 15 } }, seconds: 5 },
      overlays: [{ t: "angle", vertex: "lowerleg01", a: "upperleg01", b: "foot", label: "Knee angle {deg}°", tone: "green" }],
      look: "patient",
    }),
    talk("manual-therapy", "Manual Therapy", {
      position: "supine",
      stand: { ...STAND_LYING, distance: 0.4 },
      patient: { "shoulder.left": { flex: 20, abd: 55 }, "elbow.left": { flex: 40 } },
      contacts: [HEAD_HAND("R", "@coracoid{0.03,-0.012,0}"), { hand: "L", at: "lowerarm01{0,0,-0.045}", palm: [0, 0, 1], fingers: [0, 1, 0], shape: "cupped" }],
      lean: 0,
      move: { kind: "glide", dir: [0, 0, -1], amplitudeMm: 5, hz: 1.2 },
      overlays: [{ t: "arrow", at: "@coracoid{0.03,-0.012,0}", to: "@coracoid{0.03,-0.012,-0.09}", label: "Glide", tone: "cyan" }],
      look: "patient",
      gesture: "none",
    }),
    talk("conditions", "Conditions", {
      position: "standing",
      stand: STAND,
      patient: {},
      overlays: [
        { t: "beacon", at: "@ac-joint", label: "Shoulder", tone: "cyan" },
        { t: "beacon", at: "@patella", label: "Knee", tone: "cyan" },
      ],
      gesture: "point",
      look: "patient",
    }),
    talk("case-lab", "Case Lab", { gesture: "care", look: "patient", overlays: [] }),
    talk("daily-challenge", "Daily Challenge", { gesture: "point", look: "camera" }),
    talk("leagues", "Leagues"),
    talk("books", "Books"),
    talk("workshops", "Workshops"),
    talk("student-account", "My PNA", { gesture: "nod" }),
  ],
};
