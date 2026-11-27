"""
The rib cage: 12 pairs of ribs, the costal cartilages and the sternum.

Anatomy kept: each rib's head meets the side of its vertebral body, its tubercle meets the tip of the transverse process, it bends back at the
rib angle, sweeps round the side and down to the front; ribs 1-7 reach the sternum through their own cartilage (true ribs), 8-10 join the
cartilage above (false ribs, forming the costal margin), 11-12 end free (floating ribs). The first rib is short, broad and flat; the cage is
narrow at the top and widest around ribs 7-9. Sternum: manubrium (jugular notch at the level of T2/T3), sternal angle (rib 2, T4/T5), body,
and xiphoid process (around T10). Units: metres; y up; +z forward; +x the person's left.
"""
import numpy as np
import spine
from sdf import plate, smooth_union, subtract, sphere, capsule, ellipsoid
from mesh import tube

# rib: (half-width, drop from back to front, x at costochondral junction, z at costochondral junction)
RIB = {1: (0.050, 0.038, 0.040, 0.040), 2: (0.075, 0.060, 0.045, 0.060), 3: (0.092, 0.074, 0.055, 0.070), 4: (0.104, 0.082, 0.065, 0.078),
       5: (0.113, 0.090, 0.075, 0.082), 6: (0.120, 0.103, 0.088, 0.085), 7: (0.124, 0.111, 0.098, 0.083), 8: (0.126, 0.114, 0.108, 0.075),
       9: (0.125, 0.112, 0.115, 0.060), 10: (0.122, 0.109, 0.118, 0.040), 11: (0.112, 0.085, 0.110, 0.000), 12: (0.095, 0.060, 0.085, -0.040)}

# costal cartilage path from the costochondral junction (added automatically) to its end, for one side (x >= 0)
CART = {1: [(0.022, 1.385, 0.048)], 2: [(0.016, 1.348, 0.063)], 3: [(0.016, 1.318, 0.072)], 4: [(0.016, 1.292, 0.080)],
        5: [(0.017, 1.268, 0.086)], 6: [(0.050, 1.225, 0.093), (0.017, 1.248, 0.090)], 7: [(0.060, 1.195, 0.095), (0.016, 1.236, 0.093)],
        8: [(0.085, 1.175, 0.088), (0.068, 1.194, 0.094)], 9: [(0.100, 1.152, 0.075), (0.088, 1.173, 0.088)], 10: [(0.112, 1.132, 0.055), (0.102, 1.151, 0.073)]}

def _vert(n):
    lv = f"t{n}"
    y, z = spine.LEVELS[lv]
    p = spine.params(lv)
    return y, z, p

def rib_points(n):
    y, z, p = _vert(n)
    W, D, xcc, zf = RIB[n]
    cz = -(p["b"] + p["crz"] - 0.001)
    head = (p["a"] * 0.95, y + 0.004, z - p["b"] * 0.45)
    tub = (p["tp"] - 0.001, y + p["h"] * 0.2, z + cz - p["tp_back"] + 0.006)
    ang = (p["tp"] + 0.024 * min(1, W / 0.1), y - 0.006, z + cz - p["tp_back"] - 0.010)
    zl = (ang[2] + zf) / 2 - 0.01
    if n <= 10:
        lat = (W, y - 0.45 * D, zl)
        alat = (0.86 * W, y - 0.80 * D, zf - 0.03)
        cc = (xcc, y - D, zf)
        pts = [head, tub, ang, lat, alat, cc]
    else:
        lat = (W, y - 0.5 * D, zl)
        end = (xcc, y - D, zf)
        pts = [head, tub, ang, lat, end]
    if n == 1:  # the first rib: no rib angle to speak of, short and curved tightly
        pts = [head, tub, (p["tp"] + 0.012, y - 0.004, z + cz - p["tp_back"] - 0.004), (W, y - 0.02, -0.005), (0.048, y - 0.034, 0.030), (xcc, y - D, zf)]
    return np.array(pts)

def outward_fn(n):
    centre = np.array([0.0, 0.0, -0.005])
    def f(q):
        if n == 1:
            return np.array([0.0, 1.0, 0.0])  # rib 1 lies flat
        o = np.array([q[0] - centre[0], 0.25 * 0, q[2] - centre[2]])
        return o if np.linalg.norm(o) > 1e-6 else np.array([1.0, 0, 0])
    return f

def rib_mesh(n, side):
    pts = rib_points(n)
    k = len(pts)
    if n == 1:
        major = [0.0045, 0.0055, 0.008, 0.0095, 0.009, 0.0085][:k]
        minor = [0.0040, 0.0035, 0.0030, 0.0028, 0.0030, 0.0035][:k]
    else:
        big = 0.0068 if 3 <= n <= 9 else 0.0058
        major = [0.0048, 0.0050, big * 0.9, big, big, big * 0.95][:k]
        minor = [0.0040, 0.0034, 0.0030, 0.0027, 0.0028, 0.0034][:k]
        major[-1] = big * 0.85 if n <= 10 else 0.0035
    V, F = tube(pts, major, minor, outward_fn(n), segments=14, rings_per_seg=7)
    if side < 0:
        V = V * np.array([-1, 1, 1], np.float32)
        F = F[:, ::-1].copy()
    return V, F

def cartilage_mesh(n, side):
    if n not in CART:
        return None
    _, _, xcc, zf = RIB[n]
    y, _, _ = _vert(n)
    D = RIB[n][1]
    pts = np.array([(xcc + 0.002, y - D + 0.001, zf - 0.002)] + CART[n])
    r = 0.0050 if n <= 5 else 0.0058
    major = [r * 1.1] + [r] * (len(pts) - 1)
    minor = [r * 0.8] + [r * 0.7] * (len(pts) - 1)
    V, F = tube(pts, major, minor, lambda q: np.array([0.0, 0.0, 1.0]), segments=12, rings_per_seg=8)
    if side < 0:
        V = V * np.array([-1, 1, 1], np.float32)
        F = F[:, ::-1].copy()
    return V, F

def sternum():
    top = np.array([0.0, 1.398, 0.045])
    tip = np.array([0.0, 1.195, 0.095])
    v_axis = top - tip  # pointing up the sternum
    L = np.linalg.norm(v_axis)
    # outline in (u = across, v = along, from the tip at v=0 to the top at v=L)
    vs = lambda y: (y - tip[1]) / (top[1] - tip[1]) * L
    poly = [(-0.004, 0.0), (0.004, 0.0), (0.009, vs(1.22)), (0.012, vs(1.236)), (0.017, vs(1.27)), (0.016, vs(1.33)), (0.014, vs(1.348)),
            (0.017, vs(1.352)), (0.026, vs(1.385)), (0.024, vs(1.394)), (0.006, L - 0.002), (0.0, L - 0.006),
            (-0.006, L - 0.002), (-0.024, vs(1.394)), (-0.026, vs(1.385)), (-0.017, vs(1.352)), (-0.014, vs(1.348)), (-0.016, vs(1.33)),
            (-0.017, vs(1.27)), (-0.012, vs(1.236)), (-0.009, vs(1.22))]
    # thickness: manubrium ~12 mm, body ~10 mm, xiphoid ~4 mm (half values)
    def th(u, v):
        y = tip[1] + v / L * (top[1] - tip[1])
        return np.where(y > 1.35, 0.0060, np.where(y > 1.236, 0.0050, 0.0022))
    # gentle front curvature
    bend = lambda u, v: -0.004 * (u / 0.02) ** 2
    st = plate(tip, (1, 0, 0), v_axis, poly, th, bend=bend, round_r=0.0018)
    return st, tip - np.array([0.04, 0.02, 0.03]), top + np.array([0.04, 0.02, 0.03])
