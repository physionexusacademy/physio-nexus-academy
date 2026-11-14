/**
 * Maitland joint mobilization — glenohumeral posterior glide, supine.
 *
 * Teaching order follows the lesson "maitland-joint-mobilization": the eight steps of its "How to do it" beat (beat 8), then the
 * dosage line (beat 10). Contact, stabilisation and force direction labels are lines of the regional guide
 * "maitland-shoulder-posterior-glide". Hand placement, stance and movement are choreography (geometry) and are DRAFT until the
 * supervising physiotherapist reviews them.
 */
import type { Choreo } from "./types.ts";

const SHOULDER_HEAD = "@coracoid{0.03,-0.012,0}"; // just lateral to the coracoid: the front of the humeral head
const ELBOW_UNDER = "lowerarm01{0,0,-0.045}"; // under the elbow, to support the arm

export const maitlandShoulderPosteriorGlide: Choreo = {
  slug: "maitland-shoulder-posterior-glide",
  lessonSlug: "maitland-joint-mobilization",
  title: { en: "Glenohumeral posterior glide", ur: "Glenohumeral posterior glide" },
  side: "left",
  position: "supine",
  patient: { "shoulder.left": { flex: 0, abd: 0 }, "elbow.left": { flex: 0 } },
  enter: { away: 1.5, towardFeet: 0.9 },
  review: { status: "draft" },
  steps: [
    {
      chip: "Intro",
      say: [{ src: "lesson", beat: 8 }],
      stand: { side: "tested", at: "upperarm01", distance: 0.62, face: "camera" },
      gesture: "open",
      look: "camera",
    },
    {
      chip: "1 Comparable sign",
      say: [{ src: "lesson", beat: 8, step: 0 }],
      stand: { side: "tested", at: "upperarm01", distance: 0.62, face: "patient" },
      patient: { "shoulder.left": { flex: 150 }, "elbow.left": { flex: 0 } },
      overlays: [
        { t: "angle", vertex: "upperarm01", a: "upperarm01{0,1,0}", b: "lowerarm01", label: "Flexion {deg}°", tone: "cyan", note: { tag: "Re-test", ref: { src: "regional", field: "reassess", index: 0 } } },
      ],
      gesture: "point",
      look: "patient",
      holdSec: 1,
    },
    {
      chip: "2 Red flags",
      say: [{ src: "lesson", beat: 8, step: 1 }],
      patient: { "shoulder.left": { flex: 0 }, "elbow.left": { flex: 0 } },
      gesture: "care",
      look: "patient",
    },
    {
      chip: "3 Position",
      say: [{ src: "lesson", beat: 8, step: 2 }, { src: "regional", field: "patientPosition", index: 0 }],
      stand: { side: "tested", at: "upperarm01", distance: 0.4, face: "patient" },
      patient: { "shoulder.left": { flex: 20, abd: 55 }, "elbow.left": { flex: 40 } },
      contacts: [{ hand: "L", at: ELBOW_UNDER, palm: [0, 0, 1], fingers: [0, 1, 0], shape: "cupped" }],
      overlays: [
        { t: "beacon", at: ELBOW_UNDER, label: "Support", tone: "green", note: { tag: "Therapist", ref: { src: "regional", field: "therapistPosition", index: 1 } } },
      ],
      look: "patient",
    },
    {
      chip: "4 Contact",
      say: [{ src: "lesson", beat: 8, step: 3 }, { src: "regional", field: "contact", index: 0 }],
      contacts: [
        { hand: "R", at: SHOULDER_HEAD, palm: [0, 0, -1], fingers: [-1, -0.25, 0], shape: "flat" },
        { hand: "L", at: ELBOW_UNDER, palm: [0, 0, 1], fingers: [0, 1, 0], shape: "cupped" },
      ],
      overlays: [
        { t: "beacon", at: SHOULDER_HEAD, label: "Contact", tone: "cyan", note: { tag: "Contact", ref: { src: "regional", field: "contact", index: 0 } } },
        { t: "beacon", at: "@ac-joint", label: "Stabilise", tone: "amber", note: { tag: "Stabilise", ref: { src: "regional", field: "stabilization", index: 0 } } },
      ],
      look: "hands",
      holdSec: 1,
    },
    {
      chip: "5 Body weight",
      say: [{ src: "lesson", beat: 8, step: 4 }],
      contacts: [
        { hand: "R", at: SHOULDER_HEAD, palm: [0, 0, -1], fingers: [-1, -0.25, 0], shape: "flat" },
        { hand: "L", at: ELBOW_UNDER, palm: [0, 0, 1], fingers: [0, 1, 0], shape: "cupped" },
      ],
      lean: 8,
      overlays: [
        { t: "arrow", at: SHOULDER_HEAD, to: SHOULDER_HEAD + "{0,0,-0.09}", label: "Glide", tone: "cyan", note: { tag: "Direction", ref: { src: "regional", field: "forceDirection", index: 0 } } },
      ],
      look: "hands",
    },
    {
      chip: "6 Start low",
      say: [{ src: "lesson", beat: 8, step: 5 }, { src: "lesson", beat: 10 }],
      contacts: [
        { hand: "R", at: SHOULDER_HEAD, palm: [0, 0, -1], fingers: [-1, -0.25, 0], shape: "flat" },
        { hand: "L", at: ELBOW_UNDER, palm: [0, 0, 1], fingers: [0, 1, 0], shape: "cupped" },
      ],
      lean: 8,
      move: { kind: "glide", dir: [0, 0, -1], amplitudeMm: 6, hz: 1.5 },
      overlays: [
        { t: "arrow", at: SHOULDER_HEAD, to: SHOULDER_HEAD + "{0,0,-0.09}", label: "Glide", tone: "cyan", note: { tag: "Dose", ref: { src: "regional", field: "dosage", index: 0 } } },
      ],
      look: "patient",
    },
    {
      chip: "7 Retest",
      say: [{ src: "lesson", beat: 8, step: 6 }],
      stand: { side: "tested", at: "upperarm01", distance: 0.62, face: "patient" },
      patient: { "shoulder.left": { flex: 150, abd: 0 }, "elbow.left": { flex: 0 } },
      overlays: [
        { t: "angle", vertex: "upperarm01", a: "upperarm01{0,1,0}", b: "lowerarm01", label: "Flexion {deg}°", tone: "green", note: { tag: "Re-test", ref: { src: "regional", field: "reassess", index: 0 } } },
      ],
      gesture: "point",
      look: "patient",
      holdSec: 1,
    },
    {
      chip: "8 Hand it back",
      say: [{ src: "lesson", beat: 8, step: 7 }],
      patient: { "shoulder.left": { flex: 20, abd: 30 }, "elbow.left": { flex: 20 } },
      gesture: "open",
      look: "camera",
    },
  ],
};
