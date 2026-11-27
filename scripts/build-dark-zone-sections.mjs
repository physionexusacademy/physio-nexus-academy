// Builds src/app/dark-zone.sections.generated.css: the dark 3D look for the site's own stylesheets.
// Reads every custom stylesheet under src/ and, for each rule that paints a light surface, dark text,
// a light border or a light SVG fill, writes the same rule under .nx-dz with the colour mapped by brightness:
//   light neutral surface -> raised slate surface (cards also get the 3D elevation), light tint -> a faint tint,
//   dark text -> light text (tinted text keeps its hue), light border -> a quiet line.
// Text sitting on a bright, saturated surface in the same rule (aqua buttons, badges) is left as it is.
// Run: node scripts/build-dark-zone-sections.mjs > src/app/dark-zone.sections.generated.css
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import postcss from "postcss";

const SKIP = /dark-zone|light-zone|motion\.css$|easy-touch\.css$/;
const files = execSync("find src -name '*.css'").toString().split("\n").filter((f) => f && !SKIP.test(f)).sort();

const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1], transparent: [0, 0, 0, 0] };
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g;
function parse(c) {
  if (NAMED[c]) return NAMED[c];
  if (c.startsWith("#")) {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((x) => x + x).join("");
    const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return [...n, h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  const m = c.match(/[\d.]+%?/g);
  if (!m) return null;
  const v = m.map((x) => (x.endsWith("%") ? parseFloat(x) / 100 : parseFloat(x)));
  return [v[0], v[1], v[2], v[3] ?? 1];
}
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const sat = ([r, g, b]) => (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
function lighten([r, g, b]) {
  // same hue, bright enough to read on slate (mix towards white, then boost)
  const mx = Math.max(r, g, b) || 1; const k = 235 / mx;
  return `rgb(${[r, g, b].map((v) => Math.round(Math.min(255, v * k * 0.75 + 255 * 0.25))).join(", ")})`;
}
const SURFACE = "#152034";
const tint = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`;

function mapSurfaceColor(c) {
  const p = parse(c); if (!p || p[3] < 0.35) return null;
  if (lum(p) < 0.55 || sat(p) > 0.3) return null;
  return sat(p) > 0.08 ? tint(p, 0.1) : p[3] < 0.75 ? `rgba(26, 38, 60, ${p[3].toFixed(2)})` : SURFACE;
}
function mapGradient(v) {
  let changed = false;
  const out = v.replace(COLOR_RE, (c) => {
    const p = parse(c); if (!p || p[3] === 0 || lum(p) < 0.55 || sat(p) > 0.3) return c;
    changed = true;
    return sat(p) > 0.08 ? tint(p, 0.1) : `rgba(26, 38, 60, ${Math.max(0.5, p[3]).toFixed(2)})`;
  });
  return changed ? out : null;
}
function brightSaturated(v) {
  return (v.match(COLOR_RE) || []).some((c) => { const p = parse(c); return p && p[3] > 0.6 && lum(p) > 0.3 && sat(p) > 0.35; });
}

const out = [];
for (const file of files) {
  const root = postcss.parse(readFileSync(file, "utf8"), { from: file });
  const rules = [];
  const vars = {};
  root.walkDecls((d) => { if (d.prop.startsWith("--") && !vars[d.prop]) vars[d.prop] = d.value.trim(); });
  const resolve = (v) => v.replace(/var\((--[\w-]+)(?:,[^)]*)?\)/g, (m, n) => vars[n] ?? m);
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes/i.test(rule.parent.name)) return;
    for (let a = rule.parent; a; a = a.parent) if (a.type === "atrule" && a.name === "media" && /print/.test(a.params)) return;
    const sels = rule.selectors.filter((s) => !/^(:root|html|body|\*)/.test(s.trim()) && !s.includes("nx-dz") && !s.includes("::-webkit"));
    if (!sels.length) return;
    const decls = {}; rule.walkDecls((d) => { decls[d.prop] = d.clone({ value: resolve(d.value) }); });
    const bgDecl = decls["background"] || decls["background-color"];
    const bgVal = bgDecl?.value ?? "";
    const keepText = bgVal && (brightSaturated(bgVal) || /var\(/.test(bgVal));
    const nd = [];
    const imp = (d) => (d.important ? " !important" : "");
    let surface = false;
    for (const d of Object.values(decls)) {
      if (/var\(/.test(d.value) && !COLOR_RE.test(d.value)) { COLOR_RE.lastIndex = 0; continue; }
      COLOR_RE.lastIndex = 0;
      if (d.prop === "background-color" || (d.prop === "background" && !/gradient|url\(/.test(d.value))) {
        const col = (d.value.match(COLOR_RE) || [])[0]; if (!col) continue;
        const m = mapSurfaceColor(col);
        if (m) { nd.push(`background${d.prop === "background-color" ? "-color" : ""}: ${d.value.replace(col, m)}${imp(d)}`); surface = m === SURFACE; }
      } else if (d.prop === "background" || d.prop === "background-image") {
        const m = mapGradient(d.value); if (m) nd.push(`${d.prop}: ${m}${imp(d)}`);
      } else if (d.prop === "color" && !keepText) {
        const p = parse((d.value.match(COLOR_RE) || [])[0] || ""); if (!p || p[3] < 0.3) continue;
        const L = lum(p);
        if (L < 0.2) nd.push(`color: ${sat(p) > 0.3 ? lighten(p) : L < 0.05 ? "#f1f5f9" : "#cbd5e1"}${imp(d)}`);
        else if (L < 0.32 && sat(p) < 0.25) nd.push(`color: #94a3b8${imp(d)}`);
      } else if (/^border(-(top|right|bottom|left))?(-color)?$/.test(d.prop) || d.prop === "outline-color") {
        const v = d.value.replace(COLOR_RE, (c) => { const p = parse(c); if (!p || lum(p) < 0.5 || p[3] < 0.2 || sat(p) > 0.3) return c; return sat(p) > 0.08 ? tint(p, 0.35) : "rgba(148, 163, 184, 0.2)"; });
        if (v !== d.value) nd.push(`${d.prop}: ${v}${imp(d)}`);
      } else if (d.prop === "fill" || d.prop === "stroke") {
        const p = parse((d.value.match(COLOR_RE) || [])[0] || ""); if (!p) continue;
        if (lum(p) > 0.7 && sat(p) < 0.08) nd.push(`${d.prop}: ${d.prop === "fill" ? "#1e2b42" : "rgba(148, 163, 184, 0.35)"}${imp(d)}`);
        else if (lum(p) < 0.15 && d.prop === "fill") nd.push(`fill: #cbd5e1${imp(d)}`);
      } else if (d.prop === "box-shadow" && /inset[^,]*rgba?\(255, ?255, ?255, ?0?\.[5-9]/.test(d.value)) {
        nd.push(`box-shadow: var(--dz-elev)${imp(d)}`);
      }
    }
    if (surface && decls["border-radius"] && !nd.some((x) => x.startsWith("box-shadow"))) nd.push("box-shadow: var(--dz-elev)");
    if (nd.length) rules.push(`${sels.map((s) => `.nx-dz ${s.trim()}`).join(",\n")} { ${nd.join("; ")}; }`);
  });
  if (rules.length) out.push(`/* ${file} */\n${rules.join("\n")}`);
}
process.stdout.write(`/* GENERATED by scripts/build-dark-zone-sections.mjs: the site's own stylesheets restyled for the dark 3D zone. Do not edit by hand. */\n@media screen {\n${out.join("\n\n")}\n}\n`);
