/**
 * Nine reviewed, technique-matched illustrations for the Manual Therapy library.
 * All images are cropped to 400x500, encoded in AVIF, and weigh 8.8–13.9 KiB each.
 * They are decorative editorial covers, NOT procedural technique demonstrations.
 *
 * Required GitHub assets (binary files, not text):
 *   public/images/manual-therapy/<slug>.avif
 *
 * Do not merge this change unless the nine assets have been uploaded and verified.
 * Strain Counterstrain intentionally keeps the existing image.
 */
export const approvedManualAvifCards: Readonly<Record<string, string>> = {
  "maitland-joint-mobilization": "/images/manual-therapy/maitland-joint-mobilization.avif",
  "kaltenborn-evjenth-mobilization": "/images/manual-therapy/kaltenborn-evjenth-mobilization.avif",
  "mulligan-snags-nags": "/images/manual-therapy/mulligan-snags-nags.avif",
  "paivm-ppivm-spinal-assessment": "/images/manual-therapy/paivm-ppivm-spinal-assessment.avif",
  "mckenzie-mdt": "/images/manual-therapy/mckenzie-mdt.avif",
  "paris-approach": "/images/manual-therapy/paris-approach.avif",
  "myofascial-release": "/images/manual-therapy/myofascial-release.avif",
  "neurodynamic-mobilization": "/images/manual-therapy/neurodynamic-mobilization.avif",
  "muscle-energy-technique": "/images/manual-therapy/muscle-energy-technique.avif",
};
