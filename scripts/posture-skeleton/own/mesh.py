"""Turn an SDF into a triangle mesh (marching cubes), smooth it a little, and reduce it to a triangle budget."""
import numpy as np
from skimage.measure import marching_cubes
import fast_simplification

def sdf_to_mesh(f, lo, hi, step=0.001, target=None, smooth=2):
    lo, hi = np.asarray(lo, float), np.asarray(hi, float)
    n = np.ceil((hi - lo) / step).astype(int) + 1
    xs = [lo[i] + np.arange(n[i]) * step for i in range(3)]
    vol = np.empty(tuple(n), dtype=np.float32)
    # evaluate slab by slab to keep memory small
    X, Z = np.meshgrid(xs[0], xs[2], indexing="ij")
    for j, y in enumerate(xs[1]):
        P = np.stack([X.ravel(), np.full(X.size, y), Z.ravel()], 1)
        vol[:, j, :] = f(P).reshape(X.shape)
    if vol.min() > 0 or vol.max() < 0:
        raise ValueError("shape does not cross its bounding box surface")
    # make sure the surface is closed at the box edges
    vol[0, :, :] = vol[-1, :, :] = vol[:, 0, :] = vol[:, -1, :] = vol[:, :, 0] = vol[:, :, -1] = np.maximum(vol[0, 0, 0], step)
    verts, faces, _, _ = marching_cubes(vol, 0.0, spacing=(step, step, step))
    verts = verts + lo
    # marching_cubes already winds the faces outward (counter-clockwise seen from outside) for this volume layout
    for _ in range(smooth):
        verts = laplacian(verts, faces, 0.5)
    if target and len(faces) > target:
        verts, faces = fast_simplification.simplify(verts.astype(np.float32), faces.astype(np.int32), target_reduction=1 - target / len(faces))
    verts, faces = np.asarray(verts, np.float32), np.asarray(faces, np.uint32)
    global LAST_AO
    LAST_AO = (len(verts), sdf_ao(f, verts, faces))
    return verts, faces

LAST_AO = None

def vertex_normals(V, F):
    n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    N = np.zeros_like(V, dtype=np.float64)
    for k in range(3):
        np.add.at(N, F[:, k], n)
    return N / np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)

def sdf_ao(f, V, F, dists=(0.0015, 0.003, 0.006, 0.012, 0.020)):
    """Ambient occlusion from the distance field: how much bone crowds each vertex along its normal (0 = dark, 1 = open).
    Baked into vertex colours so holes such as the orbits, the nasal aperture and the foramina read as holes."""
    V = V.astype(np.float64); N = vertex_normals(V, F)
    occ = np.zeros(len(V)); w = 1.0
    for d in dists:
        occ += w * np.clip(d - f(V + N * d), 0, None) / d
        w *= 0.6
    return np.clip(1.0 - 0.75 * occ, 0.25, 1.0).astype(np.float32)

def laplacian(V, F, lam):
    n = len(V)
    acc = np.zeros_like(V); cnt = np.zeros(n)
    for a, b in ((0, 1), (1, 2), (2, 0)):
        np.add.at(acc, F[:, a], V[F[:, b]]); np.add.at(cnt, F[:, a], 1)
        np.add.at(acc, F[:, b], V[F[:, a]]); np.add.at(cnt, F[:, b], 1)
    avg = acc / np.maximum(cnt, 1)[:, None]
    return V + lam * (avg - V)

def tube(points, radii_major, radii_minor, outward, segments=14, rings_per_seg=6):
    """A tube with an elliptical cross-section along a Catmull-Rom curve through `points`.
    The major axis lies along (tangent x outward); the minor along `outward` (for ribs and the clavicle)."""
    P = np.asarray(points, float)
    # Catmull-Rom sampling
    pts, ra, rb = [], [], []
    ext = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]])
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for s in np.linspace(0, 1, rings_per_seg, endpoint=False):
            s2, s3 = s * s, s * s * s
            pts.append(0.5 * ((2 * p1) + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s2 + (-p0 + 3 * p1 - 3 * p2 + p3) * s3))
            ra.append(radii_major[i - 1] + (radii_major[i] - radii_major[i - 1]) * s)
            rb.append(radii_minor[i - 1] + (radii_minor[i] - radii_minor[i - 1]) * s)
    pts.append(P[-1]); ra.append(radii_major[-1]); rb.append(radii_minor[-1])
    pts = np.array(pts)
    V, F = [], []
    m = len(pts)
    for i in range(m):
        t = pts[min(i + 1, m - 1)] - pts[max(i - 1, 0)]; t /= np.linalg.norm(t)
        o = np.asarray(outward(pts[i]), float); o = o - (o @ t) * t; o /= np.linalg.norm(o)
        b = np.cross(t, o)
        for k in range(segments):
            a = 2 * np.pi * k / segments
            V.append(pts[i] + np.cos(a) * rb[i] * o + np.sin(a) * ra[i] * b)
    for i in range(m - 1):
        for k in range(segments):
            a, b2 = i * segments + k, i * segments + (k + 1) % segments
            c, d = a + segments, b2 + segments
            F += [[a, c, b2], [b2, c, d]]
    # caps
    V = np.array(V)
    c0, c1 = len(V), len(V) + 1
    V = np.vstack([V, pts[0], pts[-1]])
    for k in range(segments):
        F.append([c0, (k + 1) % segments, k])
        F.append([c1, (m - 1) * segments + k, (m - 1) * segments + (k + 1) % segments])
    return V.astype(np.float32), np.array(F, np.uint32)[:, ::-1].copy()  # outward winding
