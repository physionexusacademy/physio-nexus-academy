import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const checks = [];
const assert = (name, condition, detail) => {
  checks.push({ name, ok: Boolean(condition), detail });
};

const routePath = "src/app/clinical-registry/page.tsx";
const clientPath = "src/lib/clinical-registry/client.ts";
const securePath = "src/app/clinical-registry/ClinicalRegistrySecureClient.tsx";
const libraryPath = "src/app/clinical-registry/library/page.tsx";
const deployPath = ".github/workflows/deploy-cloudflare-production.yml";

const route = read(routePath);
const client = read(clientPath);
const secure = read(securePath);
const library = read(libraryPath);
const deploy = read(deployPath);

assert(
  "Registry route uses the secure client",
  route.includes('ClinicalRegistrySecureClient') && !route.includes('ClinicalRegistryClient'),
  "The private route must not render the legacy demo client."
);
assert(
  "Legacy demo client is absent",
  !existsSync("src/app/clinical-registry/ClinicalRegistryClient.tsx"),
  "Fabricated demo patients must not return."
);
assert(
  "Browser client uses dedicated Registry variables only",
  client.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL") &&
    client.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY") &&
    !client.includes("NEXT_PUBLIC_SUPABASE_URL") &&
    !client.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") &&
    !client.includes("SERVICE_ROLE"),
  "The Registry client must never fall back to the main PNA Supabase project or a privileged key."
);
assert(
  "Public library uses the dedicated Registry project",
  library.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL") &&
    library.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY") &&
    library.includes('.schema("clinical_api")') &&
    !library.includes("NEXT_PUBLIC_SUPABASE_URL") &&
    !library.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  "The public library must query only the dedicated clinical_api schema."
);
assert(
  "Consent gates remain fail-closed",
  secure.includes("const SIGNED_CONSENT_FORM_APPROVED = false") &&
    secure.includes("const SIGNED_CONSENT_EVIDENCE_WORKFLOW_READY = false"),
  "Do not enable patient creation or public case submission before approvals and hosted acceptance."
);
assert(
  "Privileged roles use trusted app metadata",
  secure.includes('session.user.app_metadata?.registry_role === "operator"') &&
    secure.includes('session.user.app_metadata?.registry_role === "reviewer"'),
  "Operator/reviewer UI must not rely on user-editable metadata."
);
assert(
  "Deployment injects dedicated Registry configuration",
  deploy.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL") &&
    deploy.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY") &&
    deploy.includes("NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION"),
  "Registry configuration must be wired from dedicated build-time secrets/variables."
);

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"}: ${check.name} — ${check.detail}`);
}
if (checks.some((check) => !check.ok)) process.exit(1);
console.log(`Clinical Registry integration checks: ${checks.length}/${checks.length} passed.`);
