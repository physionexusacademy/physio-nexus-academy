"""
Pelvis and lower limb (left side; the right is the mirror image), standing.

Hip bone: ilium (fan-shaped wing with the iliac crest, ASIS and AIIS in front, PSIS behind, iliac fossa inside), ischium (ischial spine and
tuberosity), pubis (superior and inferior rami meeting at the symphysis); the rami enclose the obturator foramen; the three meet at the
acetabulum, a deep cup facing out, down and forward (~45 degrees inclination, ~20 degrees anteversion). Sacrum: five fused vertebrae, wedge-
shaped and curved (concave in front), with alae, four pairs of anterior foramina, a median crest behind; coccyx below.
Femur (~45 cm): head on a neck at ~125 degrees to the shaft with ~12 degrees anteversion; greater and lesser trochanters; shaft slanting in
toward the knee with a forward bow and the linea aspera behind; two condyles with a notch between them behind and the patellar groove in front.
Patella: a triangular sesamoid bone with its apex down. Tibia: plateau with two shallow facets and the intercondylar eminence, tibial tuberosity,
a sharp anterior border, medial malleolus. Fibula: thin, lateral and behind, its head below the knee joint, the lateral malleolus lower than
the medial. Foot: talus, calcaneus, navicular, cuboid, three cuneiforms, five metatarsals, fourteen phalanges, with a longitudinal arch.
"""
import numpy as np
from sdf import (sphere, ellipsoid, capsule, chain, box, plate, polygon2d_sdf, smooth_union, subtract, union, intersect, halfspace, ellcyl, rot_x, rot_y, rot_z)

HJ = np.array([0.090, 0.895, -0.020])     # hip joint centre
KNEE = np.array([0.083, 0.456, -0.024])   # knee joint centre
ANKLE = np.array([0.087, 0.071, -0.030])  # ankle joint (top of the talus)

def _plate_through(landmarks, thick_edge=0.0045, thick_mid=0.0016):
    """A curved plate whose outline passes through the given 3D landmarks (in order), bent so every landmark lies on it."""
    P = np.asarray(landmarks, float)
    o = P.mean(0)
    # best-fit plane
    _, _, vt = np.linalg.svd(P - o)
    U, V, N = vt[0], vt[1], vt[2]
    uv = np.stack([(P - o) @ U, (P - o) @ V], 1)
    w = (P - o) @ N
    poly = [tuple(x) for x in uv]
    p2 = polygon2d_sdf(poly)
    def bend(u, v):
        Q = np.stack([u, v], 1)
        d2 = ((Q[:, None, :] - uv[None, :, :]) ** 2).sum(-1) + 1e-6
        wt = 1.0 / d2 ** 1.5
        return (wt * w[None, :]).sum(1) / wt.sum(1)
    def th(u, v):
        e = p2(np.stack([u, v], 1))
        return thick_mid + (thick_edge - thick_mid) * np.exp(np.minimum(e, 0) / 0.007)
    return plate(o, U, V, poly, th, bend=bend, round_r=0.0012)

def hip_bone():
    # ilium wing outline: ASIS -> anterior crest -> iliac tubercle -> posterior crest -> PSIS -> PIIS -> greater sciatic notch -> above the acetabulum -> AIIS
    wing = _plate_through([
        (0.118, 0.974, 0.046), (0.131, 1.004, 0.026), (0.141, 1.028, -0.004), (0.133, 1.034, -0.030), (0.112, 1.030, -0.055),
        (0.082, 1.014, -0.077), (0.050, 0.990, -0.086), (0.044, 0.960, -0.084), (0.052, 0.940, -0.075), (0.066, 0.918, -0.060),
        (0.080, 0.912, -0.036), (0.095, 0.920, -0.006), (0.104, 0.940, 0.030), (0.110, 0.952, 0.042)])
    crest = chain([(0.118, 0.974, 0.046), (0.131, 1.004, 0.026), (0.141, 1.028, -0.004), (0.133, 1.034, -0.030), (0.112, 1.030, -0.055), (0.082, 1.014, -0.077), (0.050, 0.990, -0.086)],
                  [0.0045, 0.0050, 0.0062, 0.0058, 0.0055, 0.0055, 0.0058], k=0.003)
    asis = sphere((0.118, 0.973, 0.047), 0.0060)
    aiis = sphere((0.106, 0.942, 0.040), 0.0050)
    psis = sphere((0.048, 0.988, -0.086), 0.0065)
    auric = ellipsoid((0.055, 0.965, -0.068), (0.008, 0.024, 0.016))  # the thick part that meets the sacrum
    # body of the ilium: the thick pelvic brim (arcuate line) from the sacroiliac joint round to the acetabulum and on to the pubis,
    # and the thick posterior column above the greater sciatic notch. Without them the wing would hang from the hip socket alone.
    brim = chain([(0.050, 0.968, -0.060), (0.060, 0.938, -0.044), (0.069, 0.912, -0.020), (0.068, 0.896, 0.008), (0.060, 0.888, 0.030)],
                 [0.0080, 0.0095, 0.0110, 0.0100, 0.0080], k=0.005)
    post_col = chain([(0.052, 0.980, -0.078), (0.054, 0.955, -0.074), (0.062, 0.925, -0.060), (0.072, 0.900, -0.042), (0.078, 0.885, -0.030)],
                     [0.0080, 0.0090, 0.0085, 0.0095, 0.0110], k=0.005)
    # acetabulum: a deep cup facing out, down and forward
    n_ac = np.array([0.67, -0.67, 0.30]); n_ac /= np.linalg.norm(n_ac)
    cup = intersect(sphere(HJ, 0.0345), halfspace(n_ac, HJ @ n_ac + 0.004))
    block = ellipsoid(HJ + np.array([-0.020, 0.010, -0.008]), (0.020, 0.028, 0.024))
    # ischium: down and back to the tuberosity, with the ischial spine
    ischium = chain([(0.080, 0.880, -0.034), (0.068, 0.850, -0.040), (0.062, 0.828, -0.038)], [0.0120, 0.0105, 0.0095], k=0.004)
    tuber = ellipsoid((0.063, 0.826, -0.036), (0.0105, 0.0145, 0.0130))
    ispine = capsule((0.064, 0.874, -0.050), (0.050, 0.872, -0.064), 0.0045, 0.0018)
    # rami around the obturator foramen
    isch_ramus = chain([(0.060, 0.822, -0.028), (0.045, 0.826, 0.000), (0.033, 0.836, 0.024)], [0.0065, 0.0058, 0.0055], k=0.003)
    inf_pubic = chain([(0.033, 0.836, 0.024), (0.020, 0.850, 0.046), (0.010, 0.862, 0.056)], [0.0055, 0.0055, 0.0065], k=0.003)
    pubic_body = box((0.012, 0.868, 0.058), (0.0095, 0.0165, 0.0085), r=0.004)
    sup_ramus = chain([(0.082, 0.888, 0.008), (0.055, 0.882, 0.035), (0.024, 0.876, 0.056)], [0.0090, 0.0072, 0.0070], k=0.003)
    tubercle = sphere((0.022, 0.870, 0.065), 0.0040)
    shape = smooth_union(wing, crest, asis, aiis, psis, auric, brim, post_col, cup, block, ischium, tuber, ispine, isch_ramus, inf_pubic, pubic_body, sup_ramus, tubercle, k=0.0045)
    socket = sphere(HJ, 0.0262)  # the femoral head's socket
    return subtract(shape, socket, k=0.001), np.array([0.0, 0.80, -0.11]), np.array([0.16, 1.05, 0.08])

def sacrum():
    """Five fused vertebrae: a curved triangle, wide at the base (the alae reach the sacroiliac joints), narrowing to the apex, concave in front.
    The base (S1) tilts forward (sacral slope) with its body's front edge, the promontory, the most forward point."""
    levels = [  # y, z of the middle, half width, half depth (front to back)
        (0.986, -0.050, 0.054, 0.019), (0.960, -0.060, 0.045, 0.015), (0.935, -0.067, 0.034, 0.012), (0.912, -0.072, 0.024, 0.0095), (0.893, -0.073, 0.014, 0.0075)]
    L5 = np.array(levels)
    t = np.linspace(0, len(levels) - 1, 25)
    fine = np.stack([np.interp(t, np.arange(len(levels)), L5[:, k]) for k in range(4)], 1)  # many thin slices: smooth sides, no steps
    slices = []
    for i in range(len(fine) - 1):
        (y0, z0, w0, d0), (y1, z1, w1, d1) = fine[i], fine[i + 1]
        c = np.array([0.0, (y0 + y1) / 2, (z0 + z1) / 2])
        ang = np.degrees(np.arctan2(z0 - z1, y0 - y1))     # lean of this segment from vertical
        L = np.hypot(y0 - y1, z0 - z1)
        slices.append(ellcyl(c, (w0 + w1) / 2, (d0 + d1) / 2, L / 2 + 0.0015, rot=rot_x(-ang), r=0.0015, waist=0.0))
    parts = [union(*slices)]  # a plain union: a smooth union of many overlapping slices would swell
    parts.append(ellcyl((0.0, 0.993, -0.036), 0.025, 0.017, 0.012, r=0.003))     # S1 body: its upper face meets the L5 disc; the front edge is the promontory
    for s in (-1, 1):
        parts.append(ellipsoid((s * 0.050, 0.968, -0.062), (0.010, 0.028, 0.016)))  # auricular surface (sacroiliac joint) on the side of the ala
        parts.append(capsule((s * 0.017, 0.995, -0.060), (s * 0.018, 1.008, -0.064), 0.0048))  # superior articular processes (facets for L5)
        parts.append(chain([(s * 0.020, 0.975, -0.071), (s * 0.017, 0.930, -0.082), (s * 0.012, 0.900, -0.082)], [0.0025, 0.0025, 0.0022], k=0.003))  # intermediate crests
    parts.append(chain([(0.0, 0.985, -0.072), (0.0, 0.955, -0.082), (0.0, 0.925, -0.086), (0.0, 0.908, -0.084)], [0.0035, 0.0040, 0.0035, 0.0028], k=0.003))  # median sacral crest
    shape = smooth_union(*parts, k=0.007)
    holes = [capsule((0.0, 1.02, -0.060), (0.0, 0.905, -0.078), 0.0060)]  # sacral canal
    holes.append(capsule((0.0, 0.912, -0.082), (0.0, 0.890, -0.080), 0.0055))  # sacral hiatus
    for y, x in ((0.970, 0.020), (0.946, 0.018), (0.923, 0.015), (0.903, 0.012)):
        for s in (-1, 1):
            holes.append(capsule((s * x, y, -0.030), (s * x, y + 0.002, -0.095), 0.0034))  # anterior and posterior sacral foramina
    return subtract(shape, *holes, k=0.001), np.array([-0.075, 0.86, -0.11]), np.array([0.075, 1.025, -0.01])

def coccyx():
    segs = [((0.0, 0.878, -0.069), 0.0055), ((0.0, 0.866, -0.063), 0.0045), ((0.0, 0.856, -0.055), 0.0036), ((0.0, 0.849, -0.047), 0.0028)]
    return union(*[ellipsoid(c, (r * 1.5, r * 1.1, r)) for c, r in segs]), np.array([-0.02, 0.83, -0.09]), np.array([0.02, 0.89, -0.03])

def femur():
    head = sphere(HJ, 0.0236)
    neck = capsule(HJ, (0.128, 0.874, -0.028), 0.0155, 0.0170)
    gt = ellipsoid((0.139, 0.884, -0.031), (0.0125, 0.0215, 0.0175))
    lt = capsule((0.116, 0.848, -0.032), (0.106, 0.842, -0.044), 0.0085, 0.0055)
    intertroch = capsule((0.140, 0.874, -0.046), (0.110, 0.846, -0.042), 0.0050)
    shaft = chain([(0.127, 0.850, -0.026), (0.118, 0.760, -0.017), (0.105, 0.660, -0.011), (0.094, 0.570, -0.014), (0.086, 0.515, -0.020)],
                  [0.0160, 0.0137, 0.0128, 0.0135, 0.0170], k=0.006)
    aspera = chain([(0.121, 0.790, -0.033), (0.108, 0.680, -0.026), (0.097, 0.590, -0.028)], [0.0032, 0.0040, 0.0030], k=0.004)
    metaph = smooth_union(ellipsoid((0.083, 0.503, -0.024), (0.034, 0.034, 0.023)),        # the shaft flares into the broad lower end
                          capsule((0.086, 0.540, -0.026), (0.062, 0.488, -0.030), 0.0110, 0.0130),  # medial supracondylar line
                          capsule((0.086, 0.540, -0.026), (0.104, 0.490, -0.030), 0.0110, 0.0125), k=0.010)  # lateral supracondylar line
    medc = ellipsoid((0.062, 0.478, -0.031), (0.0135, 0.0215, 0.0285))
    latc = ellipsoid((0.103, 0.481, -0.031), (0.0130, 0.0200, 0.0275))
    mede = sphere((0.049, 0.491, -0.025), 0.0080)
    late = sphere((0.116, 0.493, -0.026), 0.0068)
    shape = smooth_union(head, neck, gt, lt, intertroch, shaft, aspera, metaph, medc, latc, mede, late, k=0.006)
    groove = capsule((0.083, 0.520, 0.012), (0.083, 0.468, 0.004), 0.0090)
    notch = box((0.083, 0.463, -0.040), (0.0090, 0.0160, 0.0200), r=0.004)
    fovea = sphere(HJ + np.array([-0.020, -0.008, 0.002]), 0.0040)
    return subtract(shape, groove, notch, fovea, k=0.002), np.array([0.03, 0.44, -0.07]), np.array([0.165, 0.925, 0.03])

def patella():
    body = ellipsoid((0.085, 0.493, 0.0095), (0.0215, 0.0215, 0.0100))
    apex = capsule((0.085, 0.485, 0.0095), (0.085, 0.470, 0.0080), 0.0120, 0.0050)
    shape = smooth_union(body, apex, k=0.004)
    back = halfspace((0, 0, -1), -0.0025)  # flattened articular surface behind
    return intersect(shape, back), np.array([0.055, 0.455, -0.01]), np.array([0.115, 0.525, 0.03])

def tibia():
    plateau = intersect(ellipsoid((0.082, 0.438, -0.023), (0.0375, 0.0175, 0.0255)), halfspace((0, 1, 0), 0.4505))
    meta = capsule((0.082, 0.430, -0.022), (0.084, 0.380, -0.019), 0.0230, 0.0150)
    tub = ellipsoid((0.085, 0.414, 0.004), (0.0085, 0.0150, 0.0060))
    shaft = chain([(0.084, 0.390, -0.019), (0.086, 0.250, -0.020), (0.087, 0.120, -0.026)], [0.0150, 0.0120, 0.0145], k=0.006)
    crest = chain([(0.085, 0.390, -0.006), (0.087, 0.260, -0.010), (0.087, 0.140, -0.016)], [0.0050, 0.0045, 0.0040], k=0.005)
    distal = ellipsoid((0.087, 0.086, -0.029), (0.0225, 0.0150, 0.0205))
    medmal = capsule((0.068, 0.086, -0.027), (0.067, 0.054, -0.027), 0.0085, 0.0058)
    eminence = smooth_union(capsule((0.078, 0.448, -0.022), (0.079, 0.457, -0.022), 0.0035, 0.0015), capsule((0.087, 0.448, -0.023), (0.087, 0.456, -0.023), 0.0035, 0.0015), k=0.002)
    shape = smooth_union(plateau, meta, tub, shaft, crest, distal, medmal, eminence, k=0.010)
    facets = [sphere((0.064, 0.4745, -0.024), 0.0230), sphere((0.101, 0.4740, -0.024), 0.0230)]
    talar = ellipsoid((0.087, 0.066, -0.030), (0.017, 0.007, 0.020))
    return subtract(shape, *facets, talar, k=0.0015), np.array([0.03, 0.04, -0.06]), np.array([0.13, 0.46, 0.02])

def fibula():
    head = sphere((0.112, 0.424, -0.040), 0.0090)
    shaft = chain([(0.113, 0.414, -0.041), (0.116, 0.260, -0.046), (0.113, 0.110, -0.046)], [0.0060, 0.0052, 0.0065], k=0.004)
    malleolus = ellipsoid((0.111, 0.062, -0.045), (0.0080, 0.0170, 0.0095))
    return smooth_union(head, shaft, malleolus, k=0.004), np.array([0.09, 0.035, -0.065]), np.array([0.135, 0.44, -0.02])

def foot():
    b = []
    talus = smooth_union(ellipsoid((0.087, 0.058, -0.028), (0.0155, 0.0130, 0.0200)), ellipsoid((0.085, 0.052, -0.004), (0.0110, 0.0095, 0.0100)),
                         sphere((0.083, 0.049, 0.011), 0.0105), k=0.004)
    b.append(talus)
    # calcaneus: the largest tarsal, a long box-like bone (~8 cm) whose front end rises ~20 degrees (calcaneal pitch) to meet the cuboid
    calc = smooth_union(box((0.093, 0.028, -0.036), (0.0135, 0.0150, 0.0380), rot=rot_x(20), r=0.0080),
                        ellipsoid((0.093, 0.020, -0.070), (0.0150, 0.0190, 0.0110)),   # tuberosity (the heel), its lower part on the floor
                        ellipsoid((0.086, 0.007, -0.062), (0.0110, 0.0060, 0.0090)),   # medial process under the heel
                        ellipsoid((0.073, 0.039, -0.030), (0.0100, 0.0050, 0.0120)),   # sustentaculum tali: the shelf under the talus on the inside
                        ellipsoid((0.106, 0.026, -0.030), (0.0040, 0.0050, 0.0060)),   # peroneal (fibular) trochlea on the outside
                        k=0.007)
    calc = subtract(calc, ellipsoid((0.088, 0.054, -0.035), (0.0150, 0.0110, 0.0190)), k=0.002)  # the facets the talus sits in
    b.append(calc)
    b.append(ellipsoid((0.077, 0.048, 0.029), (0.0165, 0.0130, 0.0095)))      # navicular
    b.append(box((0.105, 0.029, 0.019), (0.0110, 0.0110, 0.0125), rot=rot_x(15), r=0.0065))   # cuboid
    for c, r in (((0.068, 0.040, 0.046), (0.0090, 0.0140, 0.0115)), ((0.080, 0.046, 0.044), (0.0075, 0.0110, 0.0095)), ((0.092, 0.042, 0.044), (0.0078, 0.0110, 0.0098))):
        b.append(box(c, r, r=0.0045))   # wedge-like cuneiforms forming the transverse arch   # medial, intermediate and lateral cuneiforms
    rays = {  # base of metatarsal -> head -> phalanges; the toes curve slightly down to the floor
        1: [(0.066, 0.040, 0.058), (0.058, 0.017, 0.116), (0.057, 0.013, 0.146), (0.057, 0.011, 0.170)],
        2: [(0.080, 0.045, 0.054), (0.074, 0.015, 0.122), (0.074, 0.013, 0.143), (0.074, 0.010, 0.156), (0.074, 0.008, 0.165)],
        3: [(0.092, 0.041, 0.055), (0.089, 0.014, 0.115), (0.089, 0.012, 0.134), (0.089, 0.009, 0.146), (0.089, 0.007, 0.154)],
        4: [(0.103, 0.034, 0.037), (0.102, 0.013, 0.107), (0.102, 0.011, 0.124), (0.102, 0.008, 0.135), (0.102, 0.007, 0.142)],
        5: [(0.115, 0.028, 0.035), (0.114, 0.012, 0.098), (0.115, 0.010, 0.113), (0.115, 0.008, 0.122), (0.115, 0.007, 0.128)],
    }
    rad = {1: [0.0095, 0.0100, 0.0075, 0.0062], 2: [0.0058, 0.0060, 0.0044, 0.0037, 0.0032], 3: [0.0056, 0.0057, 0.0042, 0.0035, 0.0030],
           4: [0.0055, 0.0055, 0.0040, 0.0033, 0.0029], 5: [0.0062, 0.0055, 0.0038, 0.0031, 0.0027]}
    for k, pts in rays.items():
        r = rad[k]
        for i in range(len(pts) - 1):
            a, c = np.array(pts[i]), np.array(pts[i + 1])
            d = c - a; d /= np.linalg.norm(d)
            a2, c2 = a + d * 0.0010, c - d * 0.0010
            b.append(smooth_union(capsule(a2, c2, r[i] * 0.84, r[i + 1] * 0.76), sphere(c2 - d * r[i + 1] * 0.6, r[i + 1] * 0.98), sphere(a2 + d * r[i] * 0.6, r[i] * 0.98), k=0.0045))
    b.append(sphere((0.120, 0.025, 0.033), 0.0060))  # tuberosity of the 5th metatarsal
    for x in (0.0545, 0.0615):
        b.append(sphere((x, 0.009, 0.112), 0.0042))   # sesamoid bones under the big toe joint
    return union(*b), np.array([0.040, -0.005, -0.095]), np.array([0.135, 0.080, 0.185])
