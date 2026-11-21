import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Motion policy: the site's animations and 3D demonstrations play by default, also on computers whose system setting asks for "reduced motion"
 * (those used to freeze the feature tour, the cards, the Skills Lab, RehabVerse's guide and the PNA Teacher, and to hide the patient). Only the
 * visitor's own choice (footer switch, or the one-time note) calms them. Static checks: one module decides, the stylesheets and the scripts
 * both follow it, and nothing else asks the device.
 */
let checks = 0;
const ok = (condition, message) => { checks++; assert.ok(condition, message); };
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const walk = (dir, out = []) => { for (const name of readdirSync(dir)) { const p = join(dir, name); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };

const motion = read("src/lib/motion.ts");
ok(/export function motionReduced/.test(motion) && /data-motion/.test(motion) && /MOTION_INIT_SCRIPT/.test(motion), "lib/motion.ts: one place decides, from the visitor's choice (data-motion on <html>)");
ok(/s==="reduced"\?"reduced":"full"/.test(motion), "lib/motion.ts: anything but a saved 'reduced' means full motion (the device setting alone does not turn it off)");

const layout = read("src/app/layout.tsx");
ok(layout.includes("MOTION_INIT_SCRIPT") && layout.includes('data-motion="full"') && layout.includes("<MotionGovernor />"), "layout: the choice is applied before first paint and the governor is mounted");

const governor = read("src/components/MotionGovernor.tsx");
ok(/prefers-reduced-motion/.test(governor) && /mediaText/.test(governor) && /MutationObserver/.test(governor) && /load/.test(governor), "MotionGovernor: every 'prefers-reduced-motion' rule of every stylesheet follows the choice, also for sheets added later");
ok(/export function MotionToggle/.test(governor) && /Reduce motion/.test(governor) && /Keep animations/.test(governor), "MotionGovernor: a footer switch and a one-time note let the visitor choose");
ok(read("src/components/Footer.tsx").includes("<MotionToggle />"), "footer: the motion switch is there");

// scripts never ask the device themselves
const offenders = walk("src").filter((f) => /\.(ts|tsx)$/.test(f) && f !== join("src", "lib", "motion.ts") && f !== join("src", "components", "MotionGovernor.tsx") && /matchMedia[^\n]*prefers-reduced-motion/.test(read(f)));
ok(offenders.length === 0, `no script asks the device for reduced motion directly (${offenders.slice(0, 3).join(", ")})`);

// the PNA Teacher keeps its patient
const teacher = read("src/lib/avatar/teacher.ts");
const light = teacher.slice(teacher.indexOf("export function detectLightMode"), teacher.indexOf("Is there an artist's model"));
ok(!/prefers-reduced-motion/.test(light) && !/hardwareConcurrency/.test(light), "PNA Teacher: reduced motion or a 2-core PC no longer switches to the one-pose, no-patient light mode");
ok(/saveData/.test(light) && /deviceMemory/.test(light) && /pna-avatar-light/.test(light), "PNA Teacher: light mode stays for the visitor's own choice, data saver and tiny devices");
ok(/av-light-note/.test(read("src/components/avatar/AvatarStage.tsx")) && /Show the full 3D/.test(read("src/components/avatar/AvatarStage.tsx")), "PNA Teacher: when the simple picture shows, it says so and offers the full 3D");

// the patient does not freeze either
const engine = read("src/lib/virtual-patient/engine.ts");
ok(/motionReduced\(\)\) return false/.test(engine) && !/hardwareConcurrency[^\n]*<= 2\) return false/.test(engine), "virtual patient: breathing and idle motion follow the visitor's choice, not the processor count");

console.log(`Motion policy: ${checks} checks passed (animations and 3D play unless the visitor chose calm; stylesheets and scripts follow one choice; the PNA Teacher keeps its patient).`);
