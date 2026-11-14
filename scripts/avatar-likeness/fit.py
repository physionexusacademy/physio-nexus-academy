"""Fit the shared MakeHuman head to the reference photograph (front plane), then bake the photo onto it.
Inputs : mesh.json (dump of patient.glb), the reference photo.  Outputs: dr-sajjad-fit.bin (vertex displacements), dr-sajjad-face.webp (face texture).
All measured photo coordinates are pixels of the 1121x1403 reference image."""
import sys, json, struct
sys.path.insert(0, '.')
from lk import *
from PIL import Image, ImageFilter

MID, S, EYE_Y, EYE_PY = 527.0, 1887.0, 1.6345, 408.5     # photo midline x, px per metre, eye line (m) / (px)
def fit_xy(px, py): return ((px - MID) / S, EYE_Y - (py - EYE_PY) / S)

# (name, mesh x (left side, +), mesh y, photo right-side (px,py), photo left-side (px,py))
SYM = [
 ('iris',        .0310, 1.6340, (465,408), (583,407)),
 ('outer corner',.0430, 1.6340, (436,409), (618,411)),
 ('inner corner',.0194, 1.6340, (497,410), (548,406)),
 ('upper lid',   .0310, 1.6366, (465,399), (583,398)),
 ('lower lid',   .0310, 1.6306, (465,419), (583,418)),
 ('ala',         .0190, 1.5970, (488,478), (572,478)),
 ('mouth corner',.0230, 1.5630, (478,527), (588,526)),
 ('jaw',         .0560, 1.5500, (408,552), (644,548)),
 ('cheek',       .0710, 1.6550, (396,385), (655,382)),
 ('ear mid',     .0780, 1.6130, (369,458), (655,452)),
 ('ear top',     .0800, 1.6390, (368,418), (655,412)),
 ('ear bottom',  .0740, 1.5870, (372,505), (652,498)),
]
CENTRE = [('nose base',1.5910,484), ('mouth line',1.5640,527), ('upper lip',1.5700,510), ('lower lip',1.5530,543), ('chin',1.5130,622), ('hairline',1.7000,262)]
pairs = []
for name, mx, my, r, l in SYM:
    off = ((MID - r[0]) + (l[0] - MID)) / 2; py = (r[1] + l[1]) / 2
    pairs += [((-mx, my), fit_xy(MID - off, py)), ((mx, my), fit_xy(MID + off, py))]
for name, my, py in CENTRE: pairs.append(((0.0, my), fit_xy(MID, py)))
for x in (-.15, -.1, .1, .15):
    for y in (1.45, 1.55, 1.65, 1.75): pairs.append(((x, y), (x, y)))
for p in ((0, 1.80), (0, 1.42), (-.06, 1.46), (.06, 1.46), (0, 1.46), (-.1, 1.5), (.1, 1.5), (-.04, 1.48), (.04, 1.48)): pairs.append((p, p))
src = np.array([a for a, _ in pairs], np.float64); dst = np.array([b for _, b in pairs], np.float64)

def tps_fit(src, dst, reg=2e-6):
    n = len(src); d = np.linalg.norm(src[:, None] - src[None], axis=2)
    K = np.where(d > 0, d ** 2 * np.log(d + 1e-12), 0)
    A = np.zeros((n + 3, n + 3)); A[:n, :n] = K + reg * np.eye(n); A[:n, n] = 1; A[:n, n + 1:] = src; A[n, :n] = 1; A[n + 1:, :n] = src.T
    b = np.zeros((n + 3, 2)); b[:n] = dst
    return np.linalg.solve(A, b)
def tps_apply(coef, src, pts):
    d = np.linalg.norm(pts[:, None] - src[None], axis=2); U = np.where(d > 0, d ** 2 * np.log(d + 1e-12), 0); n = len(src)
    return U @ coef[:n] + coef[n] + pts @ coef[n + 1:]
coef = tps_fit(src, dst)

# ---- displacements for every vertex above the neck ------------------------------------------------------------
sel = np.nonzero(P[:, 1] > 1.46)[0]
newxy = tps_apply(coef, src, P[sel, :2].astype(np.float64))
delta = newxy - P[sel, :2]
keep = np.hypot(delta[:, 0], delta[:, 1]) > 2e-5
idx = sel[keep]; dxy = delta[keep]
print('vertices moved', len(idx), 'max |d| mm', (np.hypot(dxy[:, 0], dxy[:, 1]).max() * 1000).round(1), 'mean mm', (np.hypot(dxy[:, 0], dxy[:, 1]).mean() * 1000).round(2))
FP = P.copy(); FP[idx, 0] += dxy[:, 0]; FP[idx, 1] += dxy[:, 1]
np.save('fitted.npy', FP)
q = np.round(dxy * 1e5).astype(np.int16)         # 0.01 mm units
with open('fit.bin', 'wb') as f:
    f.write(struct.pack('<I', len(idx))); f.write(idx.astype('<u2').tobytes()); f.write(q.astype('<i2').tobytes())
print('fit.bin', 4 + len(idx) * 6, 'bytes')

# ---- bake the photo (eyes removed) on the fitted mesh --------------------------------------------------------
PHOTO = np.asarray(Image.open('photo-noeyes.png').convert('RGB'), np.float32) / 255
PH, PW = PHOTO.shape[:2]
# De-light: the photo is lit from one side and has deep eye-socket shadows; the scene adds its own light. Flatten the slow luminance
# variation on skin (not on beard, hair or brows) so the baked face keeps its features but not its shadows.
def deflatten(img):
    R, G, B = img[..., 0], img[..., 1], img[..., 2]
    lum = .299 * R + .587 * G + .114 * B
    skin = ((lum > .38) & ((R - B) > .09)).astype(np.float32)
    blur = lambda a, r: np.asarray(Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255
    num = blur(lum * skin, 14); den = blur(skin, 14) + 1e-4
    low = num / den
    target = float((lum * skin).sum() / skin.sum())
    gain = np.clip((target / np.maximum(low, .2)) ** .9, .8, 1.4)
    soft = blur(skin, 3)[..., None]
    return np.clip(img * (1 + (gain[..., None] - 1) * soft), 0, 1)
PHOTO = deflatten(PHOTO)
# The blur source must not contain the photo's backlit ears (orange) or the wall: extrude the face-edge columns outward over them first.
NOEAR = PHOTO.copy()
for y0_, y1_ in ((395, 530),):
    for x_edge, xs_ in ((396, range(340, 396)), (644, range(645, 700))):
        for xx_ in xs_:
            NOEAR[y0_:y1_, xx_] = PHOTO[y0_:y1_, x_edge]
PHOTO_BLUR = np.asarray(Image.fromarray((np.clip(NOEAR, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14)), np.float32) / 255
def sample(img, xy):
    x = np.clip(xy[:, 0], 0, PW - 1.001); y = np.clip(xy[:, 1], 0, PH - 1.001)
    x0 = x.astype(int); y0 = y.astype(int); fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
    return img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy) + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy
AW = 2048
c = UV[HT].mean(1)
isl = ((c[:, 0] >= .62) & (c[:, 1] >= .18) & (c[:, 1] < .88)) | (c[:, 0] < .6)
sel_t = HT[isl]
Ut = UV[sel_t] * AW
attrs = np.concatenate([FP[sel_t], N[sel_t]], -1)
buf, mask = raster(Ut, attrs, AW, AW, FP[sel_t][:, :, 2])
ys, xs = np.nonzero(mask)
pos = buf[ys, xs, :3]; nor = buf[ys, xs, 3:6]; nor /= np.linalg.norm(nor, axis=1, keepdims=True) + 1e-9
# The photo is a frontal projection. Beyond the face outline the outline's own colours are carried sideways (blurred, so there are no streaks):
# skin on the cheek, short dark hair at the temple, the beard up to the ear. The texture then covers the whole front half of the head and
# only fades out behind the ear, so there is no visible edge in front of it.
OUT_Y = [1.45, 1.50, 1.55, 1.60, 1.655, 1.70, 1.75, 1.80]
OUT_X = [0.047, 0.053, 0.064, 0.074, 0.075, 0.071, 0.057, 0.032]
def smooth(a, b, x):
    t_ = np.clip((x - a) / (b - a), 0, 1); return t_ * t_ * (3 - 2 * t_)
outline = np.interp(pos[:, 1], OUT_Y, OUT_X)
ax = np.abs(pos[:, 0])
sx = np.sign(pos[:, 0]) * np.minimum(ax, outline * 0.97)
ph = np.stack([MID + sx * S, EYE_PY + (EYE_Y - pos[:, 1]) * S], 1).astype(np.float32)
col_sharp = sample(PHOTO, ph); col_blur = sample(PHOTO_BLUR, ph)
bl = smooth(outline * 0.9, outline * 1.1, ax)[:, None]
col = col_sharp * (1 - bl) + col_blur * bl
conf_geo = (ax < outline * 0.97).astype(np.float32) * smooth(0.05, 0.45, nor[:, 2])     # where the photograph really shows the surface
w = conf_geo
R, G, B = PHOTO[..., 0], PHOTO[..., 1], PHOTO[..., 2]
lum = .299 * R + .587 * G + .114 * B
bg = (((R - B) < .07) & (lum > .40)).astype(np.float32)            # grey/blue wall: anything bright that is not warm
bgs = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(5)), np.float32) / 255
bgv = sample(bgs[..., None].repeat(3, 2), ph)[:, 0]
w = w * (1 - np.clip(bgv * 2.0, 0, 1))
conf = w.copy()

# Spread the photographic colour over the rest of the head in 3D: every texel outside the photographed area takes the (blurred) colour of its
# neighbours on the head and fades gradually into the base skin, so there is no edge where the picture ends.
VOX = 0.004
lo3 = np.array([-0.13, 1.38, -0.09]); hi3 = np.array([0.13, 1.82, 0.22])
dims = np.ceil((hi3 - lo3) / VOX).astype(int)
def to_cell(p):
    c = np.floor((p - lo3) / VOX).astype(int)
    return np.clip(c, 0, dims - 1)
cell = to_cell(pos)
flat = (cell[:, 0] * dims[1] + cell[:, 1]) * dims[2] + cell[:, 2]
G = np.zeros((int(np.prod(dims)), 4), np.float32)
good = conf > .5
np.add.at(G, flat[good], np.concatenate([col[good] * conf[good, None], conf[good, None]], 1))
G = G.reshape(*dims, 4)
def box(a, axis, r):
    c = np.cumsum(np.pad(a, [(r + 1, r) if i == axis else (0, 0) for i in range(a.ndim)]), axis=axis)
    n = a.shape[axis]
    hi_ = np.take(c, range(2 * r + 1, 2 * r + 1 + n), axis=axis); lo_ = np.take(c, range(0, n), axis=axis)
    return (hi_ - lo_) / (2 * r + 1)
for _ in range(5):
    for ax_ in range(3): G = box(G, ax_, 3)
# trilinear lookup (no blocky cells)
fp = (pos - lo3) / VOX - 0.5
i0 = np.clip(np.floor(fp).astype(int), 0, dims - 2); fr = np.clip(fp - i0, 0, 1)
Gf = np.zeros((len(pos), 4), np.float32)
for dx_ in (0, 1):
    for dy_ in (0, 1):
        for dz_ in (0, 1):
            wgt = (fr[:, 0] if dx_ else 1 - fr[:, 0]) * (fr[:, 1] if dy_ else 1 - fr[:, 1]) * (fr[:, 2] if dz_ else 1 - fr[:, 2])
            Gf += G[i0[:, 0] + dx_, i0[:, 1] + dy_, i0[:, 2] + dz_] * wgt[:, None]
mass = Gf[:, 3]
ext_col = Gf[:, :3] / np.maximum(mass[:, None], 1e-6)
ext_a = smooth(0.0002, 0.012, mass)                       # fades with distance from the photographed area
inside = (conf > .5)
col = np.where(inside[:, None], col, ext_col)
w = np.where(inside, conf, np.maximum(conf, ext_a))
# Far from the photographed area (the sides and back of the head) there is no photograph: use the face's own skin tone, and dark hair above the
# temples, so the original painted texture never shows. Only the very back of the head keeps the base texture (it is under the hair).
far = 1 - smooth(1e-4, 4e-3, mass)
face_skin = col[(conf > .8) & (pos[:, 1] > 1.55) & (pos[:, 1] < 1.66) & (np.abs(pos[:, 0]) < .05) & (((col[:, 0] - col[:, 2]) > .10))]
face_skin = face_skin.mean(0) if len(face_skin) else np.array([.8, .6, .5])
hair_dark = np.array([.11, .08, .075])
hair_wt = np.clip(smooth(1.655, 1.70, pos[:, 1]) * smooth(0.055, 0.075, ax) + smooth(1.69, 1.72, pos[:, 1]), 0, 1)
def desat(c, k):
    l = (c * np.array([.299, .587, .114])).sum(-1, keepdims=True)
    return l + (c - l) * k
skin_soft = face_skin * 1.0                # the sides of a face are less saturated than the cheeks that took the light
far_col = skin_soft * (1 - hair_wt[:, None]) + hair_dark * hair_wt[:, None]
col = np.where(inside[:, None], col, col * (1 - far[:, None]) + far_col * far[:, None])
w = np.where(inside, conf, np.maximum(w, smooth(-0.07, -0.025, pos[:, 2])))
# Ears: an explicit skin tone (a touch warmer than the cheek), not whatever the diffusion finds on their back and inner surfaces.
face_ref = col[(conf > .8) & (pos[:, 1] > 1.55) & (pos[:, 1] < 1.66) & (np.abs(pos[:, 0]) < .05) & (((col[:, 0] - col[:, 2]) > .10))]
face_ref = face_ref.mean(0) if len(face_ref) else np.array([.8, .6, .5])
ear_w = smooth(.064, .070, ax) * smooth(1.560, 1.572, pos[:, 1]) * (1 - smooth(1.668, 1.680, pos[:, 1])) * (1 - smooth(0.080, 0.092, pos[:, 2])) * smooth(-0.05, -0.02, pos[:, 2])
ear_col = np.clip(face_ref * np.array([1.02, 1.0, 0.99]), 0, 1)
col = col * (1 - ear_w[:, None]) + ear_col * ear_w[:, None]
w = np.maximum(w, ear_w)
# Colour harmony: the photo's neck (shadowed under the beard) and ears (backlit, red) are matched to the face's skin tone, and the tile fades out
# at the bottom of the neck so the body's own skin (same tone) takes over without a seam.
lum_c = .299 * col[:, 0] + .587 * col[:, 1] + .114 * col[:, 2]
is_skin = ((col[:, 0] - col[:, 2]) > .10) & (lum_c > .45)
face_zone = (pos[:, 1] > 1.545) & (np.abs(pos[:, 0]) < .062) & is_skin & (w > .8)
face_mean = col[face_zone].mean(0)
neck_zone = (pos[:, 1] > 1.47) & (pos[:, 1] < 1.51) & (np.abs(pos[:, 0]) < .05) & (lum_c > .3)
if neck_zone.sum() > 200:
    neck_mean = col[neck_zone].mean(0)
    gain = np.clip(face_mean / np.maximum(neck_mean, 1e-3), .9, 1.8)
    wn = smooth(1.525, 1.505, pos[:, 1])                   # 1 under the chin line, 0 above
    col = np.clip(col * (1 + (gain - 1) * wn[:, None]), 0, 1)
    print('neck mean', (neck_mean * 255).round(0), '-> face mean', (face_mean * 255).round(0), 'gain', gain.round(2))
ear_zone = (np.abs(pos[:, 0]) > .066) & (pos[:, 1] > 1.57) & (pos[:, 1] < 1.66)
if ear_zone.sum() > 200:
    ear_mean = col[ear_zone].mean(0)
    gain_e = np.clip(face_mean / np.maximum(ear_mean, 1e-3), .7, 1.4)
    col[ear_zone] = np.clip(col[ear_zone] * (1 + (gain_e - 1) * .85), 0, 1)
# calm any remaining red patches (the photo's backlit ears bleed onto the temples at grazing angles)
rg = col[:, 0] - col[:, 1]
excess = np.maximum(0, rg - 0.24) * (lum_c > .3)
col[:, 0] = np.clip(col[:, 0] - excess * .85, 0, 1)
w = w * smooth(1.455, 1.49, pos[:, 1])
# Lid line and lashes: a dark band just outside each eye opening (strong along the upper lid, faint along the lower), so the eye has an edge.
def smooth_(a, b, x):
    t_ = np.clip((x - a) / (b - a), 0, 1); return t_ * t_ * (3 - 2 * t_)
for sgn in (-1, 1):
    ex, ey, ea, eb = sgn * 0.0320, 1.6343, 0.0168, 0.0056
    rr = np.hypot((pos[:, 0] - ex) / ea, (pos[:, 1] - ey) / eb)
    band = smooth_(0.82, 1.0, rr) * (1 - smooth_(1.10, 1.45, rr))
    upper = (pos[:, 1] >= ey).astype(np.float32)
    thick = band * (0.62 * upper + 0.22 * (1 - upper))
    near = (np.abs(pos[:, 0] - ex) < 0.025) & (np.abs(pos[:, 1] - ey) < 0.014) & (pos[:, 2] > 0.07)
    f = 1 - thick * near
    col = col * f[:, None] + np.array([.05, .035, .03]) * (1 - f[:, None])
tile = np.zeros((AW, AW, 4), np.float32); tile[ys, xs, :3] = col; tile[ys, xs, 3] = w
print('face skin albedo (255) =', (face_mean * 255).round(0), '#%02x%02x%02x' % tuple(int(round(v * 255)) for v in face_mean))
np.save('tile-full.npy', tile)
out = Image.fromarray((np.clip(tile, 0, 1) * 255).astype(np.uint8), 'RGBA')
out.save('dr-sajjad-face.webp', quality=80, method=6, alpha_quality=80)
import os; print('face webp', os.path.getsize('dr-sajjad-face.webp') // 1024, 'KB')

# ---- relief map: the photo's fine detail (pores, creases, stubble) as a grey bump map in the same layout ------------------
lumT = .299 * tile[..., 0] + .587 * tile[..., 1] + .114 * tile[..., 2]
img = Image.fromarray((np.clip(lumT, 0, 1) * 255).astype(np.uint8))
low = np.asarray(img.filter(ImageFilter.GaussianBlur(2.5)), np.float32) / 255
hi = (lumT - low)
bump = np.clip(0.5 + hi * 3.0, 0, 1) * (tile[..., 3] > .02) + 0.5 * (tile[..., 3] <= .02)
bump = 0.5 + (bump - 0.5) * np.clip(tile[..., 3], 0, 1)                      # flat where there is no photograph
Image.fromarray((bump * 255).astype(np.uint8)).save('dr-sajjad-bump.webp', quality=78, method=6)
print('bump webp', os.path.getsize('dr-sajjad-bump.webp') // 1024, 'KB')
