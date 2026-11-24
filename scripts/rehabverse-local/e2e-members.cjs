/**
 * Members-only website e2e (LOCAL backend, never the real project):
 *   REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs
 *   (dev server as in e2e.cjs, with SUPABASE_SERVICE_ROLE_KEY=local-service-role-key)   node scripts/rehabverse-local/e2e-members.cjs
 * Covers: a new person registers and waits; the admin sees the request in Members access and approves it (WhatsApp link); the waiting person gets the signed approval
 * cookie from the check page; a rejected person sees the reason and gets no cookie; an approved person who is suspended is turned away; someone not signed in is sent to
 * sign in; sign-in of an approved member; the members-only switch asks for confirmation and flips; a phone-width layout. (The Worker's gate itself is tested by
 * validate-site-members.ts and, against a real Worker, by the wrangler run described in docs/members-only.md.)
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3100";
const OUT = process.env.E2E_OUT ?? path.join(process.cwd(), "e2e-out");
fs.mkdirSync(OUT, { recursive: true });
const stamp = Date.now().toString(36);
const ADMIN = { email: "admin@pna.test", password: "AdminPass#2026" };
const mk = (n) => ({ email: `mem${n}.${stamp}@example.test`, password: "Member-pass-2026-x", name: `Member Person ${n} ${stamp}`, phone: `030${n}5551234` });
const A = mk(1), B = mk(2), C = mk(3);
const results = [];
const check = (name, ok, detail = "") => { results.push(Boolean(ok)); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };

async function register(page, who, text = {}) {
  await page.goto(`${BASE}/members?next=%2Flearn`);
  await page.getByTestId("tab-register").click();
  await page.fill("#m-name", who.name); await page.fill("#m-phone", who.phone); await page.selectOption("#m-who", "student");
  await page.fill("#m-email", who.email); await page.fill("#m-pass", who.password);
  await page.getByTestId("members-submit").click();
  await page.waitForURL(/\/members\/waiting/, { timeout: 90000 });
}

(async () => {
  const browser = await chromium.launch();
  const ctx = (vp = { width: 1100, height: 900 }) => browser.newContext({ viewport: vp }).then((c) => { c.setDefaultTimeout(60000); c.setDefaultNavigationTimeout(60000); return c; });
  const errors = [];
  const watch = (p) => p.on("pageerror", (e) => { if (!/ViewTransition opt-in disabled/.test(String(e))) errors.push(e.message); });

  // three people ask for access
  const cA = await ctx(), pA = await cA.newPage(); watch(pA); await register(pA, A);
  const cB = await ctx(), pB = await cB.newPage(); watch(pB); await register(pB, B);
  const cC = await ctx(), pC = await cC.newPage(); watch(pC); await register(pC, C);
  check("M1 Registering sends the person to the waiting page", /member-waiting/.test(await pA.getByTestId("member-waiting").getAttribute("data-testid")) && (await pA.getByTestId("member-waiting").getAttribute("data-status")) === "pending");
  check("M2 …which says the request is with the clinic and offers WhatsApp", /Your request is with the clinic/.test(await pA.locator("body").innerText()) && (await pA.locator("a[href*='wa.me']").count()) >= 1);
  await pA.screenshot({ path: path.join(OUT, "mem1-waiting.png") });

  // before approval the check page does not give a cookie
  await pA.goto(`${BASE}/members/check?next=%2Flearn`);
  await pA.waitForURL(/\/members\/waiting/);
  check("M3 A waiting person gets no approval cookie (the check page sends them back to waiting)", !(await cA.cookies()).some((c) => c.name === "pna_ma"));

  // not signed in at all
  const cN = await ctx(), pN = await cN.newPage();
  await pN.goto(`${BASE}/members/check?next=%2Fskills`);
  await pN.waitForURL(/\/members\?next=%2Fskills/);
  check("M4 Someone who is not signed in is sent to sign in, remembering where they wanted to go", /members only|sirf members/i.test(await pN.locator("body").innerText()));
  await pN.goto(`${BASE}/members/check?next=https%3A%2F%2Fevil.example%2F`);
  await pN.waitForURL(/\/members\?next=%2F$/);
  check("M5 A link to another website is never followed", true);

  // the admin
  const ca = await ctx(), admin = await ca.newPage(); watch(admin);
  await admin.goto(`${BASE}/admin/login`);
  await admin.fill("input[name=email]", ADMIN.email); await admin.fill("input[name=password]", ADMIN.password);
  await admin.locator("form button[type=submit]").first().click();
  await admin.waitForURL((u) => u.pathname === "/admin");
  await admin.goto(`${BASE}/admin/members`);
  await admin.getByTestId("mode-card").waitFor();
  check("M6 Members access shows the switch OFF and the three requests waiting", /OFF: the website is open to everyone/.test(await admin.getByTestId("mode-state").innerText()) && (await admin.getByTestId("member-row").count()) >= 3);
  const rowOf = (who) => admin.getByTestId("member-row").filter({ hasText: who.name });
  await admin.screenshot({ path: path.join(OUT, "mem2-admin.png"), fullPage: true });

  // approve A
  await rowOf(A).getByTestId("approve").click();
  await admin.locator("a[href*='wa.me']").first().waitFor();
  check("M7 Approving offers 'Tell them on WhatsApp'", /is approved/.test(await admin.locator("body").innerText()));
  await pA.reload();
  await pA.waitForURL((u) => u.pathname === "/members/check" || u.pathname === "/learn" || u.pathname === "/", { timeout: 30000 }).catch(() => {});
  // the page redirects approved people to the check page, which sets the cookie and sends them on
  await pA.goto(`${BASE}/members/check?next=%2Flearn`);
  await pA.waitForURL(/\/learn/, { timeout: 60000 });
  const cookie = (await cA.cookies()).find((c) => c.name === "pna_ma");
  check("M8 After approval the check page sets the signed approval cookie and sends the person where they wanted to go", !!cookie && cookie.httpOnly && cookie.secure && /^v1\.[0-9a-f-]{36}\.\d+\./.test(cookie.value) && /\/learn/.test(pA.url()), cookie ? `expires in ${Math.round(cookie.expires - Date.now() / 1000)}s` : "no cookie");

  // reject B with a reason
  await rowOf(B).getByTestId("reject").click();
  check("M9 A rejection cannot be confirmed without a reason", await admin.getByTestId("confirm-reason").isDisabled());
  await admin.locator("input[id^='why-']").fill("We could not verify you");
  await admin.getByTestId("confirm-reason").click();
  await admin.waitForFunction((n) => !document.body.innerText.includes(n) || true, B.name);
  await pB.goto(`${BASE}/members/check?next=%2Flearn`);
  await pB.waitForURL(/\/members\/blocked/);
  const bText = await pB.locator("body").innerText();
  console.log("   (blocked page)", pB.url(), JSON.stringify((await pB.locator("main").innerText().catch(() => "no main")).slice(0, 300)));
  check("M10 A rejected person sees the reason and gets no cookie", /could not be approved/.test(bText) && /We could not verify you/.test(bText) && !(await cB.cookies()).some((c) => c.name === "pna_ma"));

  // approve then suspend C
  await admin.reload();
  await rowOf(C).getByTestId("approve").click();
  await admin.locator("a[href*='wa.me']").first().waitFor();
  await pC.goto(`${BASE}/members/check?next=%2Fskills`);
  await pC.waitForURL(/\/skills/);
  check("M11 A second approved person gets in", (await cC.cookies()).some((c) => c.name === "pna_ma"));
  await admin.goto(`${BASE}/admin/members?status=approved`);
  await rowOf(C).getByTestId("suspend").click();
  await admin.locator("input[id^='why-']").fill("Misuse of the AI chat");
  await admin.getByTestId("confirm-reason").click();
  await admin.goto(`${BASE}/admin/members?status=suspended`);
  check("M12 A suspended person appears under Suspended with their reason", (await rowOf(C).count()) === 1 && /Misuse of the AI chat/.test(await rowOf(C).innerText()));
  await cC.clearCookies({ name: "pna_ma" });
  await pC.goto(`${BASE}/members/check?next=%2Fskills`);
  await pC.waitForURL(/\/members\/blocked/);
  check("M13 A suspended person is turned away and gets no new cookie", /Your access is paused/.test(await pC.locator("body").innerText()) && !(await cC.cookies()).some((c) => c.name === "pna_ma"));

  // sign in again as the approved A
  const cA2 = await ctx(), pA2 = await cA2.newPage();
  await pA2.goto(`${BASE}/members?next=%2Fconditions`);
  await pA2.fill("#m-email", A.email); await pA2.fill("#m-pass", A.password);
  await pA2.getByTestId("members-submit").click();
  await pA2.waitForURL(/\/conditions/, { timeout: 60000 });
  check("M14 An approved member signs in and lands on the page they wanted", (await cA2.cookies()).some((c) => c.name === "pna_ma"));
  const cW = await ctx(), pW = await cW.newPage();
  await pW.goto(`${BASE}/members`);
  await pW.fill("#m-email", A.email); await pW.fill("#m-pass", "wrong-password-123");
  await pW.getByTestId("members-submit").click();
  await pW.locator("[data-testid=members-auth] [role=alert]").waitFor();
  check("M15 A wrong password says so", /not right|sahi nahi/.test(await pW.locator("[data-testid=members-auth] [role=alert]").innerText()));

  // the switch
  await admin.goto(`${BASE}/admin/members`);
  await admin.getByTestId("mode-on").click();
  check("M16 Turning members-only on asks for confirmation first", (await admin.getByTestId("mode-confirm").count()) === 1 && /OFF/.test(await admin.getByTestId("mode-state").innerText()));
  await admin.getByTestId("mode-confirm").click();
  await admin.getByTestId("mode-off").waitFor();
  check("M17 After confirming, the switch shows ON and can be turned off again", /ON: only approved members/.test(await admin.getByTestId("mode-state").innerText()));
  await admin.getByTestId("mode-off").click();
  await admin.getByTestId("mode-on").waitFor();
  check("M18 …and OFF again", /OFF/.test(await admin.getByTestId("mode-state").innerText()));

  // a phone
  const cm = await ctx({ width: 375, height: 800 }), m = await cm.newPage(); watch(m);
  await m.goto(`${BASE}/members`); await m.getByTestId("tab-register").click();
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const tiny = await m.evaluate(() => [...document.querySelectorAll("[data-testid=members-auth] input, [data-testid=members-auth] button, [data-testid=members-auth] select")].filter((e) => e.offsetParent && e.getBoundingClientRect().height < 44).map((e) => e.tagName));
  check("M19 The members' door fits a phone, with 44px-tall fields and buttons", overflow <= 1 && tiny.length === 0, `overflow ${overflow}px; small: ${tiny.join(",")}`);
  await m.screenshot({ path: path.join(OUT, "mem3-phone.png"), fullPage: true });
  check("M20 No page errors in the browser", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\nMembers e2e: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
