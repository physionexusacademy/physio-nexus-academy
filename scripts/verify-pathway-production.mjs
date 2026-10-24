import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

// Browser tooling lives only in the CI runner, never in the website bundle.
const require = createRequire(path.join(process.env.PNA_BROWSER_QA_DIR, "package.json"));
const { chromium } = require("playwright");
const origin = "https://physionexusacademy.com";
const output = "artifacts/pathway-production";
const photos = ["student", "physiotherapist", "workshops", "patient-care"];
const groups = ["learn", "practice", "professional", "care"];
const headings = ["I’m a Student", "I’m a Physiotherapist", "Workshops & Professional Growth", "I Need Physiotherapy"];
const report = { commit: process.env.GITHUB_SHA, origin, assets: [], viewports: [] };
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();

try {
  // Verify the custom Install PNA App button actually invokes the browser's
  // native install prompt when Chromium exposes beforeinstallprompt.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto(`${origin}/?pwa-install-qa=${process.env.GITHUB_SHA}`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      const promptEvent = new Event("beforeinstallprompt", { cancelable: true });
      Object.defineProperties(promptEvent, {
        prompt: { value: async () => { window.__pnaPromptCalled = true; } },
        userChoice: { value: Promise.resolve({ outcome: "accepted" }) }
      });
      window.dispatchEvent(promptEvent);
    });
    await page.getByRole("button", { name: "Open menu" }).click();
    const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
    await mobileNav.getByRole("button", { name: "Install PNA App" }).click();
    await page.waitForFunction(() => window.__pnaPromptCalled === true);
    await page.waitForFunction(() => ![...document.querySelectorAll("button")].some(button => button.textContent?.trim() === "Install PNA App"));
    console.log("PASS: Install PNA App invokes the native Chromium install prompt and handles acceptance");
    await context.close();
  }

  // Verify the supported fallback for browsers that do not expose the prompt.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto(`${origin}/?pwa-fallback-qa=${process.env.GITHUB_SHA}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("button", { name: "Install PNA App" }).click();
    await page.getByRole("dialog", { name: "Add PNA to your device" }).getByText("Install app", { exact: true }).waitFor();
    console.log("PASS: Unsupported-browser install guidance opens from the mobile menu");
    await context.close();
  }

  // iOS cannot be programmatically installed by a website; verify Safari steps.
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
    });
    const page = await context.newPage();
    await page.goto(`${origin}/?pwa-ios-qa=${process.env.GITHUB_SHA}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("button", { name: "Install PNA App" }).click();
    const dialog = page.getByRole("dialog", { name: "Add PNA to your device" });
    await dialog.getByText("Open this website in Safari.").waitFor();
    await dialog.getByText("Tap the Share button.").waitFor();
    await dialog.getByText("Add to Home Screen", { exact: false }).waitFor();
    console.log("PASS: iPhone user-agent receives Safari Add to Home Screen guidance");
    await context.close();
  }

  const request = await browser.newContext();
  for (const photo of photos) {
    const asset = `/images/pathway-backgrounds/${photo}.webp`;
    const response = await request.request.get(origin + asset);
    assert.equal(response.status(), 200, asset);
    assert.match(response.headers()["content-type"], /image\/webp/);
    const bytes = await response.body();
    const original = await fs.readFile(`public${asset}`);
    assert.deepEqual(bytes, original, `Production must serve the supplied bytes: ${photo}`);
    assert.match(response.headers()["cache-control"], /max-age=86400/);
    report.assets.push({ file: photo + ".webp", status: 200, bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"), cacheControl: response.headers()["cache-control"] });
  }
  await request.close();

  for (const width of [360, 390, 430, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 },
      deviceScaleFactor: 1, reducedMotion: "reduce", isMobile: width < 500, hasTouch: width < 500 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${origin}/?pathway-qa=${process.env.GITHUB_SHA}`, { waitUntil: "domcontentloaded" });
    const cards = page.locator(".pna-vision-pathways > button");
    await cards.first().waitFor();
    assert.equal(await cards.count(), 4);
    await page.locator("#pna-sig-heading").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll(".pna-vision-pathway-photo")]
      .length === 4 && [...document.querySelectorAll(".pna-vision-pathway-photo")]
      .every(img => img.complete && img.naturalWidth === 754 && img.naturalHeight === 498));

    const geometry = await cards.evaluateAll(elements => elements.map(card => {
      const img = card.querySelector(".pna-vision-pathway-photo");
      const rect = card.getBoundingClientRect();
      const text = card.children[2].getBoundingClientRect();
      const picture = img.getBoundingClientRect();
      return { title: card.querySelector("strong").textContent, width: rect.width, height: rect.height,
        image: img.getAttribute("src"), objectFit: getComputedStyle(img).objectFit,
        textBottom: text.bottom - rect.top, imageTop: picture.top - rect.top,
        noArtwork: card.querySelector("svg.pna-vision-pathway-art") === null };
    }));
    for (let i = 0; i < 4; i++) {
      assert.equal(geometry[i].image, `/images/pathway-backgrounds/${photos[i]}.webp`);
      assert.equal(geometry[i].objectFit, "contain");
      assert(geometry[i].noArtwork);
      assert(geometry[i].textBottom <= geometry[i].imageTop + 1, `Photo overlaps copy at ${width}px: ${headings[i]}`);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert(!overflow, `Horizontal overflow at ${width}px`);

    const interactions = [];
    for (let i = 0; i < 4; i++) {
      await cards.nth(i).click();
      await page.waitForFunction(title => document.querySelector("#pna-sig-active-heading")?.textContent === title, headings[i]);
      assert.equal(await cards.nth(i).getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator('.pna-vision-pathway[aria-pressed="true"]').count(), 1);
      assert(new URL(page.url()).hash === `#pna-zone-${groups[i]}`);
      const links = await page.locator("#pna-pathway-details .pna-sig-link").evaluateAll(els => els.map(a => a.getAttribute("href")));
      assert(links.length >= 4);
      interactions.push({ pathway: groups[i], selected: true, links });
    }
    await cards.first().click();
    await page.evaluate(() => {
      const top = document.querySelector("#explore-pna").getBoundingClientRect().top + scrollY;
      scrollTo({ top: Math.max(0, top - 78), behavior: "instant" });
    });
    await page.mouse.move(width - 1, 1);
    const whatsapp = page.getByRole("link", { name: "Chat with Physio Nexus Academy on WhatsApp", exact: true });
    assert(await whatsapp.isVisible());
    assert.match(await whatsapp.getAttribute("href"), /^https:\/\/wa\.me\/923489009028/);
    const whatsappClickable = await whatsapp.evaluate(el => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    });
    assert(whatsappClickable, "WhatsApp link must remain unobstructed");
    if (width < 1024) {
      const dock = page.getByRole("navigation", { name: "Mobile quick navigation" });
      assert(await dock.isVisible());
      assert.deepEqual(await dock.locator("a").evaluateAll(els => els.map(a => a.getAttribute("href"))),
        ["/", "/knowledge-hub", "/daily-challenge", "/workshops", "/patient-services"]);
    }
    const screenshot = `pna-pathways-${width}.png`;
    await page.screenshot({ path: path.join(output, screenshot) });
    // Also verify a real navigation through the mobile dock without submitting data.
    if (width === 390) {
      await page.getByRole("navigation", { name: "Mobile quick navigation" }).getByRole("link", { name: "Learn", exact: true }).click();
      await page.waitForURL("**/knowledge-hub");
      assert(await page.locator("main").isVisible());
    }
    assert.deepEqual(errors, [], `Client runtime errors at ${width}px`);
    report.viewports.push({ width, horizontalOverflow: false, geometry, interactions, whatsappClickable, screenshot });
    console.log(`PASS: ${width}px — four original photos, readable copy, four pathway interactions, navigation and screenshot`);
    await context.close();
  }
} finally {
  await fs.writeFile(path.join(output, "verification.json"), JSON.stringify(report, null, 2));
  await browser.close();
}
