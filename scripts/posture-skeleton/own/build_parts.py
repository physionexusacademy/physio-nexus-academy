"""Builds PNA's own skeleton, piece by piece, and writes raw meshes plus a manifest for assemble.mjs.
   python3 build_parts.py <out-dir> [only-prefix]"""
import json, os, sys, time
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import mesh
from mesh import sdf_to_mesh
import spine, thorax, upper, lower, skull

out = sys.argv[1]
only = sys.argv[2] if len(sys.argv) > 2 else ""
os.makedirs(out, exist_ok=True)
manifest_path = os.path.join(out, "manifest.json")
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {"pieces": {}, "joints": {}}

def save(name, group, V, F, material="bone"):
    V.astype(np.float32).tofile(os.path.join(out, f"{name}.pos"))
    F.astype(np.uint32).tofile(os.path.join(out, f"{name}.idx"))
    ao = mesh.LAST_AO[1] if mesh.LAST_AO is not None and mesh.LAST_AO[0] == len(V) else np.ones(len(V), np.float32)
    np.round(ao * 255).astype(np.uint8).tofile(os.path.join(out, f"{name}.ao"))
    manifest["pieces"][name] = {"group": group, "material": material, "verts": int(len(V)), "tris": int(len(F))}
    print(f"  {name:24s} {len(F):7d} tris", flush=True)

t0 = time.time()
if only in ("", "spine"):
    for lv in spine.ORDER:
        mesh.LAST_AO = None
        f, c = spine.vertebra_world(lv)
        lo, hi = spine.bounds(lv)
        V, F = sdf_to_mesh(f, lo, hi, step=0.0007, target=4500 if lv[0] != "c" else 3200)
        save(f"{spine.region(lv)}_{lv}", spine.region(lv), V, F)
if only in ("", "thorax"):
    for n in range(1, 13):
        for side, tag in ((1, "l"), (-1, "r")):
            mesh.LAST_AO = None; V, F = thorax.rib_mesh(n, side)
            save(f"ribs_{tag}_{n:02d}", f"ribs_{tag}", V, F)
            mesh.LAST_AO = None; c = thorax.cartilage_mesh(n, side)
            if c is not None:
                save(f"costal_{tag}_{n:02d}", f"ribs_{tag}", c[0], c[1], material="cartilage")
    f, lo, hi = thorax.sternum()
    V, F = sdf_to_mesh(f, lo, hi, step=0.0008, target=5000)
    save("sternum", "sternum", V, F)
def mirror(V, F):
    return V * np.array([-1, 1, 1], np.float32), F[:, ::-1].copy()

def both(name, group, V, F, material="bone"):
    save(f"{name}_l", f"{group}_l", V, F, material)
    Vr, Fr = mirror(V, F)
    save(f"{name}_r", f"{group}_r", Vr, Fr, material)

if only in ("", "upper"):
    mesh.LAST_AO = None; V, F = upper.clavicle_mesh(); both("clavicle", "clavicle", V, F)
    for fn, name, group, step, tgt in [(upper.scapula, "scapula", "scapula", 0.0007, 26000), (upper.humerus, "humerus", "humerus", 0.0009, 9000),
                                       (upper.ulna, "forearm_ulna", "forearm", 0.0008, 5000), (upper.radius, "forearm_radius", "forearm", 0.0008, 5000),
                                       (upper.hand, "hand", "hand", 0.00055, 14000)]:
        f, lo, hi = fn()
        V, F = sdf_to_mesh(f, lo, hi, step=step, target=tgt)
        both(name, group, V, F)
if only in ("", "lower"):
    for fn, name, group, step, tgt in [(lower.hip_bone, "pelvis_hip", "pelvis", 0.0008, 30000), (lower.femur, "femur", "femur", 0.0009, 16000),
                                       (lower.patella, "patella", "patella", 0.0007, 3000), (lower.tibia, "lower_leg_tibia", "lower_leg", 0.0009, 12000),
                                       (lower.fibula, "lower_leg_fibula", "lower_leg", 0.0008, 5000), (lower.foot, "foot", "foot", 0.0006, 22000)]:
        f, lo, hi = fn()
        V, F = sdf_to_mesh(f, lo, hi, step=step, target=tgt)
        both(name, group, V, F)
    for side in ("l", "r"):
        manifest["pieces"][f"pelvis_hip_{side}"]["group"] = "pelvis"   # both hip bones move and tint with the pelvis as one ring
    for fn, name, step, tgt in [(lower.sacrum, "pelvis_sacrum", 0.0007, 12000), (lower.coccyx, "pelvis_coccyx", 0.0006, 2000)]:
        f, lo, hi = fn()
        V, F = sdf_to_mesh(f, lo, hi, step=step, target=tgt)
        save(name, "pelvis", V, F)
    manifest["joints"].update({"hip_l": lower.HJ.tolist(), "knee_l": lower.KNEE.tolist(), "ankle_l": lower.ANKLE.tolist()})
    for k in ("hip", "knee", "ankle"):
        v = manifest["joints"][f"{k}_l"]; manifest["joints"][f"{k}_r"] = [-v[0], v[1], v[2]]
if only in ("", "upper"):
    manifest["joints"].update({"shoulder_l": upper.HEAD.tolist(), "shoulder_r": [-upper.HEAD[0], upper.HEAD[1], upper.HEAD[2]],
                               "elbow_l": [0.195, 1.112, -0.031], "elbow_r": [-0.195, 1.112, -0.031], "wrist_l": [0.250, 0.856, 0.014], "wrist_r": [-0.250, 0.856, 0.014]})
if only in ("", "skull"):
    for fn, name, step, tgt, mat in [(skull.cranium, "skull", 0.0009, 40000, "bone"), (skull.mandible, "mandible", 0.0007, 14000, "bone"), (skull.teeth, "teeth", 0.0004, 16000, "tooth")]:
        f, lo, hi = fn()
        V, F = sdf_to_mesh(f, lo, hi, step=step, target=tgt)
        save(name, name, V, F, material=mat)
json.dump(manifest, open(manifest_path, "w"), indent=1)
print(f"done in {time.time() - t0:.0f}s, pieces: {len(manifest['pieces'])}")
