import {
  manualTherapyMechanisms as legacyManualTherapyMechanisms,
  manualTherapyMechanismEvidence,
  type ManualTherapyMechanism,
} from "@/lib/manual-therapy-mechanisms";
import { manualTherapyMechanismAdditions } from "@/lib/manual-therapy-mechanism-additions";

export const manualTherapyMechanisms: Record<string, ManualTherapyMechanism> = {
  ...legacyManualTherapyMechanisms,
  ...manualTherapyMechanismAdditions,
};

export { manualTherapyMechanismEvidence };
