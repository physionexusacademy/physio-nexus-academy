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
    num = blur(lum * skin, 22); den = blur(skin, 22) + 1e-4
    low = num / den
    target = float((lum * skin).sum() / skin.sum())
    gain = np.clip((target / np.maximum(low, .2)) ** .65, .85, 1.3)
    soft = blur(skin, 3)[..., None]
    return np.clip(img * (1 + (gain[..., None] - 1) * soft), 0, 1)
PHOTO = deflatten(PHOTO)
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
ph = np.stack([MID + pos[:, 0] * S, EYE_PY + (EYE_Y - pos[:, 1]) * S], 1).astype(np.float32)
col = sample(PHOTO, ph)
lo, hi = .05, .45
w = np.clip((nor[:, 2] - lo) / (hi - lo), 0, 1); w = w * w * (3 - 2 * w)
R, G, B = PHOTO[..., 0], PHOTO[..., 1], PHOTO[..., 2]
lum = .299 * R + .587 * G + .114 * B
bg = (((R - B) < .07) & (lum > .40)).astype(np.float32)            # grey/blue wall: anything bright that is not warm
bgs = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(5)), np.float32) / 255
bgv = sample(bgs[..., None].repeat(3, 2), ph)[:, 0]
w = w * (1 - np.clip(bgv * 2.0, 0, 1))
tile = np.zeros((AW, AW, 4), np.float32); tile[ys, xs, :3] = col; tile[ys, xs, 3] = w
np.save('tile-full.npy', tile)
out = Image.fromarray((np.clip(tile, 0, 1) * 255).astype(np.uint8), 'RGBA')
out.save('dr-sajjad-face.webp', quality=80, method=6, alpha_quality=80)
import os; print('face webp', os.path.getsize('dr-sajjad-face.webp') // 1024, 'KB')
