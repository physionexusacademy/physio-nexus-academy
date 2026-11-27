"""
The vertebral column: C1 to L5, each vertebra built from its anatomical parts.

Typical adult male sizes (millimetres) from standard anatomy texts, rounded:
  body: cervical ~17-24 wide, 15-17 deep, 13-15 high; thoracic 26 -> 40 wide, 18 -> 30 deep, 15 -> 24 high; lumbar 42 -> 50 wide, 30 -> 34 deep, 26 -> 27 high.
  canal: cervical triangular ~24 x 15; thoracic round ~16 x 15; lumbar triangular ~22-25 x 16-17.
  spinous process: C3-C6 short and split at the tip (bifid), C7 long (vertebra prominens); thoracic long and steep (overlapping like tiles); lumbar short, tall and horizontal (hatchet).
  transverse process: cervical short with a hole for the vertebral artery (foramen transversarium); thoracic stout, pointing back and out with a facet for the rib; lumbar long and thin.
Local frame of a vertebra: origin at the centre of the body, y along the spine (up), z forward (anterior), x to the person's left.
"""
import numpy as np
from sdf import (capsule, ellcyl, ellring, box, sphere, ellipsoid, smooth_union, subtract, intersect, halfspace, rot_x, union)

# Height (y) and front-back position (z) of each body centre, metres. Lordosis in the neck and low back, kyphosis in the chest.
LEVELS = {
    "c1": (1.552, -0.018), "c2": (1.532, -0.016), "c3": (1.514, -0.012), "c4": (1.498, -0.010), "c5": (1.482, -0.011), "c6": (1.466, -0.014), "c7": (1.449, -0.019),
    "t1": (1.428, -0.025), "t2": (1.406, -0.031), "t3": (1.384, -0.036), "t4": (1.362, -0.040), "t5": (1.340, -0.043), "t6": (1.318, -0.045),
    "t7": (1.296, -0.046), "t8": (1.274, -0.045), "t9": (1.252, -0.043), "t10": (1.229, -0.039), "t11": (1.205, -0.033), "t12": (1.180, -0.026),
    "l1": (1.152, -0.018), "l2": (1.118, -0.010), "l3": (1.084, -0.005), "l4": (1.050, -0.006), "l5": (1.016, -0.014),
}
ORDER = list(LEVELS.keys())

def lerp(a, b, t):
    return a + (b - a) * t

def params(level):
    """Size parameters (metres, degrees) for a level, interpolated within each region."""
    kind = level[0]
    i = int(level[1:])
    if kind == "c":
        t = (i - 3) / 4 if i >= 3 else 0
        return dict(kind="c", a=lerp(0.0085, 0.0115, t), b=lerp(0.0075, 0.0085, t), h=lerp(0.0065, 0.0072, t),
                    crx=0.0115, crz=0.0068, t=0.0022, ah=0.0045, sp_len=0.024 if i == 7 else lerp(0.012, 0.016, t), sp_ang=lerp(10, 22, t),
                    sp_r=(0.0035, 0.003), bifid=(2 <= i <= 6), tp=lerp(0.0215, 0.026, t))
    if kind == "t":
        t = (i - 1) / 11
        return dict(kind="t", a=lerp(0.0125, 0.0205, t), b=lerp(0.0092, 0.0150, t), h=lerp(0.0076, 0.0118, t),
                    crx=0.0085 + 0.0005 * t, crz=0.0078, t=0.0032, ah=lerp(0.0065, 0.0085, t),
                    sp_len=lerp(0.032, 0.038, min(1, t * 2)) if t < 0.6 else lerp(0.038, 0.028, (t - 0.6) / 0.4),
                    sp_ang=lerp(32, 62, min(1, t * 2.2)) if t < 0.55 else lerp(62, 22, (t - 0.55) / 0.45),
                    sp_r=(0.0035, 0.0022), bifid=False, tp=lerp(0.036, 0.022, t), tp_back=lerp(0.014, 0.007, t))
    t = (i - 1) / 4
    return dict(kind="l", a=lerp(0.0205, 0.0250, t), b=lerp(0.0150, 0.0170, t), h=lerp(0.0128, 0.0134, t),
                crx=lerp(0.0110, 0.0125, t), crz=0.0082, t=0.0042, ah=0.0095, sp_len=lerp(0.026, 0.022, t), sp_ang=lerp(4, 0, t),
                sp_r=None, bifid=False, tp=[0.032, 0.039, 0.043, 0.039, 0.036][i - 1])

def vertebra_local(level):
    p = params(level)
    a, b, h = p["a"], p["b"], p["h"]
    parts = []
    # ---- body (kidney shaped in the low back: a slight hollow at the back) ----
    if level != "c1":
        body = ellcyl((0, 0, 0), a, b, h, r=0.0018, waist=0.07)
        if p["kind"] == "l":
            body = subtract(body, ellipsoid((0, 0, -b * 1.35), (a * 0.45, h * 1.5, b * 0.5)), k=0.003)
        if p["kind"] == "c":  # uncinate processes: small lips on the top corners of cervical bodies
            body = smooth_union(body, capsule((a * 0.8, h * 0.6, 0.0), (a * 0.9, h * 1.35, -b * 0.2), 0.0016),
                                capsule((-a * 0.8, h * 0.6, 0.0), (-a * 0.9, h * 1.35, -b * 0.2), 0.0016), k=0.0015)
        parts.append(body)
    # ---- vertebral arch: pedicles in front, laminae behind, around the canal ----
    cz = -(b + p["crz"] - 0.001)
    arch = ellring((0, 0, cz), p["crx"] + p["t"], p["crz"] + p["t"] * 0.6, p["t"], p["ah"])
    if level != "c1":
        arch = intersect(arch, halfspace((0, 0, 1), -b * 0.55))  # the front of the ring is the back of the body
    parts.append(arch)
    back = cz - p["crz"] - p["t"]  # the back of the lamina, at the midline
    # ---- spinous process ----
    ang = np.radians(p["sp_ang"])
    dirv = np.array([0, -np.sin(ang), -np.cos(ang)])
    root = np.array([0, -p["ah"] * 0.2, back + 0.002])
    tip = root + dirv * p["sp_len"]
    if p["kind"] == "l":
        # hatchet: a tall, thin, horizontal blade
        mid = (root + tip) / 2
        parts.append(box(mid, (0.0028, 0.0085, p["sp_len"] / 2), r=0.0022))
        parts.append(ellipsoid(tip + np.array([0, 0, 0.002]), (0.0040, 0.0095, 0.004)))
    elif level == "c1":
        parts.append(ellipsoid((0, 0, back - 0.003), (0.0055, 0.0045, 0.004)))  # posterior tubercle only
    else:
        r0, r1 = p["sp_r"]
        if level == "c2":
            tip = root + dirv * 0.020
            r0, r1 = 0.0055, 0.004
        parts.append(capsule(root, tip, r0, r1))
        if p["bifid"]:
            for s in (-1, 1):
                parts.append(sphere(tip + np.array([s * 0.0035, -0.0008, -0.0005]), r1 * 1.05))
        else:
            parts.append(sphere(tip, r1 * 1.25))
    # ---- transverse processes ----
    for s in (-1, 1):
        if p["kind"] == "c":
            if level == "c1":
                base = np.array([s * 0.016, 0, cz * 0.3])
                tipt = np.array([s * 0.036, -0.001, cz * 0.35])
                parts.append(capsule(base, tipt, 0.0045, 0.0042))
            else:
                base = np.array([s * a * 0.85, -h * 0.1, -b * 0.35])
                tipt = np.array([s * p["tp"], -h * 0.25, -b * 0.25])
                parts.append(capsule(base, tipt, 0.0032, 0.0030))
                # anterior and posterior tubercles
                parts.append(sphere(tipt + np.array([0, -0.001, 0.0025]), 0.0026))
                parts.append(sphere(tipt + np.array([0, -0.0005, -0.0025]), 0.0026))
        elif p["kind"] == "t":
            base = np.array([s * (p["crx"] + p["t"]), 0.0, cz + p["crz"] * 0.15])
            tipt = np.array([s * p["tp"], h * 0.25, cz - p["tp_back"]])
            parts.append(capsule(base, tipt, 0.0042, 0.0046))
            parts.append(sphere(tipt, 0.0055))  # the knob that meets the rib's tubercle
        else:
            base = np.array([s * (p["crx"] + p["t"] * 0.5), 0.0, cz + p["crz"] * 0.45])
            tipt = np.array([s * p["tp"], 0.001, cz + p["crz"] * 0.1])
            parts.append(box((base + tipt) / 2, (abs(tipt[0] - base[0]) / 2, 0.0045, 0.0026), r=0.002))
            parts.append(ellipsoid(tipt, (0.003, 0.005, 0.003)))
            parts.append(sphere(np.array([s * (p["crx"] + p["t"] * 1.2), 0.004, cz - p["crz"] * 0.4]), 0.0035))  # mammillary process
    # ---- articular processes (facet joints): above and below, where the pedicle meets the lamina ----
    for s in (-1, 1):
        xf = s * (p["crx"] + p["t"] * 0.6)
        zf = cz - p["crz"] * 0.25
        up = 0.0065 if p["kind"] != "c" else 0.0045
        parts.append(capsule((xf, p["ah"] * 0.6, zf), (xf * 1.05, p["ah"] + up, zf - 0.002), 0.0032))
        parts.append(capsule((xf * 0.92, -p["ah"] * 0.6, zf - 0.002), (xf * 0.9, -p["ah"] - up, zf - 0.004), 0.0030))
    shape = smooth_union(*parts, k=0.0022)
    # ---- holes: the canal, and the cervical foramen transversarium for the vertebral artery ----
    holes = [ellcyl((0, 0, cz), p["crx"], p["crz"], 0.05, r=0.0)]
    if p["kind"] == "c" and level != "c1":
        for s in (-1, 1):
            holes.append(capsule((s * (a + 0.0045), -0.02, -b * 0.3), (s * (a + 0.0045), 0.02, -b * 0.3), 0.0022))
    if level == "c1":
        # the atlas: a ring with thick side masses, a thin front arch and the facet for the dens
        ring = smooth_union(ellring((0, 0, -0.010), 0.0195, 0.0195, 0.0026, 0.0045),
                            ellipsoid((0.0155, 0, -0.008), (0.0055, 0.0075, 0.0085)), ellipsoid((-0.0155, 0, -0.008), (0.0055, 0.0075, 0.0085)),
                            ellipsoid((0, 0.0, 0.0085), (0.006, 0.0055, 0.0035)), k=0.003)
        shape = smooth_union(ring, *parts[1:], k=0.0022) if False else smooth_union(ring, *[q for q in parts if q is not arch], k=0.0022)
        holes = [ellcyl((0, 0, -0.010), 0.0135, 0.0145, 0.05, r=0.0)]
        for s in (-1, 1):
            holes.append(capsule((s * 0.0205, -0.02, -0.007), (s * 0.0205, 0.02, -0.007), 0.0025))
    if level == "c2":
        shape = smooth_union(shape, capsule((0, h * 0.8, 0.0005), (0, h + 0.0155, 0.001), 0.0052, 0.0040), k=0.002)  # the dens (odontoid peg)
    return subtract(shape, *holes)

def frame(level):
    """World position and the small forward/backward tilt of a vertebra, from its neighbours."""
    y, z = LEVELS[level]
    i = ORDER.index(level)
    up = LEVELS[ORDER[max(0, i - 1)]]
    dn = LEVELS[ORDER[min(len(ORDER) - 1, i + 1)]]
    dz, dy = up[1] - dn[1], up[0] - dn[0]
    tilt = np.degrees(np.arctan2(dz, dy))  # positive: the top of the vertebra leans forward
    return np.array([0.0, y, z]), rot_x(-tilt)

def vertebra_world(level):
    c, R = frame(level)
    loc = vertebra_local(level)
    return (lambda P: loc((P - c) @ R)), c

def bounds(level):
    c, _ = frame(level)
    return c - np.array([0.05, 0.035, 0.065]), c + np.array([0.05, 0.035, 0.045])

def region(level):
    return {"c": "spine_cervical", "t": "spine_thoracic", "l": "spine_lumbar"}[level[0]]
