"""
The small long bones of the hand and foot: metacarpals, metatarsals and phalanges.

Each one has the parts a real bone has, not a capsule with a ball:
- base: broad and blocky, flat-ended where it meets its neighbour;
- shaft: slim, a little flattened front to back (palmar / plantar), its sides drawn in (waist), and slightly bowed so the back is convex;
- head: on a metacarpal or metatarsal a rounded knuckle, deeper toward the palm or sole; on a proximal or middle phalanx a pulley
  (two condyles side by side with a shallow groove between); a distal phalanx ends in a flat, spade-shaped tuft.
"""
import numpy as np
from sdf import ellipsoid, ellcyl, sphere, smooth_union, subtract, capsule


def frame(a, b, palmar):
    """World-to-local rotation: local y runs along the bone (a -> b), local z toward the palm / sole, local x across."""
    d = np.asarray(b, float) - np.asarray(a, float); d /= np.linalg.norm(d)
    z = np.asarray(palmar, float); z = z - (z @ d) * d; z /= np.linalg.norm(z)
    x = np.cross(d, z)
    return np.array([x, d, z]), d, x, z


def long_bone(a, b, r_base, r_head, palmar, kind="phalanx", gap=0.0006):
    """kind: 'meta' (metacarpal / metatarsal), 'phalanx' (proximal or middle), 'distal' (last phalanx)."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    R, d, x, z = frame(a, b, palmar)
    a2, b2 = a + d * gap, b - d * gap
    L = np.linalg.norm(b2 - a2)
    rs = 0.58 * min(r_base, r_head) if kind != "distal" else 0.55 * r_base   # the shaft is clearly slimmer than its ends
    bow = -z * 0.06 * L                                                          # bowed: the back (dorsum) convex
    mid = (a2 + b2) / 2 + bow
    parts = []
    # base: blocky, wider across than deep, flat-ended
    parts.append(ellcyl(a2 + d * r_base * 0.55, r_base * 1.05, r_base * 0.88, r_base * 0.55, rot=R, r=r_base * 0.35))
    # shaft: two halves meeting at the bowed middle, flattened front to back, with a drawn-in waist
    for p, q in ((a2 + d * r_base * 0.9, mid), (mid, b2 - d * r_head * 1.0)):
        c = (p + q) / 2; h = np.linalg.norm(q - p) / 2 + rs * 0.5
        Rs, _, _, _ = frame(p, q, palmar)
        parts.append(ellcyl(c, rs * 1.12, rs * 0.86, h, rot=Rs, r=rs * 0.45, waist=0.10))
    if kind == "meta":
        # a rounded head, deeper and broader toward the palm / sole, with small tubercles on each side for the collateral ligaments
        hc = b2 - d * r_head * 0.85 + z * r_head * 0.12
        parts.append(ellipsoid(hc, (r_head * 0.98, r_head * 0.95, r_head * 1.12), rot=R))
        for s in (-1, 1):
            parts.append(sphere(hc + x * s * r_head * 0.78 - z * r_head * 0.25 - d * r_head * 0.35, r_head * 0.32))
    elif kind == "phalanx":
        # a pulley-shaped head: two condyles with a shallow groove between
        hc = b2 - d * r_head * 0.72
        for s in (-1, 1):
            parts.append(ellipsoid(hc + x * s * r_head * 0.42, (r_head * 0.62, r_head * 0.72, r_head * 0.95), rot=R))
    else:
        # the ungual tuft: a flat spade at the tip, wider than the shaft
        tc = b2 - d * r_head * 0.55
        parts.append(ellipsoid(tc, (r_head * 1.35, r_head * 0.75, r_head * 0.62), rot=R))
    shape = smooth_union(*parts, k=0.0022)
    if kind in ("phalanx", "distal"):
        # the base of a phalanx is hollowed to take the head of the bone before it
        shape = subtract(shape, sphere(a - d * r_base * 0.72, r_base * 0.85), k=0.0008)
    return shape


def ray(points, radii, palmar, last_is_distal=True):
    """A whole finger or toe: points from the base of the metacarpal/metatarsal to the tip; radii at each point."""
    out = []
    n = len(points) - 1
    for i in range(n):
        kind = "meta" if i == 0 else ("distal" if (i == n - 1 and last_is_distal) else "phalanx")
        out.append(long_bone(points[i], points[i + 1], radii[i], radii[i + 1], palmar, kind))
    return out
