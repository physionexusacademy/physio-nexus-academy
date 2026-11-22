/**
 * The head's orientation from the face model's 4x4 transformation matrix (column-major, as the face landmarker returns it): yaw (turning left or right), pitch
 * (nodding) and roll (tilting the ear to the shoulder), in degrees. Only the SIZE of these angles is used by the exercise specs (they are read with `abs`), so a flipped
 * sign convention cannot make a measurement wrong; the validation study checks the size against a reference instrument.
 */
export function headPoseFromMatrix(data: ArrayLike<number>): { yaw: number; pitch: number; roll: number } | null {
  if (data.length < 16 || !Array.from(data).every(Number.isFinite)) return null;
  const R = (row: number, col: number) => data[col * 4 + row];
  const scale = Math.hypot(R(0, 0), R(1, 0), R(2, 0)) || 1; // the matrix carries the face's size; take it out
  const r = (row: number, col: number) => R(row, col) / scale;
  const deg = 180 / Math.PI;
  const yaw = Math.atan2(r(0, 2), r(2, 2)) * deg;
  const pitch = Math.atan2(-r(1, 2), Math.hypot(r(0, 2), r(2, 2))) * deg;
  const roll = Math.atan2(r(1, 0), r(1, 1)) * deg;
  return { yaw, pitch, roll };
}
