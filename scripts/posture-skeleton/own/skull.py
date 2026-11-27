"""
Skull, mandible and teeth of an adult (male), Frankfurt plane horizontal, facing +z.

Proportions: vertex to nasion ~10.5 cm, nasion to menton ~12.5 cm, cranial length ~19.5 cm, breadth ~14.5 cm.
Cranium: vault (frontal, parietal, occipital) with the forehead rising from the brow ridges; external occipital protuberance; temporal
fossae on the sides; mastoid processes behind the ear; external acoustic meatus; occipital condyles beside the foramen magnum, resting on C1.
Face: orbits (~40 mm wide, ~35 mm high, ~45 mm deep, cone-shaped), nasal bones, pear-shaped nasal aperture, maxillae with the alveolar arch,
zygomatic bones (cheeks) with the arches running back to just in front of the ear.
Mandible: U-shaped body with the chin, the angle, rami rising to the condyle (jaw joint) behind and the coronoid process in front, with the
mandibular notch between. Teeth: 16 upper and 16 lower crowns (incisors, canines, premolars, molars) along the arches.
"""
import numpy as np
from sdf import (sphere, ellipsoid, capsule, chain, box, plate, polygon2d_sdf, smooth_union, subtract, union, intersect, halfspace, rot_x, rot_y, rot_z)

NASION = np.array([0.0, 1.640, 0.088])

def cranium():
    # the vault: one smooth egg, long (glabella to the back of the head ~19.5 cm), widest over the parietals (~14.5 cm) and narrower at the forehead (~10.5 cm)
    _egg = ellipsoid((0.0, 1.662, -0.010), (0.0725, 0.0710, 0.0985))
    def vault(P):
        q = P.copy()
        narrow = 1.0 - 0.22 * np.clip((P[:, 2] - 0.000) / 0.085, 0, 1) ** 1.5
        q[:, 0] = P[:, 0] / narrow
        return _egg(q) * np.minimum(narrow, 1.0) ** 0.5
    brow = capsule((-0.038, 1.651, 0.082), (0.038, 1.651, 0.082), 0.0068)
    glabella = sphere((0.0, 1.652, 0.087), 0.0075)
    # the facial skeleton: a broad upper face around the orbits, narrowing below the cheekbones into the maxillae and the tooth arch
    face = smooth_union(box((0.0, 1.623, 0.056), (0.050, 0.026, 0.028), r=0.013),
                        ellipsoid((0.0, 1.580, 0.056), (0.039, 0.030, 0.031)), k=0.010)
    face_taper = intersect(face, ellipsoid((0.0, 1.600, 0.0), (0.078, 0.200, 0.093)))  # the face curves back toward the cheeks
    alveolus = chain([(-0.030, 1.556, 0.020), (-0.027, 1.557, 0.056), (0.0, 1.558, 0.082), (0.027, 1.557, 0.056), (0.030, 1.556, 0.020)],
                     [0.0095, 0.0095, 0.0085, 0.0095, 0.0095], k=0.006)
    base = ellipsoid((0.0, 1.592, -0.030), (0.036, 0.017, 0.046))           # skull base under the brain
    lower_vault = ellipsoid((0.0, 1.622, -0.038), (0.0635, 0.042, 0.074))  # the side walls carry straight down to the mastoids: pentagonal seen from behind
    parts = [vault, lower_vault, brow, glabella, face_taper, alveolus, base]
    for s in (-1, 1):
        parts.append(ellipsoid((s * 0.051, 1.605, 0.058), (0.0145, 0.0170, 0.0145)))                       # zygomatic bone (cheekbone)
        parts.append(chain([(s * 0.056, 1.603, 0.046), (s * 0.064, 1.603, 0.018), (s * 0.067, 1.606, -0.010)], [0.0052, 0.0042, 0.0050], k=0.004))  # zygomatic arch
        parts.append(capsule((s * 0.046, 1.648, 0.074), (s * 0.052, 1.616, 0.064), 0.0055))                  # lateral orbital rim
        parts.append(capsule((s * 0.058, 1.598, -0.030), (s * 0.055, 1.572, -0.026), 0.0090, 0.0045))       # mastoid process
        parts.append(ellipsoid((s * 0.013, 1.577, -0.025), (0.0065, 0.0050, 0.0110)))                        # occipital condyle
    parts.append(capsule((0.0, 1.640, 0.090), (0.0, 1.618, 0.101), 0.0050, 0.0038))                         # nasal bones
    parts.append(sphere((0.0, 1.630, -0.103), 0.0065))                                                       # external occipital protuberance
    shape = smooth_union(*parts, k=0.009)
    holes = []
    for s in (-1, 1):
        holes.append(ellipsoid((s * 0.033, 1.622, 0.078), (0.0195, 0.0175, 0.032), rot=rot_y(s * 14)))  # orbit: a deep cone opening forward
        holes.append(ellipsoid((s * 0.030, 1.622, 0.045), (0.010, 0.010, 0.020)))                        # orbital apex (optic canal region)
        holes.append(capsule((s * 0.052, 1.602, -0.020), (s * 0.085, 1.602, -0.020), 0.0045))            # external acoustic meatus
        holes.append(ellipsoid((s * 0.079, 1.645, 0.000), (0.011, 0.030, 0.040)))                        # temporal fossa
        holes.append(ellipsoid((s * 0.046, 1.590, 0.010), (0.014, 0.016, 0.022)))                        # infratemporal space behind the cheek
        holes.append(sphere((s * 0.028, 1.598, 0.090), 0.0030))                                          # infraorbital foramen
    holes.append(ellipsoid((0.0, 1.592, 0.090), (0.0115, 0.0175, 0.022)))                               # nasal aperture (pear shaped)
    holes.append(ellipsoid((0.0, 1.598, 0.050), (0.012, 0.025, 0.040)))                                 # nasal cavity behind it
    holes.append(capsule((0.0, 1.54, -0.032), (0.0, 1.590, -0.032), 0.0155))                            # foramen magnum
    return subtract(shape, *holes, k=0.002), np.array([-0.09, 1.53, -0.14]), np.array([0.09, 1.76, 0.115])

def _arch_z(x, front, back_z, half, p=1.8):
    t = np.clip(np.abs(x) / half, 0, 1)
    return front - (front - back_z) * t ** p

def _yaw(t):
    """World-to-local rotation whose local x runs along the horizontal tangent t."""
    tx, tz = t[0], t[2]; n = np.hypot(tx, tz); tx, tz = tx / n, tz / n
    return np.array([[tx, 0.0, tz], [0.0, 1.0, 0.0], [-tz, 0.0, tx]])

# the mandible's mid-surface seen from above: from the midline at the chin, round the arch to the angle and straight back along the ramus (x >= 0)
_JAW_CURVE = np.array([(0.0, 0.084), (0.010, 0.082), (0.018, 0.076), (0.024, 0.066), (0.028, 0.054), (0.030, 0.040), (0.032, 0.026),
                       (0.036, 0.012), (0.043, 0.000), (0.0490, -0.010), (0.0505, -0.022), (0.0515, -0.032)])
# its side profile, in (z of the nearest mid-surface point, height): chin -> lower border -> angle -> posterior border -> condyle ->
# mandibular notch -> coronoid process -> anterior border of the ramus -> alveolar margin (where the teeth sit) -> incisor region
_JAW_PROFILE = [(0.084, 1.507), (0.070, 1.508), (0.050, 1.511), (0.030, 1.515), (0.012, 1.519), (0.002, 1.521),   # lower border, antegonial notch
                (-0.006, 1.524), (-0.012, 1.529), (-0.016, 1.537),                                                # the angle (gonion)
                (-0.018, 1.552), (-0.019, 1.565), (-0.018, 1.582), (-0.017, 1.592),                               # posterior border up to the condylar neck
                (-0.011, 1.594), (-0.006, 1.588),                                                                 # front of the condyle
                (-0.002, 1.580), (0.004, 1.5755), (0.010, 1.5785), (0.015, 1.587),                                # mandibular notch
                (0.019, 1.600), (0.022, 1.598),                                                                   # coronoid tip
                (0.024, 1.580), (0.026, 1.562), (0.030, 1.548), (0.036, 1.541),                                   # anterior border of the ramus
                (0.050, 1.539), (0.070, 1.539), (0.084, 1.538)]                                                   # alveolar margin

def _jaw_frame(P):
    """For each point: z of its nearest point on the jaw curve (|x| folds the two halves together) and its distance from the curve, in the x-z plane."""
    q = np.stack([np.abs(P[:, 0]), P[:, 2]], 1)
    A, B = _JAW_CURVE[:-1], _JAW_CURVE[1:]
    AB = B - A
    t = np.clip(((q[:, None, :] - A[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1)
    C = A[None] + t[..., None] * AB[None]
    d = np.linalg.norm(q[:, None, :] - C, axis=-1)
    i = np.argmin(d, axis=1)
    return C[np.arange(len(P)), i, 1], d[np.arange(len(P)), i]

def mandible():
    prof = polygon2d_sdf(_JAW_PROFILE)
    def jaw(P):
        zc, dw = _jaw_frame(P)
        y = P[:, 1]
        body = np.clip((zc - 0.010) / 0.025, 0, 1)                      # 0 in the ramus, 1 in the body
        low = np.clip((1.540 - y) / 0.025, 0, 1)                         # thicker toward the lower border
        half = 0.0030 + body * (0.0018 + 0.0014 * low)                   # ramus ~6 mm, body ~10-12 mm
        r = 0.0026
        d2 = prof(np.stack([zc, y], 1)) + r
        dt = dw - half + r
        return np.linalg.norm(np.stack([np.maximum(d2, 0), np.maximum(dt, 0)], 1), axis=1) + np.minimum(np.maximum(d2, dt), 0) - r
    parts = [jaw]
    parts.append(ellipsoid((0.0, 1.513, 0.088), (0.0150, 0.0075, 0.0050)))  # mental protuberance (the chin)
    for s in (-1, 1):
        parts.append(ellipsoid((s * 0.011, 1.510, 0.086), (0.0050, 0.0050, 0.0040)))       # mental tubercles
        parts.append(ellipsoid((s * 0.0535, 1.5955, -0.0135), (0.0105, 0.0045, 0.0050)))  # condyle: wide side to side, sits in the jaw joint
        parts.append(capsule((s * 0.0505, 1.580, -0.017), (s * 0.052, 1.592, -0.0145), 0.0045))  # condylar neck
        parts.append(chain([(s * 0.034, 1.538, 0.046), (s * 0.038, 1.530, 0.026), (s * 0.044, 1.530, 0.008)], [0.0025, 0.0025, 0.0020], k=0.003))  # oblique line
    shape = smooth_union(*parts, k=0.003)
    holes = [sphere((s * 0.026, 1.524, 0.069), 0.0024) for s in (-1, 1)]       # mental foramina
    holes += [sphere((s * 0.045, 1.556, 0.002), 0.0030) for s in (-1, 1)]     # mandibular foramina on the inside of the ramus
    return subtract(shape, *holes), np.array([-0.07, 1.48, -0.035]), np.array([0.07, 1.61, 0.10])

TEETH = [  # half-width along the arch (m), crown height, kind
    (0.0043, 0.0100, "incisor"), (0.0033, 0.0090, "incisor"), (0.0039, 0.0100, "canine"), (0.0035, 0.0080, "premolar"),
    (0.0035, 0.0078, "premolar"), (0.0052, 0.0072, "molar"), (0.0048, 0.0070, "molar"), (0.0044, 0.0066, "molar")]

def teeth():
    parts = []
    for y_gum, front, back_z, half, sgn in ((1.5555, 0.083, 0.020, 0.0305, -1), (1.5405, 0.079, 0.018, 0.0300, 1)):
        xs = np.linspace(0, half, 500)
        pts = np.stack([xs, np.full_like(xs, y_gum), _arch_z(xs, front, back_z, half)], 1)
        seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))]
        pos = 0.0
        for w, h, kind in TEETH:
            c_len = pos + w
            i = min(np.searchsorted(seg, c_len), len(pts) - 1)
            c = pts[i]
            tang = pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]; tang /= np.linalg.norm(tang)
            R = _yaw(tang)
            centre = c + np.array([0.0, sgn * h * 0.42, 0.0])  # crowns stand out of the gum toward the bite
            thick = {"incisor": 0.0030, "canine": 0.0040, "premolar": 0.0046, "molar": 0.0052}[kind]
            if kind == "canine":
                shape = smooth_union(ellipsoid(centre, (w * 0.9, h * 0.5, thick), rot=R), sphere(centre + np.array([0, sgn * h * 0.45, 0]), 0.0018), k=0.002)
            elif kind == "incisor":
                shape = ellipsoid(centre, (w * 0.95, h * 0.55, thick), rot=R)
            else:
                shape = box(centre, (w * 0.92, h * 0.50, thick), rot=R, r=0.0019)
            parts.append(shape)
            parts.append((lambda f: (lambda P: f(P * np.array([-1.0, 1.0, 1.0]))))(shape))
            pos = c_len + w + 0.0002
    return union(*parts), np.array([-0.045, 1.525, 0.0]), np.array([0.045, 1.575, 0.095])
