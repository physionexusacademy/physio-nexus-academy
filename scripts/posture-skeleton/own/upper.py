"""
Shoulder girdle and upper limb (left side; the right side is the mirror image), in the anatomical position (palms forward).

Clavicle: S-shaped, ~15 cm, medial two-thirds convex forward, lateral third concave forward and flattened; sternoclavicular to acromioclavicular joint.
Scapula: triangular blade on ribs 2-7, medial border ~6-7 cm from the spine, in the scapular plane (turned ~30 degrees forward); spine of the scapula
on the back surface ending in the acromion; coracoid process hooking forward; shallow pear-shaped glenoid facing out and slightly forward.
Humerus (~31 cm): head facing in, up and back; greater and lesser tubercles with the bicipital groove; deltoid tuberosity; distal end with medial
(prominent) and lateral epicondyles, trochlea, capitulum, olecranon fossa behind. Forearm: ulna medial with olecranon, trochlear notch, coronoid
process and a small head with styloid at the wrist; radius lateral with a disc-shaped head under the capitulum, radial tuberosity, a broad distal
end and styloid. Hand: 8 carpals in two rows, 5 metacarpals, 14 phalanges; the thumb turned forward.
"""
import numpy as np
from sdf import (sphere, ellipsoid, capsule, chain, box, plate, smooth_union, subtract, union, ellcyl, rot_z, rot_x, rot_y)
from mesh import tube

def clavicle_mesh():
    pts = [(0.020, 1.394, 0.046), (0.045, 1.401, 0.050), (0.080, 1.409, 0.046), (0.112, 1.416, 0.032), (0.138, 1.423, 0.012), (0.158, 1.429, -0.006), (0.166, 1.430, -0.014)]
    major = [0.0085, 0.0072, 0.0062, 0.0060, 0.0072, 0.0085, 0.0080]
    minor = [0.0080, 0.0068, 0.0058, 0.0052, 0.0042, 0.0036, 0.0036]
    return tube(pts, major, minor, lambda q: np.array([0.0, 1.0, 0.0]), segments=16, rings_per_seg=8)

# key points of the scapula (left)
INF = np.array([0.083, 1.268, -0.098])     # inferior angle (T7)
SUP = np.array([0.066, 1.410, -0.087])     # superior angle (T2)
GLEN = np.array([0.158, 1.390, -0.034])    # centre of the glenoid

def scapula():
    U = SUP - INF
    Lm = np.linalg.norm(U)
    gv = GLEN - INF
    Un = U / Lm
    vlen = np.linalg.norm(gv - (gv @ Un) * Un)
    uG = gv @ Un
    # the blade: medial border straight, superior border short, lateral border running down from below the glenoid
    poly = [(0.0, 0.0), (Lm * 0.35, -0.004), (Lm * 0.75, -0.003), (Lm, 0.0), (Lm * 1.0, 0.012), (Lm * 0.96, vlen * 0.45),
            (Lm * 0.92, vlen * 0.60), (Lm * 0.93, vlen * 0.70), (uG + 0.008, vlen - 0.014), (uG - 0.012, vlen - 0.012),
            (uG - 0.030, vlen - 0.018), (Lm * 0.30, vlen * 0.30), (0.006, 0.010)]
    bend = lambda u, v: 0.010 * (v / vlen) * (1 - v / vlen) + 0.006 * (u / Lm) * (1 - u / Lm)  # gently concave in front, to lie on the ribs
    blade = plate(INF, U, gv, poly, 0.0012, bend=bend, round_r=0.0010)   # the fossae are thin (1-3 mm); the borders below are thick and rounded
    Vn = (gv - (gv @ Un) * Un) / vlen
    Nn = np.cross(Un, Vn)
    W = lambda u, v: INF + Un * u + Vn * v + Nn * bend(np.atleast_1d(u), np.atleast_1d(v))[0]   # a point on the blade's mid-surface
    # medial (vertebral) border: straight, a little thicker than the blade, with a smooth triangle where the spine starts
    medial = chain([W(0.006, 0.004), W(Lm * 0.25, 0.0015), W(Lm * 0.50, 0.0010), W(Lm * 0.74, 0.0015), W(Lm - 0.006, 0.003)],
                   [0.0030, 0.0026, 0.0026, 0.0032, 0.0026], k=0.003)
    inf_angle = sphere(W(0.006, 0.006), 0.0052)                       # inferior angle (over the 7th rib)
    # superior border: short and thin, with the suprascapular notch near the coracoid
    superior = chain([W(Lm - 0.004, 0.006), W(Lm * 0.995, vlen * 0.22), W(Lm * 0.965, vlen * 0.44), W(Lm * 0.925, vlen * 0.58)],
                     [0.0024, 0.0020, 0.0019, 0.0022], k=0.003)
    # lateral (axillary) border: the thickest edge, a rounded bar from the inferior angle up to the infraglenoid tubercle under the glenoid
    lateral = chain([W(0.008, 0.009), W(uG * 0.30, vlen * 0.33), W(uG * 0.62, vlen * 0.64), W(uG - 0.026, vlen - 0.026), W(uG - 0.016, vlen - 0.017)],
                    [0.0050, 0.0058, 0.0064, 0.0072, 0.0068], k=0.004)
    infraglen = ellipsoid(W(uG - 0.013, vlen - 0.015), (0.0070, 0.0070, 0.0070))
    # spine of the scapula: a ridge standing off the back of the blade, from the medial border (about T3) to the acromion; thick free crest
    root = INF + Un * (Lm * 0.74) + Vn * 0.004
    a0 = np.array([0.150, 1.420, -0.072])
    back = np.array([0.0, 0.25, -1.0])
    Ls = np.linalg.norm(a0 - root)
    sp_poly = [(0.0, -0.004), (Ls, -0.004), (Ls + 0.004, 0.014), (Ls * 0.60, 0.018), (Ls * 0.15, 0.010), (0.0, 0.005)]
    spine_plate = plate(root, a0 - root, back, sp_poly, lambda u, v: 0.0020 + 0.0010 * np.clip(u / Ls, 0, 1), round_r=0.0018)
    bk = back / np.linalg.norm(back)
    crest = chain([root + bk * 0.006, root + (a0 - root) * 0.15 + bk * 0.010, root + (a0 - root) * 0.60 + bk * 0.018, a0 + bk * 0.014], [0.0030, 0.0034, 0.0044, 0.0052], k=0.003)
    # acromion: a flat process continuing the spine out and forward over the top of the shoulder joint
    a1 = np.array([0.184, 1.430, -0.030])
    w = np.cross(a1 - a0, [0.0, 1.0, 0.0]); w = w / np.linalg.norm(w)
    La = np.linalg.norm(a1 - a0)
    # acromion: an oblong, rounded flat process (~4.5 x 2.5 cm) continuing the spine out and forward over the shoulder joint
    ang = np.linspace(0, 2 * np.pi, 20, endpoint=False)
    acro_poly = [(La * 0.5 + (La * 0.5 + 0.007) * np.cos(t), 0.0005 + 0.0115 * np.sin(t)) for t in ang]
    acromion = plate(a0, a1 - a0, w, acro_poly, lambda u, v: 0.0030 + 0.0012 * np.clip(1 - u / La, 0, 1), bend=lambda u, v: 0.003 * (u / La), round_r=0.0026)
    coracoid = chain([(0.131, 1.404, -0.051), (0.136, 1.420, -0.035), (0.146, 1.417, -0.012), (0.157, 1.406, 0.001)], [0.0062, 0.0058, 0.0050, 0.0042], k=0.003)
    # glenoid: a pear-shaped shallow cup on a short neck, facing out and a little forward
    neck = capsule(GLEN + np.array([-0.022, 0.0, -0.008]), GLEN + np.array([-0.006, 0.0, -0.001]), 0.0095, 0.0110)
    rim = ellcyl(GLEN + np.array([-0.002, 0.0, 0.0]), 0.0190, 0.0135, 0.0045, rot=rot_z(90), r=0.0025)
    shape = smooth_union(blade, medial, inf_angle, superior, lateral, infraglen, spine_plate, crest, acromion, coracoid, neck, rim, k=0.0035)
    dish = sphere(GLEN + np.array([0.0335, 0.0, 0.004]), 0.0300)
    return subtract(shape, dish, k=0.0015), np.array([0.05, 1.24, -0.13]), np.array([0.20, 1.45, 0.02])

HEAD = np.array([0.181, 1.392, -0.031])

def humerus():
    head = sphere(HEAD, 0.0232)
    anat_neck = capsule(HEAD, (0.196, 1.372, -0.029), 0.019, 0.016)
    gt = ellipsoid((0.203, 1.392, -0.024), (0.0105, 0.016, 0.013))
    lt = ellipsoid((0.190, 1.378, -0.009), (0.0065, 0.0095, 0.0062))
    shaft = chain([(0.196, 1.360, -0.029), (0.198, 1.300, -0.030), (0.201, 1.230, -0.031), (0.203, 1.170, -0.033)], [0.0135, 0.0118, 0.0112, 0.0120], k=0.004)
    deltoid = ellipsoid((0.2105, 1.272, -0.027), (0.0045, 0.016, 0.0065))
    distal = ellipsoid((0.204, 1.136, -0.034), (0.024, 0.013, 0.0085))
    flare = smooth_union(capsule((0.203, 1.175, -0.033), (0.186, 1.135, -0.035), 0.0085, 0.0070),   # medial supracondylar ridge
                         capsule((0.203, 1.175, -0.033), (0.224, 1.138, -0.033), 0.0085, 0.0058),   # lateral supracondylar ridge
                         ellipsoid((0.204, 1.150, -0.034), (0.017, 0.022, 0.0085)), k=0.006)
    med_epi = sphere((0.180, 1.129, -0.036), 0.0085)
    lat_epi = sphere((0.228, 1.132, -0.034), 0.0058)
    troch = smooth_union(sphere((0.186, 1.112, -0.031), 0.0110), sphere((0.204, 1.113, -0.031), 0.0098), capsule((0.186, 1.112, -0.031), (0.204, 1.113, -0.031), 0.0082), k=0.002)
    capit = sphere((0.217, 1.114, -0.027), 0.0102)
    shape = smooth_union(head, anat_neck, gt, lt, shaft, deltoid, distal, flare, med_epi, lat_epi, troch, capit, k=0.005)
    groove = capsule((0.197, 1.40, -0.010), (0.198, 1.33, -0.017), 0.0030)
    olec_fossa = ellipsoid((0.202, 1.138, -0.047), (0.010, 0.012, 0.0065))
    cor_fossa = ellipsoid((0.197, 1.139, -0.022), (0.0055, 0.0065, 0.0035))
    return subtract(shape, groove, olec_fossa, cor_fossa, k=0.0015), np.array([0.15, 1.09, -0.07]), np.array([0.25, 1.43, 0.01])

def ulna():
    olec = ellipsoid((0.196, 1.123, -0.049), (0.0090, 0.0150, 0.0090))
    upper = ellipsoid((0.197, 1.102, -0.036), (0.0085, 0.0150, 0.0100))
    cor = ellipsoid((0.197, 1.099, -0.021), (0.0060, 0.0045, 0.0065))
    shaft = chain([(0.198, 1.09, -0.034), (0.207, 1.0198, -0.024), (0.218, 0.9397, -0.012), (0.228, 0.8767, -0.002)], [0.0085, 0.0070, 0.0058, 0.0055], k=0.004)
    head = sphere((0.231, 0.8653, 0.000), 0.0074)
    styl = capsule((0.231, 0.863, -0.003), (0.230, 0.8515, -0.006), 0.0030, 0.0022)
    shape = smooth_union(olec, upper, cor, shaft, head, styl, k=0.004)
    notch = capsule((0.180, 1.112, -0.031), (0.212, 1.113, -0.031), 0.0118)  # the trochlear notch fits the trochlea
    return subtract(shape, notch, k=0.0015), np.array([0.17, 0.835, -0.07]), np.array([0.26, 1.15, 0.02])

def radius():
    head = ellcyl((0.219, 1.097, -0.027), 0.0105, 0.0105, 0.0042, r=0.0015)
    dish = sphere((0.219, 1.113, -0.027), 0.0105)
    neck = capsule((0.219, 1.092, -0.026), (0.219, 1.0748, -0.024), 0.0062, 0.0062)
    tub = ellipsoid((0.214, 1.0656, -0.019), (0.0045, 0.0075, 0.0045))
    shaft = chain([(0.220, 1.0748, -0.024), (0.230, 1.0084, -0.014), (0.240, 0.9397, -0.002), (0.250, 0.8882, 0.010)], [0.0062, 0.0065, 0.0072, 0.0088], k=0.004)
    distal = ellipsoid((0.252, 0.8687, 0.013), (0.0155, 0.0085, 0.0110))
    styl = capsule((0.258, 0.863, 0.015), (0.267, 0.8504, 0.016), 0.0045, 0.0030)
    shape = smooth_union(neck, tub, shaft, distal, styl, k=0.004)
    shape = smooth_union(subtract(head, dish, k=0.001), shape, k=0.003)
    return shape, np.array([0.19, 0.835, -0.05]), np.array([0.30, 1.11, 0.04])

def hand():
    bones = []
    # carpals: proximal row (scaphoid, lunate, triquetrum, pisiform) and distal row (trapezium, trapezoid, capitate, hamate with its hook)
    for c, r in [((0.262, 0.846, 0.016), (0.0072, 0.0050, 0.0060)), ((0.249, 0.847, 0.012), (0.0060, 0.0055, 0.0065)),
                 ((0.236, 0.845, 0.012), (0.0055, 0.0050, 0.0055)), ((0.233, 0.844, 0.021), (0.0040, 0.0040, 0.0040)),
                 ((0.267, 0.828, 0.022), (0.0055, 0.0060, 0.0050)), ((0.257, 0.828, 0.016), (0.0045, 0.0055, 0.0050)),
                 ((0.246, 0.827, 0.012), (0.0060, 0.0085, 0.0065)), ((0.234, 0.828, 0.014), (0.0055, 0.0075, 0.0060)),
                 ((0.233, 0.828, 0.024), (0.0025, 0.0040, 0.0030))]:   # ... hamate hook: the carpus arches, hollow on the palm side (carpal tunnel)
        bones.append(ellipsoid(c, tuple(x * 1.55 for x in r) if r[0] > 0.003 else r))   # packed together into the compact carpal block
    # metacarpals and phalanges: (base, head) points with radii; fingers hang straight down, the palm faces forward
    fingers = {
        "index": [(0.257, 0.817, 0.016), (0.263, 0.753, 0.020), (0.265, 0.712, 0.020), (0.266, 0.687, 0.019), (0.266, 0.669, 0.018)],
        "middle": [(0.247, 0.816, 0.013), (0.249, 0.75, 0.019), (0.250, 0.704, 0.019), (0.250, 0.676, 0.018), (0.250, 0.656, 0.017)],
        "ring": [(0.237, 0.816, 0.012), (0.236, 0.755, 0.018), (0.235, 0.712, 0.018), (0.234, 0.686, 0.017), (0.234, 0.667, 0.016)],
        "little": [(0.229, 0.818, 0.012), (0.224, 0.765, 0.017), (0.221, 0.732, 0.017), (0.220, 0.712, 0.016), (0.219, 0.697, 0.015)],
        "thumb": [(0.268, 0.821, 0.026), (0.282, 0.788, 0.042), (0.291, 0.76, 0.052), (0.296, 0.736, 0.057)],
    }
    rad = {"index": [0.0042, 0.0050, 0.0040, 0.0034, 0.0028], "middle": [0.0044, 0.0052, 0.0042, 0.0035, 0.0029],
           "ring": [0.0040, 0.0047, 0.0038, 0.0032, 0.0026], "little": [0.0037, 0.0043, 0.0034, 0.0029, 0.0024], "thumb": [0.0050, 0.0055, 0.0042, 0.0032]}
    for name, pts in fingers.items():
        r = rad[name]
        for i in range(len(pts) - 1):
            a, b = np.array(pts[i]), np.array(pts[i + 1])
            d = (b - a); n = np.linalg.norm(d); d /= n
            gap = 0.0012
            a2, b2 = a + d * gap, b - d * gap
            shaft = capsule(a2, b2, r[i] * 0.92, r[i + 1] * 0.82)
            head = ellipsoid(b2 - d * r[i + 1] * 0.6, (r[i + 1] * 1.05, r[i + 1] * 0.95, r[i + 1] * 0.92))  # the knuckle at the end of each bone
            base = sphere(a2 + d * r[i] * 0.7, r[i] * 1.0)
            bones.append(smooth_union(shaft, head, base, k=0.004))
        tip = np.array(pts[-1])
        bones.append(ellipsoid(tip + np.array([0, -0.002, 0]), (r[-1] * 1.15, r[-1] * 0.9, r[-1] * 0.8)))  # the tuft of the last phalanx
    return union(*bones), np.array([0.205, 0.64, -0.01]), np.array([0.31, 0.86, 0.07])
