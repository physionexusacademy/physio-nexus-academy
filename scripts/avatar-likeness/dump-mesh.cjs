const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "web");
const srv = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader("content-type", { ".html": "text/html", ".js": "text/javascript", ".glb": "model/gltf-binary", ".png": "image/png", ".webp": "image/webp", ".json": "application/json" }[path.extname(f)] || "application/octet-stream");
  fs.createReadStream(f).pipe(res);
}).listen(0, async () => {
  const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 900, height: 1100 } });
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 400)));
  await page.goto(`http://127.0.0.1:${srv.address().port}/view.html`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
  const data = await page.evaluate(() => {
    const f = window.H.figure, b = f.body, g = f.mesh.geometry;
    const r = (a, d) => Array.from(a, (v) => Math.round(v * d) / d);
    const uv = g.getAttribute("uv"); const uvs = []; for (let i = 0; i < uv.count; i++) uvs.push(uv.getX(i), uv.getY(i));
    const eg = f.eyes ? f.eyes.geometry : null; let eyes = null;
    if (eg) { const p = eg.getAttribute("position"); eyes = { count: p.count, uv: Array.from({ length: p.count }, (_, i) => [eg.getAttribute("uv").getX(i), eg.getAttribute("uv").getY(i)]) }; }
    return { count: b.count, bind: r(b.bind, 10000), normal: r(b.restNormal, 1000), uv: r(uvs, 100000), index: Array.from(g.index.array), boneOf: b.boneOf, weightOf: r(b.weightOf, 100), eyes, scale: b.scale };
  });
  fs.writeFileSync(path.join(__dirname, "..", "likeness", "mesh.json"), JSON.stringify(data));
  console.log("dumped", data.count, "verts", data.index.length / 3, "tris");
  await browser.close(); srv.close();
});
