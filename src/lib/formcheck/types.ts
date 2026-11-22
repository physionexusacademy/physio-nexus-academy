/**
 * PNA RehabVerse Form Check: the camera engine's shared types. Pure data, no browser or model code in this folder, so every rule can be tested
 * with plain numbers (scripts/validate-formcheck.ts) and the same code runs in the browser and in the validators.
 *
 * Coordinates: a pose model returns landmarks with x and y normalised to 0..1 of the image width and height and a visibility 0..1. Angles must be
 * worked out in PIXELS (x times width, y times height), never in the normalised square: on a 16:9 frame a 45 degree line looks like 29 degrees in
 * the normalised square. `Frame` therefore always carries the pixel size.
 */
export type Landmark = { x: number; y: number; z?: number; v: number };

/** The 33 landmarks of the MediaPipe pose model, by name (the index is the position in the model's output). */
export const LM = {
  nose: 0, leftEyeInner: 1, leftEye: 2, leftEyeOuter: 3, rightEyeInner: 4, rightEye: 5, rightEyeOuter: 6, leftEar: 7, rightEar: 8, mouthLeft: 9, mouthRight: 10,
  leftShoulder: 11, rightShoulder: 12, leftElbow: 13, rightElbow: 14, leftWrist: 15, rightWrist: 16, leftPinky: 17, rightPinky: 18, leftIndex: 19, rightIndex: 20,
  leftThumb: 21, rightThumb: 22, leftHip: 23, rightHip: 24, leftKnee: 25, rightKnee: 26, leftAnkle: 27, rightAnkle: 28, leftHeel: 29, rightHeel: 30,
  leftFootIndex: 31, rightFootIndex: 32,
} as const;
export type LandmarkName = keyof typeof LM;

/** One video frame's pose. `t` is the capture time in milliseconds; `w` and `h` the image size in pixels. */
export type Frame = {
  t: number;
  w: number;
  h: number;
  lm: Landmark[];
  /** mean brightness of the image, 0..255, when the caller measured it */
  luma?: number;
  /**
   * The head's orientation in degrees relative to the camera (from the face model), when the exercise needs it: yaw (turning left or right), pitch
   * (nodding, positive when the chin goes down) and roll (tilting the ear to the shoulder, positive towards the image right). `v` is its confidence 0..1.
   */
  head?: { yaw: number; pitch: number; roll: number; v: number };
};

/**
 * In a side view the limb nearest the camera is the one the model sees best. "near:knee" is whichever knee that is for this frame (the side with the
 * higher visibility of the shoulder, hip, knee and ankle), "far:knee" the other one. "tested:knee" is the knee of the side the person is exercising (said by
 * the person before the exercise starts) and "other:knee" the opposite one; they need the tested side to be given (ReadOptions.tested), else they cannot be read.
 */
export type SidePart = "ear" | "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle" | "heel" | "footIndex";
export type SidedRef = `near:${SidePart}` | `far:${SidePart}` | `tested:${SidePart}` | `other:${SidePart}`;
/** A point to measure: one landmark, a near/far landmark, or the midpoint of two (for example the middle of the shoulders). */
export type PointRef = LandmarkName | SidedRef | { mid: [PointRef, PointRef] };

/**
 * What can be measured from one camera, all in the image plane:
 *  - joint: the angle at b between the segments b-a and b-c (0..180), for example the knee angle;
 *  - incline: the angle of the segment from -> to against the vertical or the horizontal (signed, degrees);
 *  - tilt: the angle of the line a -> b against the horizontal (signed), for example the shoulder line;
 *  - offset: the distance a -> b along x (horizontal) or y (vertical, positive upwards) as a fraction of the length of the segment `scale` (signed);
 *  - dist: the length of a -> b as a fraction of the length of the segment `scale` (for example how far the wrists are apart in shoulder widths);
 *  - rotation: how far the trunk or head has turned about the long axis, from how much narrower a width looks than it did in the person's own neutral
 *    position (acos of the width ratio; the size only, not the direction; needs the baseline taken while the person stands or sits neutral);
 *  - head: the head orientation from the face model (yaw, pitch or roll), relative to the camera;
 *  - diff: one metric minus another (for example the tilt of the ears minus the tilt of the shoulders = the head tilted on the trunk).
 * `byFacing` flips the sign so that positive always means "towards the way the person faces" (side views), which makes left-facing and right-facing
 * people read the same. `abs` reports the size only (a movement to either side counts the same).
 */
type Flags = { abs?: boolean };
export type Metric = Flags &
  (
    | { id: string; kind: "joint"; a: PointRef; b: PointRef; c: PointRef }
    | { id: string; kind: "incline"; from: PointRef; to: PointRef; ref: "vertical" | "horizontal"; byFacing?: boolean }
    | { id: string; kind: "tilt"; a: PointRef; b: PointRef }
    | { id: string; kind: "offset"; a: PointRef; b: PointRef; scale: [PointRef, PointRef]; axis?: "x" | "y"; byFacing?: boolean }
    | { id: string; kind: "dist"; a: PointRef; b: PointRef; scale: [PointRef, PointRef] }
    | { id: string; kind: "rotation"; a: PointRef; b: PointRef }
    | { id: string; kind: "head"; axis: "yaw" | "pitch" | "roll" }
    | { id: string; kind: "diff"; a: Metric; b: Metric }
  );

/** Readings taken while the person is in their neutral position, by metric id: the raw reading (for `rotation`, the width in pixels it is measured against). */
export type Baseline = Record<string, number>;

export type Reading = { value: number; /** the lowest visibility of the landmarks used, 0..1 */ confidence: number };

export type Bi = { en: string; ru: string };
