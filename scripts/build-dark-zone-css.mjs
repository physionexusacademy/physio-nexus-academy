// Builds src/app/dark-zone.generated.css: Tailwind light utilities restyled for the dark futuristic sections (.nx-dz).
// Run: node scripts/build-dark-zone-css.mjs > src/app/dark-zone.generated.css  (only classes used in src/ are emitted)
const Z = ".nx-dz";
const esc = (c) => c.replace(/\//g, "\\/").replace(/:/g, "\\:");
const tints = {
  teal: [45, 212, 191, "#5eead4"], cyan: [34, 211, 238, "#67e8f9"], sky: [56, 189, 248, "#7dd3fc"], blue: [96, 165, 250, "#93c5fd"],
  indigo: [129, 140, 248, "#a5b4fc"], violet: [167, 139, 250, "#c4b5fd"], purple: [192, 132, 252, "#d8b4fe"], fuchsia: [232, 121, 249, "#f0abfc"],
  pink: [244, 114, 182, "#f9a8d4"], rose: [251, 113, 133, "#fda4af"], red: [248, 113, 113, "#fca5a5"], orange: [251, 146, 60, "#fdba74"],
  amber: [251, 191, 36, "#fcd34d"], yellow: [250, 204, 21, "#fde047"], emerald: [52, 211, 153, "#6ee7b7"], green: [74, 222, 128, "#86efac"], lime: [163, 230, 53, "#bef264"],
};
import { execSync } from "node:child_process";
const used = new Set(execSync("grep -rhoE '[a-z-]+:?[a-z]+-[a-z]+(-[0-9]{2,3})?(/[0-9]+)?' src --include=*.tsx --include=*.ts", { maxBuffer: 1 << 28 }).toString().split("\n"));
const out = [];
const rule = (sels, body) => {
  const keep = sels.filter((x) => { const m = x.match(/\.((?:\\.|[^.\s:\[])+)(?::|\[|$)/g); const c = x.slice(Z.length + 2).replace(/(:hover|:nth-child\(\w+\)|\[open\]|:focus)$/, "").replace(/\\/g, ""); return used.has(c); });
  if (keep.length) out.push(`${keep.join(",\n")} { ${body} }`);
};
const cls = (c, pseudo = "") => `${Z} .${esc(c)}${pseudo}`;
const ops = ["", "/40", "/50", "/60", "/70", "/75", "/80", "/85", "/90", "/95"];
const variants = [["", ""], ["hover:", ":hover"], ["odd:", ":nth-child(odd)"], ["even:", ":nth-child(even)"], ["open:", "[open]"], ["focus:", ":focus"]];
const V = (base, list = variants) => list.map(([p, ps]) => cls(p + base, ps));

// ---- surfaces
rule(ops.flatMap((o) => V("bg-white" + o)), "background-color: #152034;");
rule(["bg-white/70", "bg-white/25"].flatMap(() => []).concat(V("bg-slate-50"), ...["/40", "/50", "/60", "/70"].map((o) => V("bg-slate-50" + o)), V("bg-grey-50")), "background-color: rgba(255, 255, 255, 0.04);");
rule([...V("bg-slate-100"), ...V("bg-slate-200")], "background-color: rgba(255, 255, 255, 0.07);");
rule([...V("bg-slate-300"), ...V("bg-slate-400")], "background-color: rgba(150, 190, 230, 0.3);");
// ---- text (neutral)
rule(["slate-950", "slate-900", "slate-800", "navy-950", "navy-900", "navy-800", "gray-900", "gray-800", "grey-900"].flatMap((s) => V("text-" + s)), "color: #f1f5f9;");
rule(["slate-700", "slate-600", "navy-700", "navy-600", "gray-700", "gray-600"].flatMap((s) => V("text-" + s)), "color: #cbd5e1;");
rule(["slate-500", "slate-400", "gray-500"].flatMap((s) => V("text-" + s)), "color: #94a3b8;");
// ---- borders (neutral)
rule(["slate-100", "slate-200", "slate-200/80", "slate-300", "grey-200", "gray-200", "navy-200", "navy-300", "white"].flatMap((s) => V("border-" + s)), "border-color: rgba(148, 163, 184, 0.16);");
rule(["slate-100", "slate-200"].flatMap((s) => V("ring-" + s)), "--tw-ring-color: rgba(148, 163, 184, 0.16);");
rule(["slate-100", "slate-200", "slate-300"].map((s) => cls("fill-" + s)), "fill: rgba(255, 255, 255, 0.07);");
rule(["slate-200", "slate-300", "slate-400"].map((s) => cls("stroke-" + s)), "stroke: rgba(148, 163, 184, 0.35);");
// ---- neutral gradients
const darkFrom = "#1a263c";
rule(["white", "slate-50", "slate-100", "grey-50"].flatMap((s) => [cls("from-" + s)]), `--tw-gradient-from: ${darkFrom} var(--tw-gradient-from-position); --tw-gradient-to: rgba(26, 38, 60, 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);`);
rule(["white", "slate-50", "slate-100"].map((s) => cls("to-" + s)), "--tw-gradient-to: #121b2d var(--tw-gradient-to-position);");
rule(["white", "slate-50"].map((s) => cls("via-" + s)), "--tw-gradient-to: rgba(18, 27, 45, 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), #162135 var(--tw-gradient-via-position), var(--tw-gradient-to);");

// ---- tinted colours
for (const [name, [r, g, b, light]] of Object.entries(tints)) {
  const a = (x) => `rgba(${r}, ${g}, ${b}, ${x})`;
  rule(["50", ...["/30", "/40", "/50", "/60", "/70", "/75", "/80"].map((o) => "50" + o)].flatMap((s) => V(`bg-${name}-${s}`)), `background-color: ${a(0.08)};`);
  rule(["100", "200"].flatMap((s) => V(`bg-${name}-${s}`)), `background-color: ${a(0.14)};`);
  rule(["600", "700", "800", "900", "950", "900/60", "900/80"].flatMap((s) => V(`text-${name}-${s}`)), `color: ${light};`);
  rule(["100", "200", "200/40", "200/80", "300", "300/30", "300/40", "300/80", "400"].flatMap((s) => V(`border-${name}-${s}`)), `border-color: ${a(0.3)};`);
  rule(["100", "200", "300/60"].flatMap((s) => V(`ring-${name}-${s}`)), `--tw-ring-color: ${a(0.35)};`);
  rule(["50", "100", "50/70"].map((s) => cls(`from-${name}-${s}`)), `--tw-gradient-from: ${a(0.14)} var(--tw-gradient-from-position); --tw-gradient-to: ${a(0)} var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);`);
  rule(["50", "100", "50/30", "50/40", "50/50", "50/60"].map((s) => cls(`to-${name}-${s}`)), `--tw-gradient-to: ${a(0.1)} var(--tw-gradient-to-position);`);
  rule(["50", "50/50"].map((s) => cls(`via-${name}-${s}`)), `--tw-gradient-to: ${a(0)} var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), ${a(0.1)} var(--tw-gradient-via-position), var(--tw-gradient-to);`);
}
// group-hover text needs the group selector
for (const [name, [, , , light]] of Object.entries(tints)) if (used.has(`group-hover:text-${name}-800`) || used.has(`group-hover:text-${name}-700`)) out.push(`${Z} .group:hover .${esc(`group-hover:text-${name}-800`)}, ${Z} .group:hover .${esc(`group-hover:text-${name}-700`)} { color: ${light}; }`);

process.stdout.write("/* GENERATED by scripts/build-dark-zone-css.mjs: Tailwind light utilities restyled for the dark futuristic sections. Do not edit by hand. */\n@media screen {\n" + out.join("\n") + "\n}\n");
