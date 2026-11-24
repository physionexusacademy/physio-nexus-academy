import { CERVICAL_SPECS } from "./specs-cervical.ts";
import { LUMBAR_SPECS } from "./specs-lumbar.ts";
import { THORACIC_SPECS } from "./specs-thoracic.ts";
import type { CameraSpec } from "./spec-types.ts";

/** All 27 neck and back camera specifications (cervical 9, thoracic 6, lumbar 12), in library order. */
export const CAMERA_SPECS: CameraSpec[] = [...CERVICAL_SPECS, ...THORACIC_SPECS, ...LUMBAR_SPECS];

export const specFor = (id: string): CameraSpec | undefined => CAMERA_SPECS.find((spec) => spec.id === id);
