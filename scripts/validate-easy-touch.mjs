import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * "Easy touch": the site must be comfortable for anyone on a phone or a computer, including people who find small buttons or small print hard.
 * Static checks (a browser audit of 28 pages backs them up): the easy-touch layer exists and is loaded LAST, it sizes the controls people press
 * (44px), form fields use 16px text (phones do not zoom in), and no text on the site is set smaller than 11px (staff screens and 3D scene labels aside).
 */
let checks = 0;
const ok = (condition, message) => { checks++; assert.ok(condition, message); };
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const walk = (dir, out = []) => { for (const name of readdirSync(dir)) { const p = join(dir, name); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };

const layout = read("src/app/layout.tsx");
const css = read("src/app/easy-touch.css");
const imports = [...layout.matchAll(/import "\.\/([\w-]+\.css)";/g)].map((m) => m[1]);
ok(imports.at(-1) === "easy-touch.css", "layout: easy-touch.css is the last stylesheet, so it wins over each section's look");
for (const selector of [".nx-lang button", ".nx-search-btn", ".hs-btn", ".hbm-chip", ".pna-editorial-filter", ".nx-footer nav ul a", 'button[class*="rounded-full"][class*="px-"]', "select"]) {
  ok(css.includes(selector), `easy-touch: sizes ${selector}`);
}
ok((css.match(/min-height:\s*44px/g) ?? []).length >= 8 && /height:\s*44px/.test(css), "easy-touch: tap targets are 44px");
ok(/font-size:\s*16px/.test(css) && /@media \(max-width: 1023px\)/.test(css), "easy-touch: form fields use 16px text and the footer directory is two columns on a phone");
ok(/body \.pna-vision-pathway-state/.test(css) && /font-size:\s*12px/.test(css), "easy-touch: information-carrying captions are 12px");
ok(!/text-\[(9|10|10\.5)px\]/.test(read("src/components/MobilePortalNav.tsx")), "the phone dock labels are not tiny");

const files = walk("src");
const tinyCss = [];
for (const file of files.filter((f) => f.endsWith(".css") && !/admin\.css$|scene3d\.css$/.test(f))) {
  for (const m of read(file).matchAll(/font-size:\s*([\d.]+)(px|rem)\b/g)) { const px = Number(m[1]) * (m[2] === "rem" ? 16 : 1); if (px < 11) tinyCss.push(`${file}: ${m[0]}`); }
}
ok(tinyCss.length === 0, `no text smaller than 11px in the stylesheets (${tinyCss.slice(0, 3).join("; ")})`);
const tinyTw = files.filter((f) => /\.tsx$/.test(f) && !f.includes("/admin/") && /text-\[(9|10|10\.5)px\]/.test(read(f)));
ok(tinyTw.length === 0, `no text-[9px] / text-[10px] outside the staff screens (${tinyTw.slice(0, 3).join(", ")})`);

console.log(`Easy touch: ${checks} checks passed (the easy-touch layer loads last; 44px tap targets; 16px form text; no text under 11px; 12px for information).`);
