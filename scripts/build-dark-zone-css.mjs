// Builds src/app/dark-zone.generated.css: Tailwind light utilities restyled for the dark futuristic sections (.nx-dz).
// Run: node scripts/build-dark-zone-css.mjs > src/app/dark-zone.generated.css  (only classes used in src/ are emitted)
const Z = ".nx-dz";
const esc = (c) => c.replace(/[/:\[\]#.]/g, (ch) => "\\" + ch);
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
rule(["bg-white/70", "bg-white/25"].flatMap(() => []).concat(V("bg-slate-50"), ...["/40", "/50", "/60", "/70"].map((o) => V("bg-slate-50" + o)), V("bg-grey-50"), V("bg-gray-50"), V("bg-navy-50"), V("bg-neutral-50")), "background-color: rgba(255, 255, 255, 0.04);");
rule(["slate-100", "slate-200", "grey-100", "grey-200", "gray-100", "gray-200", "navy-100", "neutral-100"].flatMap((s) => V("bg-" + s)), "background-color: rgba(255, 255, 255, 0.07);");
rule([...V("bg-slate-300"), ...V("bg-slate-400")], "background-color: rgba(150, 190, 230, 0.3);");
// ---- text (neutral)
rule(["slate-950", "slate-900", "slate-800", "navy-950", "navy-900", "navy-800", "gray-900", "gray-800", "grey-900", "grey-800", "neutral-900", "neutral-800", "black"].flatMap((s) => V("text-" + s)), "color: #f1f5f9;");
rule(["slate-700", "slate-600", "navy-700", "navy-600", "navy-500", "gray-700", "gray-600", "grey-700", "grey-600", "neutral-700", "neutral-600"].flatMap((s) => V("text-" + s)), "color: #cbd5e1;");
rule(["slate-500", "slate-400", "navy-400", "gray-500", "gray-400", "grey-500", "grey-400", "neutral-500"].flatMap((s) => V("text-" + s)), "color: #94a3b8;");
// ---- borders (neutral)
rule(["slate-100", "slate-200", "slate-200/80", "slate-300", "grey-100", "grey-200", "grey-300", "gray-100", "gray-200", "gray-300", "navy-100", "navy-200", "navy-300", "neutral-200", "white"].flatMap((s) => V("border-" + s)), "border-color: rgba(148, 163, 184, 0.16);");
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
  rule(["50", ...["/30", "/40", "/50", "/60", "/70", "/75", "/80", "/85", "/90", "/95"].map((o) => "50" + o)].flatMap((s) => V(`bg-${name}-${s}`)), `background-color: ${a(0.08)};`);
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


// ---- arbitrary hex colours (e.g. bg-[#f8fbfc], text-[#153a4a]): mapped by brightness
{
  const src = execSync("grep -rhoE '(hover:)?(bg|text|border|from|to|via)-\\[#[0-9a-fA-F]{3,8}\\](/[0-9]+)?' src --include=*.tsx --include=*.ts || true", { maxBuffer: 1 << 26 }).toString().split("\n").filter(Boolean);
  const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const sat = ([r, g, b]) => (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
  for (const c of [...new Set(src)]) {
    const m = c.match(/^(hover:)?(bg|text|border|from|to|via)-\[(#[0-9a-fA-F]+)\]/); if (!m) continue;
    const [, hov, kind, h] = m; const rgb = hex(h); const L = lum(rgb); const sel = `${Z} .${esc(c)}${hov ? ":hover" : ""}`;
    const tint = (a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
    if (kind === "bg" && L > 0.55) out.push(`${sel} { background-color: ${sat(rgb) > 0.06 ? tint(0.08) : "#152034"}; }`);
    else if (kind === "text" && L < 0.2) out.push(`${sel} { color: ${sat(rgb) > 0.35 ? "#5eead4" : "#f1f5f9"}; }`);
    else if (kind === "border" && L > 0.5) out.push(`${sel} { border-color: rgba(148, 163, 184, 0.2); }`);
    else if (kind === "from" && L > 0.55) out.push(`${sel} { --tw-gradient-from: #1a263c var(--tw-gradient-from-position); --tw-gradient-to: rgba(26, 38, 60, 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }`);
    else if (kind === "to" && L > 0.55) out.push(`${sel} { --tw-gradient-to: ${sat(rgb) > 0.06 ? tint(0.08) : "#121b2d"} var(--tw-gradient-to-position); }`);
    else if (kind === "via" && L > 0.55) out.push(`${sel} { --tw-gradient-stops: var(--tw-gradient-from), #162135 var(--tw-gradient-via-position), var(--tw-gradient-to); }`);
  }
}

// ---- arbitrary gradient backgrounds (bg-[linear-gradient(...)]) made only of light colours: dropped so the dark zone shows
{
  const cssEsc = (c) => c.replace(/[^a-zA-Z0-9_-]/g, (ch) => "\\" + ch);
  const list = execSync("grep -rhoE 'bg-\\[(linear|radial)-gradient[^] \"]*\\]' src --include=*.tsx --include=*.ts || true", { maxBuffer: 1 << 26 }).toString().split("\n").filter(Boolean);
  const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  for (const c of [...new Set(list)]) {
    const cols = c.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g) || [];
    if (cols.length && cols.every((h) => lum(hex(h)) > 0.55)) out.push(`${Z} .${cssEsc(c)} { background-image: none; }`);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// White page (2026-11): the page is white and only the raised cards ("islands") are dark. Every rule above, except the
// one that turns white surfaces into dark slabs, now reads var(--dzv-…, <Tailwind's own value>): islands define the
// --dzv-… values (so inside a card the dark colours apply, exactly as before) and on the white page the class keeps its
// original colour. Run scripts/build-dark-zone-sections.mjs first: it lists the stylesheet islands and their values.
{
  const { default: postcss } = await import("postcss");
  const { default: tailwind } = await import("tailwindcss");
  const { createRequire } = await import("node:module");
  const { readFileSync } = await import("node:fs");
  const require = createRequire(import.meta.url);
  const loadConfig = require("tailwindcss/loadConfig");
  const twConfig = loadConfig(new URL("../tailwind.config.ts", import.meta.url).pathname);
  const isl = JSON.parse(readFileSync(new URL("../src/app/dark-zone.islands.json", import.meta.url), "utf8"));
  const hash = (v) => { let h = 2166136261; for (const c of v) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(36); };
  const vars = { ...isl.vars };
  const vname = (prop, v) => { const n = `--dzv-${hash(prop + ":" + v)}`; vars[n] = v; return n; };

  const generated = postcss.parse(out.join("\n"));
  // the original Tailwind declarations for every class used above
  const classes = new Set();
  generated.walkRules((r) => r.selectors.forEach((sel) => { const m = sel.replace(/^\.nx-dz\s+/, "").match(/\.((?:\\.|[\w-])+)/g); (m || []).forEach((c) => classes.add(c.slice(1).replace(/\\(.)/g, "$1"))); }));
  const tw = await postcss([tailwind({ ...twConfig, content: [{ raw: [...classes].join(" ") }], corePlugins: { ...(twConfig.corePlugins || {}), preflight: false } })]).process("@tailwind utilities", { from: undefined });
  const orig = new Map();
  postcss.parse(tw.css).walkRules((r) => { const m = {}; r.walkDecls((d) => { m[d.prop] = d.value; }); r.selectors.forEach((sel) => orig.set(sel.trim(), m)); });

  const SURFACE = new Set(ops.flatMap((o) => variants.map(([p, ps]) => `.${esc(p + "bg-white" + o)}${ps}`)));
  const keep = []; const wrapped = []; let missing = 0;
  generated.walkRules((r) => {
    for (const sel of r.selectors) {
      const key = sel.replace(/^\.nx-dz\s+/, "").trim();
      const decls = []; r.walkDecls((d) => decls.push([d.prop, d.value]));
      if (SURFACE.has(key)) { keep.push(`${sel} { ${decls.map(([p, v]) => `${p}: ${v}`).join("; ")}; }`); continue; }
      const o = orig.get(key) || {};
      const body = decls.map(([p, v]) => {
        if (o[p] === undefined) { missing++; return `${p}: var(${vname(p, v)}, ${p.startsWith("--tw-gradient-stops") ? "var(--tw-gradient-from), var(--tw-gradient-to)" : "revert-layer"})`; }
        return `${p}: var(${vname(p, v)}, ${o[p]})`;
      });
      wrapped.push(`${sel} { ${body.join("; ")}; }`);
    }
  });

  // islands: white surfaces (now dark slabs), the dark heroes, the encyclopedia cards and every stylesheet card
  const ISL = [
    ...ops.map((o) => `.${esc("bg-white" + o)}`),
    ".nx-sky", ".pna-editorial-card", ".pna-editorial-intro-item", ".pna-editorial-toolbar", ".pna-editorial-bottom a", ".pna-editorial-bottom aside",
    ".pna-editorial-no-results", ".pna-editorial-filter", ".dl-tab",
    ...isl.islands,
  ].join(", ");
  const IN = `:is(${ISL}) `; // inside an island
  const scoped = [
    // card text defaults, headings, links, labels, tables and form fields — inside islands only
    `:where(.nx-dz) :where(${ISL}) { ${Object.entries(vars).map(([k, v]) => `${k}: ${v}`).join("; ")}; color: var(--dz-body); }`,
    `.nx-dz ${IN}:is(h1, h2, h3, h4)[class]:not([class*="text-red"]):not([class*="text-rose"]):not([class*="text-amber"]):not([class*="text-white"]), .nx-dz ${IN}:is(h1, h2, h3, h4):not([class]) { color: var(--dz-head); }`,
    `.nx-dz ${IN}a:not([class]) { color: var(--dz-accent-text); text-underline-offset: 3px; }`,
    `.nx-dz a.group:is(${ISL}) strong { color: var(--dz-head); } .nx-dz a.group:is(${ISL}):hover strong { color: var(--dz-accent-text); }`,
    `.nx-dz ${IN}.rounded-full.bg-teal-50 { background: rgba(45, 212, 191, 0.12); color: var(--dz-accent-text); } .nx-dz ${IN}.rounded-full.bg-slate-100 { background: rgba(148, 163, 184, 0.14); color: var(--dz-body); }`,
    `.nx-dz ${IN}table { color: var(--dz-body); } .nx-dz ${IN}th { color: var(--dz-head); } .nx-dz ${IN}:is(td, th) { border-color: var(--dz-line); }`,
    `.nx-dz ${IN}summary { color: var(--dz-head); } .nx-dz ${IN}hr { border-color: var(--dz-line); }`,
    `.nx-dz :is(${ISL}):is(input, select, textarea):not([type="checkbox"]):not([type="radio"]):not([type="range"]), .nx-dz ${IN}:is(input, select, textarea):not([type="checkbox"]):not([type="radio"]):not([type="range"]) { color: var(--dz-head); background-color: #0f1828; border-color: rgba(148, 163, 184, 0.24); box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4); }`,
    `.nx-dz ${IN}:is(input, textarea)::placeholder, .nx-dz :is(${ISL}):is(input, textarea)::placeholder { color: #7c8aa0; } .nx-dz ${IN}option { background: #131d30; color: var(--dz-head); }`,
  ];
  process.stderr.write(`dark zone: ${keep.length} surface rules, ${wrapped.length} colour rules (${missing} declarations without a Tailwind original)\n`);
  process.stdout.write("/* GENERATED by scripts/build-dark-zone-css.mjs: the dark 3D cards on the white page. Run scripts/build-dark-zone-sections.mjs first. Do not edit by hand. */\n@media screen {\n" + [...keep, ...wrapped, ...scoped].join("\n") + "\n}\n");
}
