// Builds src/app/dark-zone.generated.css: Tailwind light utilities restyled for the dark futuristic sections (.nx-dz).
// Run: node scripts/build-dark-zone-css.mjs > src/app/dark-zone.generated.css  (only classes used in src/ are emitted)
const Z = ".nx-dz";
const esc = (c) => c.replace(/\//g, "\\/").replace(/:/g, "\\:");
const tints = {
  teal: [46, 230, 214, "#7ff3e8"], cyan: [60, 200, 255, "#8fe3ff"], sky: [80, 180, 255, "#9fd8ff"], blue: [96, 150, 255, "#a9c8ff"],
  indigo: [129, 140, 248, "#c0c6ff"], violet: [160, 141, 255, "#cdc2ff"], purple: [180, 140, 255, "#d6c4ff"], fuchsia: [232, 121, 249, "#f5b8ff"],
  pink: [255, 122, 180, "#ffb3d2"], rose: [255, 122, 162, "#ffadc4"], red: [255, 110, 110, "#ffa3a3"], orange: [255, 160, 90, "#ffc89a"],
  amber: [255, 198, 92, "#ffd98a"], yellow: [250, 220, 90, "#ffe9a0"], emerald: [52, 211, 153, "#8ef0c6"], green: [74, 222, 128, "#a2f0bd"], lime: [163, 230, 53, "#d0f59a"],
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
rule(ops.flatMap((o) => V("bg-white" + o)), "background-color: rgba(11, 27, 52, 0.78);");
rule(["bg-white/70", "bg-white/25"].flatMap(() => []).concat(V("bg-slate-50"), ...["/40", "/50", "/60", "/70"].map((o) => V("bg-slate-50" + o)), V("bg-grey-50")), "background-color: rgba(255, 255, 255, 0.04);");
rule([...V("bg-slate-100"), ...V("bg-slate-200")], "background-color: rgba(255, 255, 255, 0.07);");
rule([...V("bg-slate-300"), ...V("bg-slate-400")], "background-color: rgba(150, 190, 230, 0.3);");
// ---- text (neutral)
rule(["slate-950", "slate-900", "slate-800", "navy-950", "navy-900", "navy-800", "gray-900", "gray-800", "grey-900"].flatMap((s) => V("text-" + s)), "color: #eef7ff;");
rule(["slate-700", "slate-600", "navy-700", "navy-600", "gray-700", "gray-600"].flatMap((s) => V("text-" + s)), "color: #c5d7ea;");
rule(["slate-500", "slate-400", "gray-500"].flatMap((s) => V("text-" + s)), "color: #94adc8;");
// ---- borders (neutral)
rule(["slate-100", "slate-200", "slate-200/80", "slate-300", "grey-200", "gray-200", "navy-200", "navy-300", "white"].flatMap((s) => V("border-" + s)), "border-color: rgba(150, 205, 255, 0.16);");
rule(["slate-100", "slate-200"].flatMap((s) => V("ring-" + s)), "--tw-ring-color: rgba(150, 205, 255, 0.16);");
rule(["slate-100", "slate-200", "slate-300"].map((s) => cls("fill-" + s)), "fill: rgba(255, 255, 255, 0.07);");
rule(["slate-200", "slate-300", "slate-400"].map((s) => cls("stroke-" + s)), "stroke: rgba(150, 205, 255, 0.32);");
// ---- neutral gradients
const darkFrom = "rgba(14, 32, 62, 0.92)";
rule(["white", "slate-50", "slate-100", "grey-50"].flatMap((s) => [cls("from-" + s)]), `--tw-gradient-from: ${darkFrom} var(--tw-gradient-from-position); --tw-gradient-to: rgba(14, 32, 62, 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);`);
rule(["white", "slate-50", "slate-100"].map((s) => cls("to-" + s)), "--tw-gradient-to: rgba(9, 22, 44, 0.9) var(--tw-gradient-to-position);");
rule(["white", "slate-50"].map((s) => cls("via-" + s)), "--tw-gradient-to: rgba(9, 22, 44, 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), rgba(12, 28, 54, 0.9) var(--tw-gradient-via-position), var(--tw-gradient-to);");

// ---- tinted colours
for (const [name, [r, g, b, light]] of Object.entries(tints)) {
  const a = (x) => `rgba(${r}, ${g}, ${b}, ${x})`;
  rule(["50", ...["/30", "/40", "/50", "/60", "/70", "/75", "/80"].map((o) => "50" + o)].flatMap((s) => V(`bg-${name}-${s}`)), `background-color: ${a(0.09)};`);
  rule(["100", "200"].flatMap((s) => V(`bg-${name}-${s}`)), `background-color: ${a(0.17)};`);
  rule(["600", "700", "800", "900", "950", "900/60", "900/80"].flatMap((s) => V(`text-${name}-${s}`, variants.concat([["group-hover:", ""]]).map(([p, ps]) => p === "group-hover:" ? ["group-hover:", ""] : [p, ps]))), `color: ${light};`);
  rule(["100", "200", "200/40", "200/80", "300", "300/30", "300/40", "300/80", "400"].flatMap((s) => V(`border-${name}-${s}`)), `border-color: ${a(0.38)};`);
  rule(["100", "200", "300/60"].flatMap((s) => V(`ring-${name}-${s}`)), `--tw-ring-color: ${a(0.35)};`);
  rule(["50", "100", "50/70"].map((s) => cls(`from-${name}-${s}`)), `--tw-gradient-from: ${a(0.14)} var(--tw-gradient-from-position); --tw-gradient-to: ${a(0)} var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);`);
  rule(["50", "100", "50/30", "50/40", "50/50", "50/60"].map((s) => cls(`to-${name}-${s}`)), `--tw-gradient-to: ${a(0.1)} var(--tw-gradient-to-position);`);
  rule(["50", "50/50"].map((s) => cls(`via-${name}-${s}`)), `--tw-gradient-to: ${a(0)} var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), ${a(0.1)} var(--tw-gradient-via-position), var(--tw-gradient-to);`);
}
// group-hover text needs the group selector
for (const [name, [, , , light]] of Object.entries(tints)) if (used.has(`group-hover:text-${name}-800`) || used.has(`group-hover:text-${name}-700`)) out.push(`${Z} .group:hover .${esc(`group-hover:text-${name}-800`)}, ${Z} .group:hover .${esc(`group-hover:text-${name}-700`)} { color: ${light}; }`);

process.stdout.write("/* GENERATED by scripts/build-dark-zone-css.mjs: Tailwind light utilities restyled for the dark futuristic sections. Do not edit by hand. */\n@media screen {\n" + out.join("\n") + "\n}\n");
