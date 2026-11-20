import type { Parts } from "../../virtual-patient/parts.ts";
import { restingParts } from "../resting.ts";
import type { Prop } from "../types.ts";

/** Sitting on a chair (the demonstrator stands on the floor with hips and knees at 90°). */
export const SIT: Parts = {
  hip: { flex: 90 }, "hip:o": { flex: 90 }, knee: { flex: 90 }, "knee:o": { flex: 90 },
  shoulder: { flex: 12 }, "shoulder:o": { flex: 12 }, elbow: { flex: 45 }, "elbow:o": { flex: 45 },
};
export const CHAIR: Prop = { kind: "chair" };

/** Lying on the back with both knees bent (hook-lying). */
export const HOOK: Parts = { hip: { flex: 52 }, knee: { flex: 98 }, "hip:o": { flex: 52 }, "knee:o": { flex: 98 } };

/**
 * On hands and knees (the body is face-down in the model, so "forward" for the arms points down). The shoulders sit higher than the hips,
 * so the body is tipped head-up 13° (pelvis) and the arms and thighs, 77° from the trunk, stand upright: hands flat under the shoulders
 * (forearms turned, wrists bent back), knees under the hips, shins and the tops of the feet resting on the mat.
 */
export const QUAD: Parts = {
  pelvis: { flex: 13 },
  shoulder: { flex: 77 }, "shoulder:o": { flex: 77 }, hip: { flex: 77 }, "hip:o": { flex: 77 },
  knee: { flex: 90 }, "knee:o": { flex: 90 }, ankle: { flex: -65 }, "ankle:o": { flex: -65 },
  elbow: { rot: -90 }, "elbow:o": { rot: -90 }, wrist: { flex: -103 }, "wrist:o": { flex: -103 },
};

const supineRest = restingParts("supine");
/** Lying on the back with the arms resting on the bed (the resting pose), for exercises that move the arms or tilt the trunk and so must say where the arms start. */
export const SUPINE_ARMS: Parts = { shoulder: supineRest.shoulder, "shoulder:o": supineRest["shoulder:o"], elbow: supineRest.elbow, "elbow:o": supineRest["elbow:o"], hand: supineRest.hand, "hand:o": supineRest["hand:o"] };

/**
 * The top of a bridge. The pelvis lifts about the shoulders (`tiltAbout: "shoulders"`) with the feet planted, so the upper back and the shoulders stay
 * on the bed and the head on the pillow, as in a real bridge (rolling the whole trunk back instead lifted the shoulders and arms 18 cm into the air).
 * The numbers close the loop (shoulders, pelvis, feet) and were solved on the model: pelvis lifted 20°, hips 11° and knees 90° flexed, ankles neutral;
 * the arms are eased back by the same 20° and the neck flexed 12° so the hands stay on the bed and the head on the pillow.
 */
export const BRIDGE_TOP: Parts = {
  pelvis: { flex: -20 }, neck: { flex: 12 },
  hip: { flex: 11 }, "hip:o": { flex: 11 }, knee: { flex: 90 }, "knee:o": { flex: 90 },
  shoulder: { ...supineRest.shoulder, flex: (supineRest.shoulder?.flex ?? 0) - 20 }, "shoulder:o": { ...supineRest["shoulder:o"], flex: (supineRest["shoulder:o"]?.flex ?? 0) - 20 },
};
