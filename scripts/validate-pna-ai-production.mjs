const baseUrl = (process.env.PNA_BASE_URL || "https://physionexusacademy.com").replace(/\/$/, "");

const cases = [
  {
    query: "I want a physiotherapy home visit",
    expectedHref: "/home-visit",
    label: "home-visit navigation",
  },
  {
    query: "I want to book an appointment",
    expectedHref: "/appointment",
    label: "appointment navigation",
  },
  {
    query: "Start daily clinical quiz",
    expectedHref: "/daily-challenge",
    label: "daily quiz navigation",
  },
];

for (const testCase of cases) {
  const response = await fetch(`${baseUrl}/api/physio-nexus-ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: testCase.query }),
    signal: AbortSignal.timeout(20_000),
  });

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`PNA AI returned non-JSON for ${testCase.label} (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(`PNA AI returned HTTP ${response.status} for ${testCase.label}: ${body?.error || "unknown error"}`);
  }

  if (!Array.isArray(body?.resources)) {
    throw new Error(`PNA AI response did not include a resources array for ${testCase.label}.`);
  }

  if (!body.resources.some((resource) => resource?.href === testCase.expectedHref)) {
    const returnedLinks = body.resources.map((resource) => resource?.href).filter(Boolean).join(", ") || "(none)";
    throw new Error(`PNA AI missed ${testCase.label}; expected ${testCase.expectedHref}, got: ${returnedLinks}`);
  }

  console.log(`PNA AI production check passed: ${testCase.label}`);
}

console.log("All PNA AI production navigation checks passed.");
