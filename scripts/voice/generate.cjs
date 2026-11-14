/**
 * Makes the recordings: reads every sentence listed by collect.mts with Kokoro (a free neural voice, Apache-2.0) in headless Chromium
 * (WASM, nothing leaves the machine) and saves each as raw 16-bit 24 kHz audio in <cache>/<key>.pcm. Resumable: finished sentences are skipped.
 *
 *   node scripts/voice/generate.cjs <sentences.json> <cache-dir> <web-root> [voice=bm_george] [workers=4]
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const [, , listFile, cacheDir, webRoot, voice = "bm_george", workersArg = "4"] = process.argv;
if (!listFile || !cacheDir || !webRoot) throw new Error("usage: generate.cjs <sentences.json> <cache-dir> <web-root> [voice] [workers]");
const PORT = Number(process.env.VOICE_PORT || 8799);
fs.mkdirSync(cacheDir, { recursive: true });
const groups = JSON.parse(fs.readFileSync(listFile, "utf8")).groups;
const jobs = [];
for (const g of groups) g.sentences.forEach((text, i) => { const key = g.keys[i]; if (!fs.existsSync(path.join(cacheDir, key + ".pcm"))) jobs.push({ key, text }); });
console.log(`${jobs.length} sentences to make (${groups.reduce((n, g) => n + g.sentences.length, 0) - jobs.length} already done)`);

(async () => {
  const server = require("http").createServer((req, res) => {
    const file = path.join(webRoot, decodeURIComponent(req.url.split("?")[0]));
    if (!file.startsWith(path.resolve(webRoot)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    const type = file.endsWith(".js") || file.endsWith(".mjs") ? "text/javascript" : file.endsWith(".wasm") ? "application/wasm" : file.endsWith(".html") ? "text/html" : "application/octet-stream";
    res.writeHead(200, { "content-type": type }); fs.createReadStream(file).pipe(res);
  }).listen(PORT, "127.0.0.1");
  const browser = await chromium.launch();
  let next = 0, done = 0; const t0 = Date.now(); let fail = 0;
  async function worker(id) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    // Everything outside this machine is blocked; the voice style file (normally fetched from the model host) is served from disk.
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => {
      const m = route.request().url().match(/voices\/([a-z_]+)\.bin/);
      const f = m && path.join(webRoot, "models/kokoro/voices", m[1] + ".bin");
      if (f && fs.existsSync(f)) return route.fulfill({ body: fs.readFileSync(f), contentType: "application/octet-stream" });
      return route.abort();
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForFunction(() => typeof window.init === "function", null, { timeout: 60000 });
    await page.evaluate((v) => window.init(v), voice);
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        const b64 = await page.evaluate((t) => window.synth(t), job.text);
        fs.writeFileSync(path.join(cacheDir, job.key + ".pcm"), Buffer.from(b64, "base64"));
      } catch (e) { fail++; console.log("FAILED", job.key, job.text.slice(0, 60), String(e).slice(0, 100)); }
      done++;
      if (done % 10 === 0 || done === jobs.length) {
        const el = (Date.now() - t0) / 1000; console.log(`${done}/${jobs.length} done, ${Math.round(el)} s, about ${Math.round((el / done) * (jobs.length - done) / 60)} min left`);
      }
    }
    await ctx.close();
  }
  await Promise.all(Array.from({ length: Number(workersArg) }, (_, i) => worker(i)));
  await browser.close(); server.close();
  console.log(`finished: ${done - fail} made, ${fail} failed`);
})();
