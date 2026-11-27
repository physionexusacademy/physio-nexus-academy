/**
 * The live checks' pass through the members-only gate (docs/members-only.md). The workflow puts the token in PNA_CI_TOKEN (scripts/ci-members-pass.sh);
 * without it these helpers do nothing, so the scripts behave exactly as before when the site is open or when run by hand.
 * The token travels as the `pna_ci` cookie, which a browser only sends to this site (a header would go to every site a page loads from).
 */
const TOKEN = process.env.PNA_CI_TOKEN || "";
const COOKIE = "pna_ci";

/** Headers to add to a fetch of `url`: the pass only for physionexusacademy.com and its workers.dev address. */
function ciHeaders(url) {
  if (!TOKEN) return {};
  const host = new URL(url).hostname;
  const ours = host === "physionexusacademy.com" || host.endsWith(".physionexusacademy.com") || host.endsWith(".workers.dev");
  return ours ? { cookie: `${COOKIE}=${TOKEN}` } : {};
}

/** Gives a Playwright browser context the pass for the site at `origin`. */
async function addCiCookie(context, origin) {
  if (!TOKEN) return;
  const { hostname, protocol } = new URL(origin);
  await context.addCookies([{ name: COOKIE, value: TOKEN, domain: hostname, path: "/", httpOnly: true, secure: protocol === "https:", sameSite: "Lax" }]);
}

module.exports = { ciHeaders, addCiCookie };
