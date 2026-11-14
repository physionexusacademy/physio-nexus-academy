#!/usr/bin/env python3
"""
Designs the PNA Teacher's face: a clean, professional face painted procedurally onto the head's UV layout. No photograph is used.

Inputs : mesh.json (dump of public/virtual-patient/patient.glb, see dump-mesh.cjs in this folder: bind, uv, normal, index, boneOf)
         pna-teacher-fit.bin (the head's shape: per-vertex displacements applied to the generic CC0 head)
Outputs: pna-teacher-face.webp (2048 px face/skin tile, transparent outside the head), pna-teacher-bump.webp (fine skin relief)
Usage  : python3 design-face.py mesh.json pna-teacher-fit.bin out_dir
Everything (skin tone, eyebrows, lids and lashes, lips, nostrils, folds, a neat short beard's shadow, ears, soft shading) is a function of the
3D position of each texel on the fitted head, so it follows the surface exactly and is symmetric.
"""
import sys, json, re, struct, os
import numpy as np
from PIL import Image

mesh_path, fit_path, out_dir = sys.argv[1:4]
M = json.load(open(mesh_path))
P = np.array(M['bind']).reshape(-1, 3)
N = np.array(M['normal']).reshape(-1, 3)
UV = np.array(M['uv']).reshape(-1, 2)
T = np.array(M['index']).reshape(-1, 3)
BONE = np.array(M['boneOf'])
HEAD = np.array([bool(re.match(r'^(head|jaw|eye|special|levator|oris|temporalis|oculi|orbicularis|risorius|tongue|neck03)', b)) for b in BONE])
HT = T[HEAD[T].all(1) & (P[T][:, :, 1].min(1) > 1.5)]

# apply the head shape
raw = open(fit_path, 'rb').read()
n = struct.unpack('<I', raw[:4])[0]
idx = np.frombuffer(raw[4:4 + 2 * n], '<u2').astype(int)
dxy = np.frombuffer(raw[4 + 2 * n:4 + 2 * n + 4 * n], '<i2').reshape(-1, 2).astype(np.float64) / 1e5
FP = P.copy(); FP[idx, 0] += dxy[:, 0]; FP[idx, 1] += dxy[:, 1]

def raster(tris_xy, attrs, W, H, zs):
    K = attrs.shape[2]
    out = np.zeros((H, W, K), np.float32); zb = np.full((H, W), -1e9, np.float32); mask = np.zeros((H, W), bool)
    for t in range(len(tris_xy)):
        a, b, c = tris_xy[t]
        x0 = max(int(np.floor(min(a[0], b[0], c[0]))), 0); x1 = min(int(np.ceil(max(a[0], b[0], c[0]))) + 1, W)
        y0 = max(int(np.floor(min(a[1], b[1], c[1]))), 0); y1 = min(int(np.ceil(max(a[1], b[1], c[1]))) + 1, H)
        if x1 <= x0 or y1 <= y0: continue
        d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(d) < 1e-9: continue
        xs, ys = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
        l1 = ((b[1] - c[1]) * (xs - c[0]) + (c[0] - b[0]) * (ys - c[1])) / d
        l2 = ((c[1] - a[1]) * (xs - c[0]) + (a[0] - c[0]) * (ys - c[1])) / d
        l3 = 1 - l1 - l2
        inside = (l1 >= -1e-4) & (l2 >= -1e-4) & (l3 >= -1e-4)
        if not inside.any(): continue
        z = l1 * zs[t][0] + l2 * zs[t][1] + l3 * zs[t][2]
        sub = zb[y0:y1, x0:x1]
        win = inside & (z > sub)
        if not win.any(): continue
        sub[win] = z[win]
        val = l1[..., None] * attrs[t][0] + l2[..., None] * attrs[t][1] + l3[..., None] * attrs[t][2]
        out[y0:y1, x0:x1][win] = val[win]
        mask[y0:y1, x0:x1] |= win
    return out, mask

AW = 2048
c = UV[HT].mean(1)
isl = ((c[:, 0] >= .62) & (c[:, 1] >= .18) & (c[:, 1] < .88)) | (c[:, 0] < .6)
sel = HT[isl]
buf, mask = raster(UV[sel] * AW, np.concatenate([FP[sel], N[sel]], -1), AW, AW, FP[sel][:, :, 2])
ys, xs = np.nonzero(mask)
pos = buf[ys, xs, :3].astype(np.float64); nor = buf[ys, xs, 3:6].astype(np.float64)
nor /= np.linalg.norm(nor, axis=1, keepdims=True) + 1e-9
X, Y, Z = pos[:, 0], pos[:, 1], pos[:, 2]
AX = np.abs(X)

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def gauss(d, s): return np.exp(-0.5 * (d / s) ** 2)
def gauss2(x, y, cx, cy, sx, sy): return np.exp(-0.5 * (((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2))
def seg_dist(px, py, pts):
    """distance from points to a polyline (list of (x, y)) and the parameter t along it (0..1)"""
    best = np.full(px.shape, 1e9); tt = np.zeros(px.shape); total = 0
    lens = [np.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) for i in range(len(pts) - 1)]
    L = sum(lens); acc = 0
    for i in range(len(pts) - 1):
        ax, ay = pts[i]; bx, by = pts[i + 1]
        vx, vy = bx - ax, by - ay; l2 = vx * vx + vy * vy
        u = np.clip(((px - ax) * vx + (py - ay) * vy) / l2, 0, 1)
        d = np.hypot(px - (ax + u * vx), py - (ay + u * vy))
        better = d < best
        best = np.where(better, d, best); tt = np.where(better, (acc + u * lens[i]) / L, tt)
        acc += lens[i]
    return best, tt

rng = np.random.default_rng(7)
from PIL import ImageFilter
def noise_tex(sigma, seed):
    g = np.random.default_rng(seed).random((AW, AW)).astype(np.float32)
    im = Image.fromarray((g * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sigma))
    a = np.asarray(im, np.float32) / 255.0
    a = (a - a.mean()) / (a.std() + 1e-6)          # zero mean, unit variance
    return a
NOISE_FINE = noise_tex(0.9, 11)[ys, xs]     # pores / stubble grain (about 1 px cells)
NOISE_SOFT = noise_tex(3.0, 12)[ys, xs]     # skin colour mottling
def value_noise(x, y, z, cell):
    """smooth 3D value noise (cheap): sum of sines with random phases, good enough for skin variation"""
    return 0.5 + 0.5 * (np.sin(x / cell * 1.7 + 1.3) * np.sin(y / cell * 2.1 + 0.4) + np.sin(z / cell * 1.3 + 2.2) * np.sin((x + y) / cell * 1.1)) / 2

front = smooth(0.0, 0.35, nor[:, 2]) * smooth(0.03, 0.08, Z)

# ---------------- skin tone ----------------
SKIN = np.array([0xc0, 0x8b, 0x72]) / 255.0
col = np.tile(SKIN, (len(X), 1))
def tint(w, mul): 
    global col
    col = col * (1 + w[:, None] * (np.array(mul) - 1))
tint(smooth(1.655, 1.705, Y) * front * 0.7, [1.03, 1.03, 1.03])                           # forehead a touch lighter
tint(gauss2(AX, Y, 0.050, 1.610, 0.022, 0.018) * front, [1.045, 0.985, 0.97])           # warm cheeks
tint(gauss2(X, Y, 0.0, 1.598, 0.0085, 0.0075) * front, [1.04, 0.97, 0.96])               # nose tip
tint(gauss2(AX, Y, 0.0315, 1.623, 0.020, 0.0065) * front, [0.985, 0.985, 0.99])          # under-eye, cool and subtle
tint(smooth(0.067, 0.075, AX) * smooth(1.562, 1.572, Y) * (1 - smooth(1.668, 1.68, Y)), [1.03, 0.95, 0.94])   # ears warmer
tint(gauss2(X, Y, 0, 1.4, 0.2, 0.06) * 0 + smooth(1.52, 1.47, Y) * 0.6, [0.96, 0.96, 0.97])                 # neck, a little cooler

col = col * (1 + 0.012 * NOISE_SOFT)[:, None]

# ---------------- shading (multiplicative darkening) ----------------
shade = np.zeros(len(X))
def dark(w, amount): 
    global shade
    shade = 1 - (1 - shade) * (1 - np.clip(w, 0, 1) * amount)
eye_c = (0.0315, 1.6343)
dark(gauss2(AX, Y, 0.0325, 1.642, 0.021, 0.0100) * front, 0.025)                            # eye socket
d_crease, _ = seg_dist(AX, Y, [(0.0125, 1.6430), (0.0235, 1.6465), (0.036, 1.6470), (0.049, 1.6420)])
dark(gauss(d_crease, 0.0012) * front * smooth(0.0095, 0.014, AX) * (1 - smooth(0.049, 0.054, AX)), 0.13)    # upper-lid crease
d_nl, t_nl = seg_dist(AX, Y, [(0.0245, 1.5975), (0.0292, 1.5855), (0.0335, 1.5735), (0.0345, 1.5640)])
dark(gauss(d_nl, 0.0024) * front * (smooth(0.0, 0.2, t_nl) * (1 - smooth(0.65, 1.0, t_nl))), 0.05)           # nasolabial folds
dark(gauss2(AX, Y, 0.0175, 1.616, 0.0055, 0.012) * front, 0.05)                              # beside the nose bridge
dark(gauss2(X, Y, 0, 1.5815, 0.010, 0.0042) * front, 0.045)                                   # philtrum
dark(gauss2(X, Y, 0, 1.5575, 0.012, 0.0030) * front, 0.06)                                   # fold under the lower lip
dark(smooth(0.05, 0.55, -nor[:, 1]), 0.18)                                                   # under the chin and jaw
dark(smooth(1.50, 1.455, Y) * 0.5, 0.10)
dark(gauss2(AX, Y, 0.0625, 1.672, 0.012, 0.022) * (1 - front * 0.4), 0.05)                   # temples
col = col * (1 - shade)[:, None]
col = col * (1 + shade[:, None] * np.array([0.04, -0.01, -0.02]))                            # shadows lean slightly warm

# ---------------- eyebrows ----------------
def brow(side):
    s = side
    pts = [(s * 0.0125, 1.6495), (s * 0.0205, 1.6540), (s * 0.0300, 1.6585), (s * 0.0395, 1.6590), (s * 0.0480, 1.6560), (s * 0.0560, 1.6495)]
    return pts
for s in (-1, 1):
    pts = brow(s)
    d, t = seg_dist(X, Y, pts)
    half = 0.0036 * (0.72 + 0.35 * np.sin(np.pi * np.clip(t * 0.9 + 0.08, 0, 1))) * (1 - 0.62 * t ** 2.2)
    edge = 1 - smooth(half * 0.62, half * 1.15, d)
    hair = 0.82 + 0.18 * np.sin((X * 900 + Y * 520) + np.sin(Y * 1300) * 1.5) * np.sin(Z * 700 + 1.0)
    a = np.clip(edge * hair * 0.80, 0, 0.86) * front * (np.sign(X) == s)
    brow_col = np.array([0x2a, 0x1c, 0x15]) / 255.0
    col = col * (1 - a[:, None]) + brow_col * a[:, None]

# ---------------- eyes: lid line and lashes ----------------
for s in (-1, 1):
    ex, ey, ea, eb = s * 0.0320, 1.6343, 0.0168, 0.0056
    rr = np.hypot((X - ex) / ea, (Y - ey) / eb)
    band = smooth(0.82, 1.0, rr) * (1 - smooth(1.10, 1.45, rr))
    upper = (Y >= ey).astype(np.float64)
    thick = band * (0.62 * upper + 0.09 * (1 - upper))
    near = (np.abs(X - ex) < 0.025) & (np.abs(Y - ey) < 0.014) & (Z > 0.07)
    f = 1 - thick * near
    lash = np.array([0.05, 0.035, 0.03])
    col = col * f[:, None] + lash * (1 - f[:, None])

# ---------------- nose ----------------
for s in (-1, 1):
    a = gauss2(X, Y, s * 0.0108, 1.5935, 0.0042, 0.0020) * front * (np.sign(X) == s)
    col = col * (1 - a[:, None] * 0.78) + np.array([0.12, 0.055, 0.05]) * (a[:, None] * 0.78)
    r = np.hypot((X - s * 0.0218) / 0.0072, (Y - 1.5990) / 0.0072)
    ala = gauss(r - 1.0, 0.22) * front * (np.sign(X) == s) * (AX > 0.0195)
    col = col * (1 - ala[:, None] * 0.08)

# ---------------- lips ----------------
def mouth_line(x): return 1.5717 + 0.00045 * (1 - (x / 0.0295) ** 2) - 0.0008 * smooth(0.020, 0.0295, np.abs(x))
upper_top = 1.5802 + 0.0013 * np.exp(-((AX - 0.0048) / 0.0030) ** 2) - 0.0006 * np.exp(-(X / 0.0018) ** 2) - 0.0050 * smooth(0.010, 0.0285, AX)
lower_bot = 1.5628 + 0.0036 * smooth(0.0, 0.0265, AX) ** 1.4
ml = mouth_line(X)
in_x = 1 - smooth(0.0275, 0.0300, AX)
up_m = smooth(ml - 0.0003, ml + 0.0003, Y) * (1 - smooth(upper_top - 0.0004, upper_top + 0.0002, Y)) * in_x * front
lo_m = (1 - smooth(ml - 0.0003, ml + 0.0003, Y)) * smooth(lower_bot - 0.0002, lower_bot + 0.0005, Y) * in_x * front
verm_up = np.array([0.58, 0.29, 0.26]); verm_lo = np.array([0.64, 0.33, 0.29])
col = col * (1 - up_m[:, None] * 0.74) + verm_up * (up_m[:, None] * 0.74)
col = col * (1 - lo_m[:, None] * 0.74) + verm_lo * (lo_m[:, None] * 0.74)
col = col * (1 + (gauss2(X, Y, 0, 1.5655, 0.010, 0.0022) * front * 0.10)[:, None])           # soft highlight on the lower lip
line = gauss(Y - ml, 0.00065) * in_x * front * (1 - 0.5 * smooth(0.020, 0.0292, AX))
col = col * (1 - (line * 0.55)[:, None]) + np.array([0.20, 0.09, 0.08]) * (line * 0.55)[:, None]

# ---------------- neat short beard ----------------
# Defined in the fitted head's own coordinates (no 3D layer is needed: BEARD_VOLUME is off in src/lib/avatar/dress.ts), around the real lips.
top = np.interp(AX, [0.0, 0.020, 0.032, 0.046, 0.060, 0.0735], [1.5895, 1.5900, 1.5985, 1.6150, 1.6340, 1.6600]) + 0.0025 * NOISE_SOFT   # cheek line: from beside the nose up to the sideburn, slightly irregular
bottom = 1.508 + 0.012 * smooth(0.0, 0.065, AX)                                           # under the chin
f_cheek = np.minimum.reduce([top - Y, Y - bottom, (0.0745 - AX) * 1.4])
lips_r = np.hypot(X / 0.0345, (Y - 1.5717) / 0.0125)
clear_lips = smooth(1.0, 1.55, lips_r)                                                    # shaved around the lips
moustache_band = smooth(1.5775, 1.5815, Y) * (1 - smooth(1.5885, 1.5925, Y)) * (1 - smooth(0.020, 0.028, AX))
beard_zone = np.clip(smooth(-0.002, 0.012, f_cheek), 0, 1) * clear_lips
beard_zone = np.maximum(beard_zone, moustache_band * 0.85 * clear_lips)
beard_zone = np.maximum(beard_zone, smooth(0.052, 0.066, AX) * smooth(1.6, 1.64, Y) * (1 - smooth(1.665, 1.69, Y)) * smooth(0.0, 0.3, nor[:, 2] + 0.2))
# a 'short-boxed' stubble: dense at the chin and jaw, lighter on the cheek
density = beard_zone * (0.88 - 0.22 * smooth(1.555, 1.585, Y))
dens = density * front
grain = np.clip(0.5 + 0.35 * NOISE_FINE, 0, 1)
a = np.clip(dens * (0.50 + 0.36 * grain), 0, 0.70)
hair_col = np.array([0x25, 0x1a, 0x15]) / 255.0
col = col * (1 - a[:, None]) + hair_col * a[:, None]
line = gauss(Y - ml, 0.00065) * in_x * front * (1 - 0.5 * smooth(0.020, 0.0292, AX))   # (kept for the relief map below)

col = np.clip(col * 0.955, 0, 1)
alpha = smooth(1.455, 1.49, Y)
tile = np.zeros((AW, AW, 4), np.float32); tile[ys, xs, :3] = col; tile[ys, xs, 3] = alpha
os.makedirs(out_dir, exist_ok=True)
Image.fromarray((np.clip(tile, 0, 1) * 255).astype(np.uint8), 'RGBA').save(os.path.join(out_dir, 'pna-teacher-face.webp'), quality=82, method=6, alpha_quality=80)

# ---------------- relief: pores, fine creases, stubble ----------------
b = 0.11 * NOISE_FINE + 0.0                                                                 # pores (random, so it cannot produce moire)
for yy in (1.678, 1.690, 1.702):                                                           # faint forehead lines
    b -= gauss(Y - yy - 0.0012 * np.sin(X * 90), 0.0010) * smooth(0.0, 0.01, 0.05 - AX) * front * 0.14
b -= gauss(d_nl, 0.0016) * front * 0.35                                                     # folds
b -= gauss(d_crease, 0.0010) * front * 0.35
b += dens * (0.25 + 0.30 * NOISE_FINE)                                                      # stubble
b -= line * 0.6
relief = 0.5 + np.clip(b, -0.5, 0.5) * 0.9
bump = np.full((AW, AW), 0.5, np.float32); bump[ys, xs] = relief
Image.fromarray((np.clip(bump, 0, 1) * 255).astype(np.uint8)).save(os.path.join(out_dir, 'pna-teacher-bump.webp'), quality=70, method=6)
print('face', os.path.getsize(os.path.join(out_dir, 'pna-teacher-face.webp')) // 1024, 'KB; bump', os.path.getsize(os.path.join(out_dir, 'pna-teacher-bump.webp')) // 1024, 'KB')
