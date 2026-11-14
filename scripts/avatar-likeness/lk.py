import json, re, numpy as np
from PIL import Image, ImageDraw
M = json.load(open('/tmp/claude-0/-home-user-physio-nexus-academy/3be6476f-f2c6-5843-9f8c-dfcb80ce497a/scratchpad/likeness/mesh.json'))
P = np.array(M['bind']).reshape(-1, 3)
N = np.array(M['normal']).reshape(-1, 3)
UV = np.array(M['uv']).reshape(-1, 2)
T = np.array(M['index']).reshape(-1, 3)
BONE = np.array(M['boneOf'])
HEAD_RE = r'^(head|jaw|eye|special|levator|oris|temporalis|oculi|orbicularis|risorius|tongue|neck03)'
HEAD = np.array([bool(re.match(HEAD_RE, b)) for b in BONE])
# head triangles: all three vertices on the head chain AND above the shoulders
HT = T[HEAD[T].all(1) & (P[T][:, :, 1].min(1) > 1.5)]

def raster(tris_xy, attrs, W, H, zs):
    """Z-buffered triangle rasteriser. tris_xy (n,3,2) pixel coords; attrs (n,3,K); zs (n,3) depth (bigger = nearer). Returns (H,W,K) and mask."""
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
