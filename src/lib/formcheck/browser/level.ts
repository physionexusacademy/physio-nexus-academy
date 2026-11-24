/**
 * Is the phone upright? A phone that leans back or sideways makes every angle the camera reads a little wrong, so the alignment screen shows how far from level it is. Browser only.
 *
 * It uses gravity as the phone's motion sensor reports it (`devicemotion`), and says only HOW FAR from level (a size in degrees), never which way: that is the same on every
 * phone, while the signs of the axes differ between phones and browsers. The person wiggles the phone until it reads level. Nothing here is stored or sent, and a phone
 * without the sensor (or a person who declines on an iPhone) simply gets no level indicator: the check works without it.
 *
 *  pitch  how far the camera's line of sight is from horizontal (the phone leaning back or forward)
 *  roll   how far the picture is turned about the line of sight, to the nearest of the four upright positions (so it is the same in portrait and landscape)
 */
export type Tilt = { pitch: number; roll: number; level: boolean };
export const LEVEL_LIMIT_DEG = 3;

/** Pure: gravity (x, y, z in the phone's frame, any unit) to the tilt. Exported for the tests. */
export function tiltFromGravity(x: number, y: number, z: number): Tilt | null {
  const norm = Math.hypot(x, y, z);
  if (!(norm > 0.5)) return null; // a phone in free fall, or no data
  const pitch = (Math.asin(Math.min(1, Math.abs(z) / norm)) * 180) / Math.PI;
  const angle = (Math.atan2(x, y) * 180) / Math.PI;
  const roll = Math.abs(((((angle + 45) % 90) + 90) % 90) - 45);
  return { pitch, roll, level: pitch <= LEVEL_LIMIT_DEG && roll <= LEVEL_LIMIT_DEG };
}

type MotionPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

export class PhoneLevel {
  private handler: ((event: DeviceMotionEvent) => void) | null = null;
  private latest: Tilt | null = null;
  private smooth = { pitch: 0, roll: 0, has: false };

  static supported(): boolean {
    return typeof window !== "undefined" && "DeviceMotionEvent" in window;
  }

  /** Call from a tap (an iPhone asks permission only then). Resolves true once the sensor is listened to; false when it is unavailable or declined. */
  async start(onTilt: (tilt: Tilt | null) => void): Promise<boolean> {
    if (!PhoneLevel.supported()) return false;
    const request = (DeviceMotionEvent as unknown as MotionPermission).requestPermission;
    if (typeof request === "function") {
      try { if ((await request.call(DeviceMotionEvent)) !== "granted") return false; } catch { return false; }
    }
    this.handler = (event) => {
      const g = event.accelerationIncludingGravity;
      // a computer fires the event once with empty values: those are ignored, so a device without the sensor never shows a dial
      if (!g || g.x === null || g.y === null || g.z === null) return;
      const raw = tiltFromGravity(g.x, g.y, g.z);
      if (!raw) return;
      // the sensor is noisy by a degree or so: a light smoothing keeps the number from flickering
      const k = this.smooth.has ? 0.25 : 1;
      this.smooth = { pitch: this.smooth.pitch + k * (raw.pitch - this.smooth.pitch), roll: this.smooth.roll + k * (raw.roll - this.smooth.roll), has: true };
      this.latest = { pitch: this.smooth.pitch, roll: this.smooth.roll, level: this.smooth.pitch <= LEVEL_LIMIT_DEG && this.smooth.roll <= LEVEL_LIMIT_DEG };
      onTilt(this.latest);
    };
    // No timeout waiting for a first reading: the page is busy while the pose model loads, and a late reading is still a good one.
    window.addEventListener("devicemotion", this.handler);
    return true;
  }

  get tilt(): Tilt | null {
    return this.latest;
  }

  stop() {
    if (this.handler) window.removeEventListener("devicemotion", this.handler);
    this.handler = null;
    this.latest = null;
    this.smooth = { pitch: 0, roll: 0, has: false };
  }
}
