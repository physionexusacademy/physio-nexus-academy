"""
Signed-distance modelling helpers for PNA's own skeleton (original work, no third-party meshes).

Every shape is a function f(P) -> distance, P an (N, 3) array in metres. Negative inside, positive outside.
Bones are built by combining simple anatomical primitives with smooth unions, then turned into a mesh
with marching cubes (mesh.py). Units: metres; y up; the skeleton faces +z; the person's LEFT is +x.
"""
import numpy as np

def _v(a):
    return np.asarray(a, dtype=np.float64)

# ---------------- primitives ----------------
def sphere(c, r):
    c = _v(c)
    return lambda P: np.linalg.norm(P - c, axis=1) - r

def ellipsoid(c, radii, rot=None):
    """Approximate SDF of an ellipsoid (good near the surface). rot: 3x3 matrix taking world to local."""
    c, rr = _v(c), _v(radii)
    def f(P):
        Q = P - c
        if rot is not None:
            Q = Q @ np.asarray(rot).T
        k0 = np.linalg.norm(Q / rr, axis=1)
        k1 = np.linalg.norm(Q / (rr * rr), axis=1)
        return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)
    return f

def capsule(a, b, ra, rb=None):
    """Round cone between points a and b with radii ra and rb (a tapered capsule)."""
    a, b = _v(a), _v(b)
    rb = ra if rb is None else rb
    ba = b - a
    L2 = float(ba @ ba)
    def f(P):
        pa = P - a
        h = np.clip((pa @ ba) / L2, 0.0, 1.0)
        r = ra + (rb - ra) * h
        return np.linalg.norm(pa - np.outer(h, ba), axis=1) - r
    return f

def chain(points, radii, k=0.004):
    """A smooth tube through several points, radius per point (a chain of tapered capsules)."""
    parts = [capsule(points[i], points[i + 1], radii[i], radii[i + 1]) for i in range(len(points) - 1)]
    return smooth_union(*parts, k=k)

def box(c, half, rot=None, r=0.0):
    """Rounded box. half: half sizes; r: corner rounding."""
    c, hh = _v(c), _v(half) - r
    def f(P):
        Q = P - c
        if rot is not None:
            Q = Q @ np.asarray(rot).T
        q = np.abs(Q) - hh
        return np.linalg.norm(np.maximum(q, 0), axis=1) + np.minimum(np.max(q, axis=1), 0) - r
    return f

def ellcyl(c, a, b, h, rot=None, r=0.002, waist=0.0):
    """Elliptic cylinder along local y: half-width a (x), half-depth b (z), half-height h, rounded edge r, waist = sides drawn in at mid-height."""
    c = _v(c)
    def f(P):
        Q = P - c
        if rot is not None:
            Q = Q @ np.asarray(rot).T
        t = np.clip(Q[:, 1] / h, -1, 1)
        s = 1.0 - waist * (1.0 - t * t)
        aa, bb = a * s - r, b * s - r
        k = np.sqrt((Q[:, 0] / aa) ** 2 + (Q[:, 2] / bb) ** 2)
        d2 = (k - 1.0) * np.minimum(aa, bb)
        dy = np.abs(Q[:, 1]) - (h - r)
        return np.linalg.norm(np.stack([np.maximum(d2, 0), np.maximum(dy, 0)], 1), axis=1) + np.minimum(np.maximum(d2, dy), 0) - r
    return f

def ellring(c, rx, rz, t, h, rot=None):
    """A ring (elliptic) lying in the local xz plane: centre-line radii rx, rz, tube half-thickness t, half-height h."""
    c = _v(c)
    def f(P):
        Q = P - c
        if rot is not None:
            Q = Q @ np.asarray(rot).T
        k = np.sqrt((Q[:, 0] / rx) ** 2 + (Q[:, 2] / rz) ** 2)
        d2 = np.abs((k - 1.0) * min(rx, rz)) - t
        dy = np.abs(Q[:, 1]) - h
        return np.linalg.norm(np.stack([np.maximum(d2, 0), np.maximum(dy, 0)], 1), axis=1) + np.minimum(np.maximum(d2, dy), 0)
    return f

def halfspace(n, d):
    """Points with n.p <= d are inside."""
    n = _v(n) / np.linalg.norm(n)
    return lambda P: P @ n - d

def polygon2d_sdf(poly):
    """Signed distance to a closed 2D polygon (list of (u, v)), vectorised over (N, 2) points."""
    V = _v(poly)
    def f(Q):
        d = np.full(len(Q), np.inf)
        s = np.ones(len(Q))
        n = len(V)
        for i in range(n):
            a, b = V[i], V[(i + 1) % n]
            e = b - a
            w = Q - a
            h = np.clip((w @ e) / (e @ e), 0, 1)
            dd = np.linalg.norm(w - np.outer(h, e), axis=1)
            d = np.minimum(d, dd)
            c1 = Q[:, 1] >= a[1]
            c2 = Q[:, 1] < b[1]
            c3 = e[0] * w[:, 1] > e[1] * w[:, 0]
            flip = (c1 & c2 & c3) | (~c1 & ~c2 & ~c3)
            s = np.where(flip, -s, s)
        return s * d
    return f

def plate(origin, u_axis, v_axis, poly, thickness, bend=None, round_r=0.0015):
    """A thin plate: a 2D outline (in u, v metres) on a surface through origin spanned by u_axis and v_axis.
    bend(u, v) -> offset along the normal (to curve the plate); thickness(u, v) or a float -> half thickness."""
    o, U, V = _v(origin), _v(u_axis), _v(v_axis)
    U = U / np.linalg.norm(U); V = V - (V @ U) * U; V = V / np.linalg.norm(V)
    N = np.cross(U, V)
    p2 = polygon2d_sdf(poly)
    def f(P):
        Q = P - o
        u, v, w = Q @ U, Q @ V, Q @ N
        if bend is not None:
            w = w - bend(u, v)
        th = thickness(u, v) if callable(thickness) else thickness
        d2 = p2(np.stack([u, v], 1)) + round_r
        dw = np.abs(w) - th + round_r
        return np.linalg.norm(np.stack([np.maximum(d2, 0), np.maximum(dw, 0)], 1), axis=1) + np.minimum(np.maximum(d2, dw), 0) - round_r
    return f

# ---------------- combinations ----------------
def union(*fs):
    return lambda P: np.min(np.stack([f(P) for f in fs], 0), axis=0)

def smooth_union(*fs, k=0.004):
    def f(P):
        d = fs[0](P)
        for g in fs[1:]:
            d2 = g(P)
            h = np.clip(0.5 + 0.5 * (d2 - d) / k, 0, 1)
            d = d2 * (1 - h) + d * h - k * h * (1 - h)
        return d
    return f

def subtract(a, *bs, k=0.0):
    def f(P):
        d = a(P)
        for b in bs:
            e = -b(P)
            if k > 0:
                h = np.clip(0.5 - 0.5 * (e - d) / k, 0, 1)
                d = e * (1 - h) + d * h + k * h * (1 - h)
            else:
                d = np.maximum(d, e)
        return d
    return f

def intersect(*fs):
    return lambda P: np.max(np.stack([f(P) for f in fs], 0), axis=0)

def mirror_x(f):
    """The same shape on the other side (x -> -x)."""
    return lambda P: f(P * np.array([-1.0, 1.0, 1.0]))

# ---------------- rotations ----------------
def rot_x(deg):
    a = np.radians(deg); c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])

def rot_y(deg):
    a = np.radians(deg); c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])

def rot_z(deg):
    a = np.radians(deg); c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
